import type { APIRoute } from "astro";
import { z } from "zod";
import type { PlanDTO } from "../../../types";
import { supabase } from "../../../db/supabase.client";
import { getUserIdFromLocals } from "../../../utils/auth";

const updatePlanSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  people_count: z.number().min(1, "At least 1 person is required").max(99, "Maximum 99 people allowed"),
  note: z.string().max(2500, "Note must be at most 2500 characters").nullable(),
  travel_preferences: z.string().max(2500, "Travel preferences must be at most 2500 characters").nullable(),
});

export const PUT: APIRoute = async ({ params, request, locals }) => {
  try {
    // 1. Validate plan ID
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Plan ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Get user ID from middleware
    const userId = getUserIdFromLocals(locals);

    // 3. Check if plan exists and belongs to user
    const { data: existingPlan, error: fetchError } = await supabase
      .from("generated_user_plans")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingPlan) {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Validate request body
    const body = await request.json();
    const validationResult = updatePlanSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid data", details: validationResult.error.issues }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = validationResult.data;

    // 5. Validate date range
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    if (endDate < startDate) {
      return new Response(JSON.stringify({ error: "End date must be after start date" }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 6. Update plan
    const { data: updatedPlan, error: updateError } = await supabase
      .from("generated_user_plans")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Database error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update plan" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(updatedPlan), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // 1. Validate plan ID
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Plan ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Get user ID from middleware
    const userId = getUserIdFromLocals(locals);

    // 3. Fetch plan with places and check access
    const { data: plan, error } = await supabase
      .from("generated_user_plans")
      .select(`
        *,
        places(*),
        has_generated_plan:generated_ai_plans(id)
      `)
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch plan" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!plan) {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Transform response to match API schema
    const response: PlanDTO & { places: any[]; has_generated_plan: boolean } = {
      ...plan,
      has_generated_plan: Array.isArray(plan.has_generated_plan) && plan.has_generated_plan.length > 0,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Plan ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user ID from middleware
    const userId = getUserIdFromLocals(locals);

    // First check if the plan exists and belongs to the user
    const { data: plan, error: fetchError } = await supabase
      .from("generated_user_plans")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (fetchError || !plan) {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Perform soft delete by setting deleted_at timestamp
    const { error: deleteError } = await supabase
      .from("generated_user_plans")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Database error:", deleteError);
      return new Response(JSON.stringify({ error: "Failed to delete plan" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return 204 No Content as specified in the API plan
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}; 