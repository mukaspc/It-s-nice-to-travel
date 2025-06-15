import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../../db/supabase.client";
import { getUserIdFromLocals } from "../../../../utils/auth";
import { NotFoundError, ForbiddenError } from "../../../../utils/errors";

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
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the generated plan
    const { data: generatedPlan, error } = await supabaseClient
      .from("generated_ai_plans")
      .select("*")
      .eq("plan_id", planId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !generatedPlan) {
      return new Response(JSON.stringify({ error: "Generated plan not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(generatedPlan), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
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

    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
