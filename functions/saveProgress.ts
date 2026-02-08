import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, formData, progressPercentage } = await req.json();

    if (!email || !formData) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique ID
    const uniqueId = crypto.randomUUID();

    // Calculate expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Save to database
    await base44.asServiceRole.entities.SavedProgress.create({
      unique_id: uniqueId,
      email,
      form_data: formData,
      progress_percentage: progressPercentage,
      expires_at: expiresAt.toISOString()
    });

    // Get app URL from environment or construct it
    const appUrl = Deno.env.get('APP_URL') || 'https://your-app-url.com';
    const resumeLink = `${appUrl}/form?resume=${uniqueId}`;

    // Send email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: 'Your Annexa Draft Is Waiting',
      body: `Hi there,

You're ${progressPercentage || 0}% done with your document set.

Continue where you left off:
${resumeLink}

Your draft will be saved for 7 days.

Best,
The Annexa Team

─────────────────────────────────────────────

Annexa by Vox Animus OÜ
Tallinn, Estonia

These are professional templates. Most founders have 
them reviewed by a lawyer before going live.`,
      from_name: 'Annexa'
    });

    return Response.json({ 
      success: true, 
      uniqueId,
      resumeLink 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});