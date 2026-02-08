import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { country } = await req.json();
    
    const jurisdiction = getJurisdiction(country);
    
    return Response.json({ jurisdiction });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getJurisdiction(country) {
  if (!country) return 'generic';
  
  const countryLower = country.toLowerCase();
  
  // United States
  if (countryLower.includes('united states') || countryLower.includes('usa') || countryLower === 'us') {
    return 'us';
  }
  
  // European Union countries
  const euCountries = [
    'austria', 'belgium', 'bulgaria', 'croatia', 'cyprus', 'czech', 'denmark',
    'estonia', 'finland', 'france', 'germany', 'greece', 'hungary', 'ireland',
    'italy', 'latvia', 'lithuania', 'luxembourg', 'malta', 'netherlands',
    'poland', 'portugal', 'romania', 'slovakia', 'slovenia', 'spain', 'sweden'
  ];
  
  if (euCountries.some(eu => countryLower.includes(eu))) {
    return 'eu';
  }
  
  // United Kingdom
  if (countryLower.includes('united kingdom') || countryLower.includes('uk') || 
      countryLower.includes('england') || countryLower.includes('scotland') || 
      countryLower.includes('wales') || countryLower.includes('northern ireland')) {
    return 'uk';
  }
  
  // Canada
  if (countryLower.includes('canada')) {
    return 'ca';
  }
  
  // Australia
  if (countryLower.includes('australia')) {
    return 'au';
  }
  
  // Brazil
  if (countryLower.includes('brazil') || countryLower.includes('brasil')) {
    return 'br';
  }
  
  return 'generic';
}