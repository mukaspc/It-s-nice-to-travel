import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../../db/supabase.client";
import { AIPlanGenerationService } from "../../../../services/ai-plan-generation.service";
import { getUserIdFromLocals } from "../../../../utils/auth";
import { ValidationError, ConflictError, NotFoundError, ForbiddenError } from "../../../../utils/errors";

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals, cookies }) => {
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

    const service = new AIPlanGenerationService();
    const result = await service.initializeGeneration({ planId, userId }, { headers: request.headers, cookies });

    return new Response(JSON.stringify(result), {
      status: 202,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

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

    if (error instanceof ConflictError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Unexpected error during plan generation:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
