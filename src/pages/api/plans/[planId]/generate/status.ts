import type { APIRoute } from "astro";
import { getUserIdFromLocals } from "../../../../../utils/auth";
import { createSupabaseServerInstance } from "../../../../../db/supabase.client";
import { NotFoundError, ForbiddenError } from "../../../../../utils/errors";

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

    let userId;
    try {
      userId = getUserIdFromLocals(locals);
    } catch (authError) {
      console.error("Auth error in status endpoint:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createSupabaseServerInstance({
      headers: request.headers,
      cookies,
    });

    // First check if the plan exists and belongs to the user
    const { data: plan, error: planError } = await supabaseClient
      .from("generated_user_plans")
      .select("id")
      .eq("id", planId)
      .eq("user_id", userId)
      .single();

    if (planError || !plan) {
      throw new NotFoundError("Plan not found");
    }

    // Get the generation status
    const { data: generationStatus, error: statusError } = await supabaseClient
      .from("generated_ai_plans")
      .select("status, estimated_time_remaining")
      .eq("plan_id", planId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (statusError) {
      throw new NotFoundError("No generation process found for this plan");
    }

    // Calculate progress based on estimated time remaining
    const initialTime = 90; // 90 seconds initial estimate
    const timeRemaining = generationStatus.estimated_time_remaining || 0;
    const progress = Math.max(0, Math.min(100, ((initialTime - timeRemaining) / initialTime) * 100));

    return new Response(
      JSON.stringify({
        status: generationStatus.status,
        progress: Math.round(progress),
        estimated_time_remaining: generationStatus.estimated_time_remaining,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (error instanceof ForbiddenError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Unexpected error during fetching generation status:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
