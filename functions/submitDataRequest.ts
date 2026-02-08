import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, requestType, details, verificationAnswer } = await req.json();

    if (!email || !requestType || !verificationAnswer) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user's IP for audit trail
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Detect jurisdiction
    let jurisdiction = 'rest';
    try {
      const geoResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        const countryCode = geoData.country_code;
        const region = geoData.region;

        const euCountries = [
          'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
          'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
          'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
        ];

        if (euCountries.includes(countryCode)) {
          jurisdiction = 'eu';
        } else if (countryCode === 'US' && region === 'California') {
          jurisdiction = 'california';
        } else if (countryCode === 'BR') {
          jurisdiction = 'brazil';
        }
      }
    } catch (err) {
      console.error('Failed to detect jurisdiction:', err);
    }

    // Create request record
    const dataRequest = await base44.asServiceRole.entities.DataRequest.create({
      email,
      request_type: requestType,
      details: details || '',
      verification_answer: verificationAnswer,
      ip_address: ipAddress,
      status: 'pending',
      jurisdiction
    });

    // Get request type label
    const requestLabels = {
      access: 'Access Data',
      delete: 'Delete Data',
      export: 'Export Data',
      correct: 'Correct Data',
      object: 'Object to Processing',
      withdraw: 'Withdraw Consent'
    };

    // Send confirmation email to user
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'Annexa',
      to: email,
      subject: 'Data Request Received - ${requestLabels[requestType]}',
      body: `Hello,

We've received your data request.

Request Type: ${requestLabels[requestType]}
Request ID: ${dataRequest.id}
Status: Pending Verification

To verify your identity, please reply to this email confirming that you submitted this request for Annexa.

Once verified, we'll process your request within the required timeframe based on your jurisdiction.

Best,
The Annexa Team

─────────────────────────────────────────────

Annexa by Vox Animus OÜ
Tallinn, Estonia`
    });

    // Send alert to privacy team
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'Annexa',
      to: 'privacy@vox-animus.com',
      subject: `Data Request: ${requestLabels[requestType]} - ${dataRequest.id}`,
      body: `A data request has been submitted.

Email: ${email}
Type: ${requestLabels[requestType]}
Request ID: ${dataRequest.id}
Jurisdiction: ${jurisdiction}
IP Address: ${ipAddress}

Details: ${details || 'None provided'}

Action required: Verify and process within legal timeframe.

${requestType === 'delete' ? 'Deletion request - process within 30 days.' : ''}
${requestType === 'access' ? 'Access request - fulfill within 30 days.' : ''}

─────────────────────────────────────────────

Annexa by Vox Animus OÜ
Tallinn, Estonia`
    });

    return Response.json({ 
      success: true,
      requestId: dataRequest.id,
      message: 'Request submitted. Check your email for confirmation.'
    });

  } catch (error) {
    console.error('Data request error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});