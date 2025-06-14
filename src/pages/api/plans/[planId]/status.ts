import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../../db/supabase.client';
import { getUserIdFromLocals } from '../../../../utils/auth';

export const prerender = false;

export const GET: APIRoute = async ({ params, request, locals, cookies }) => {
  try {
    const planId = params.planId;
    if (!planId) {
      return new Response(JSON.stringify({ error: "Plan ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = getUserIdFromLocals(locals);
    
    const supabaseClient = createSupabaseServerInstance({
      headers: request.headers,
      cookies
    });

    const useSSE = new URL(request.url).searchParams.get('sse') === 'true';

    // Check if the client wants SSE updates
    if (useSSE) {
      const headers = {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      };

      const stream = new ReadableStream({
        async start(controller) {
          const sendUpdate = async () => {
            const { data, error } = await supabaseClient
              .from('generated_ai_plans')
              .select('status, estimated_time_remaining')
              .eq('plan_id', planId)
              .single();

            if (error) {
              controller.enqueue(`data: ${JSON.stringify({ error: error.message })}\n\n`);
              controller.close();
              return;
            }

            if (!data) {
              controller.enqueue(`data: ${JSON.stringify({ status: 'not_found' })}\n\n`);
              controller.close();
              return;
            }

            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);

            if (data.status === 'completed' || data.status === 'failed') {
              controller.close();
              return;
            }

            // Wait before next update
            await new Promise(resolve => setTimeout(resolve, 2000));
            await sendUpdate();
          };

          await sendUpdate();
        }
      });

      return new Response(stream, { headers });
    }

    // Normal HTTP request
    const { data, error } = await supabaseClient
      .from('generated_ai_plans')
      .select('status, estimated_time_remaining')
      .eq('plan_id', planId)
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ status: 'not_found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching plan status:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 