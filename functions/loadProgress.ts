import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { uniqueId } = await req.json();

    if (!uniqueId) {
      return Response.json({ error: 'Missing unique ID' }, { status: 400 });
    }

    // Find saved progress
    const results = await base44.asServiceRole.entities.SavedProgress.filter({
      unique_id: uniqueId
    });

    if (!results || results.length === 0) {
      return Response.json({ error: 'Progress not found or expired' }, { status: 404 });
    }

    const progress = results[0];

    // Check if expired
    const expiresAt = new Date(progress.expires_at);
    if (expiresAt < new Date()) {
      // Delete expired entry
      await base44.asServiceRole.entities.SavedProgress.delete(progress.id);
      return Response.json({ error: 'Progress expired' }, { status: 410 });
    }

    return Response.json({ 
      success: true,
      formData: progress.form_data,
      progressPercentage: progress.progress_percentage
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});