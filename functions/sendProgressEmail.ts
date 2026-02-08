import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, resumeLink, progressPercentage, productName } = await req.json();

    if (!email || !resumeLink) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await base44.integrations.Core.SendEmail({
      to: email,
      subject: `Your Annexa Draft Is Waiting`,
      body: `Hi there,

You're ${progressPercentage || 0}% done with your document set${productName ? ` for ${productName}` : ''}.

Continue where you left off:
${resumeLink}

Your draft will be saved for 7 days.

Best,
The Annexa Team

─────────────────────────────────────────────

Annexa by Vox Animus OÜ
Tallinn, Estonia

These are professional templates. Most founders have 
them reviewed by a lawyer before going live.`
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});