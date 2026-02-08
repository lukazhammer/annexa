import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get client IP from request headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // If localhost or unknown, return null
    if (clientIp === 'unknown' || clientIp.startsWith('127.') || clientIp.startsWith('192.168.') || clientIp.startsWith('10.')) {
      return Response.json({ 
        jurisdiction: null,
        country: null,
        countryCode: null,
        region: null
      });
    }

    // Use ipapi.co for geolocation (free tier: 1000 req/day)
    const geoResponse = await fetch(`https://ipapi.co/${clientIp}/json/`);
    
    if (!geoResponse.ok) {
      return Response.json({ jurisdiction: null, country: null, countryCode: null });
    }

    const geoData = await geoResponse.json();
    
    // Determine jurisdiction
    let jurisdiction = 'rest';
    const countryCode = geoData.country_code;
    const region = geoData.region;

    // EU countries
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

    return Response.json({
      jurisdiction,
      country: geoData.country_name,
      countryCode,
      region
    });

  } catch (error) {
    // Return null on error, don't break the app
    return Response.json({ 
      jurisdiction: null, 
      country: null,
      countryCode: null,
      error: error.message 
    });
  }
});