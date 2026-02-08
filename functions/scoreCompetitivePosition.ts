// Score products on competitive axes using Gemini 2.0 Flash
// Returns 0-100 percentile scores for user and competitor on each axis

import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";

interface Axis {
    id: string;
    name: string;
    description: string;
}

export default async function handler(req: Request) {
    try {
        const { axes, userProduct, competitor, differentiators = [] } = await req.json();

        const apiKey = Deno.env.get('GEMINI_API_KEY');
        if (!apiKey) {
            return new Response(JSON.stringify({
                error: 'GEMINI_API_KEY not configured'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `Score these two products on competitive dimensions using a 0-100 percentile scale.

DIMENSIONS TO SCORE:
${(axes as Axis[]).map(axis => `- ${axis.name}: ${axis.description}`).join('\n')}

USER'S PRODUCT:
Description: ${userProduct.description || 'Not provided'}
Target audience: ${userProduct.targetPersona || 'Not specified'}
Key differentiators: ${differentiators.length > 0 ? differentiators.join(', ') : 'None specified yet'}

COMPETITOR:
Name: ${competitor.name || 'Unknown'}
Description/Content: ${competitor.content?.substring(0, 2000) || competitor.description || 'Limited information'}

SCORING GUIDANCE:
- Use 0-100 percentile scale (0 = bottom 1%, 100 = top 1%)
- Consider messaging, features, target audience, pricing signals
- Weight user differentiators heavily when relevant to a dimension
- Be realistic: most products score 40-60 on most dimensions
- Only give 80+ scores for clear, exceptional strengths
- Only give <30 scores for clear, significant weaknesses

Return ONLY valid JSON with this exact structure:
{
  "scores": [
    {
      "axisId": "ease_of_use",
      "userScore": 75,
      "competitorScore": 60,
      "reasoning": "User emphasizes onboarding speed in differentiators; competitor has complex setup process visible in their docs"
    }
  ]
}

Provide scores for ALL ${(axes as Axis[]).length} dimensions.
Do not include any markdown formatting, code fences, or explanatory text.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Strip markdown fences if present
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const parsed = JSON.parse(cleaned);

        // Validate structure
        if (!parsed.scores || !Array.isArray(parsed.scores)) {
            throw new Error('Invalid response structure: missing scores array');
        }

        // Ensure all axes are scored
        if (parsed.scores.length !== (axes as Axis[]).length) {
            console.warn(`Expected ${(axes as Axis[]).length} scores, got ${parsed.scores.length}`);
        }

        // Clamp scores to 0-100 range
        parsed.scores = parsed.scores.map((score: any) => ({
            ...score,
            userScore: Math.max(0, Math.min(100, score.userScore || 50)),
            competitorScore: Math.max(0, Math.min(100, score.competitorScore || 50))
        }));

        return new Response(JSON.stringify(parsed), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('scoreCompetitivePosition error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to score competitive position',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
