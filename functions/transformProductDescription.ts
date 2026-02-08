import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const md5 = async (text) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productName, productDescription } = await req.json();

    if (!productName || !productDescription) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate cache key
    const cacheKey = await md5(productName + productDescription);

    // Try to get from cache (use saved progress or similar)
    const cacheData = await base44.asServiceRole.entities.SavedProgress.filter(
      { 
        unique_id: `transform_cache_${cacheKey}`,
        created_by: user.email 
      }
    );

    if (cacheData.length > 0) {
      const cached = cacheData[0];
      const cacheAge = Date.now() - new Date(cached.created_date).getTime();
      if (cacheAge < 3600000) { // 1 hour TTL
        return Response.json({
          introduction: cached.form_data.introduction,
          cached: true
        });
      }
    }

    // Call Gemini to transform the description
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Transform this product description into a privacy policy introduction.

Product name: ${productName}
Description: ${productDescription}

Generate a two-sentence introduction that:
1. States what the company does in clear, factual language
2. Explains the purpose of the privacy policy

Format: '${productName} ("we", "our", or "us") operates [service description]. This Privacy Policy explains how we collect, use, and protect your information when you use our service.'

Keep it professional and concise. Remove marketing language. Focus on what the service actually does.`,
      response_json_schema: {
        type: "object",
        properties: {
          introduction: {
            type: "string",
            description: "The transformed privacy policy introduction"
          }
        }
      }
    });

    const introduction = response.introduction || `${productName} ("we", "our", or "us") operates ${productDescription}. This Privacy Policy explains how we collect, use, and protect your information when you use our service.`;

    // Cache the result
    try {
      await base44.asServiceRole.entities.SavedProgress.create({
        unique_id: `transform_cache_${cacheKey}`,
        email: user.email,
        form_data: { introduction },
        progress_percentage: 100
      });
    } catch (err) {
      console.error('Failed to cache result:', err);
    }

    return Response.json({ introduction });
  } catch (error) {
    console.error('Transform error:', error);
    // Return empty so frontend can use fallback
    return Response.json({ introduction: null, error: error.message }, { status: 500 });
  }
});