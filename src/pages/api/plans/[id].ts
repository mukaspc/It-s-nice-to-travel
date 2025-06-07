import type { APIRoute } from "astro";
import { z } from "zod";
import type { PlanDTO } from "../../../types";
import { supabase } from "../../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

const updatePlanSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  people_count: z.number().min(1, "At least 1 person is required").max(99, "Maximum 99 people allowed"),
  note: z.string().max(2500, "Note must be at most 2500 characters").nullable(),
  travel_preferences: z.string().max(2500, "Travel preferences must be at most 2500 characters").nullable(),
});

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    // 1. Validate plan ID
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Plan ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Check if plan exists and belongs to user
    const { data: existingPlan, error: fetchError } = await supabase
      .from("generated_user_plans")
      .select("id")
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
      .single();

    if (fetchError || !existingPlan) {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Validate request body
    const body = await request.json();
    const validationResult = updatePlanSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid data", details: validationResult.error.issues }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = validationResult.data;

    // 4. Validate date range
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    if (endDate < startDate) {
      return new Response(JSON.stringify({ error: "End date must be after start date" }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Update plan
    const { data: plan, error: updateError } = await supabase
      .from("generated_user_plans")
      .update({
        name: data.name,
        start_date: data.start_date,
        end_date: data.end_date,
        people_count: data.people_count,
        note: data.note,
        travel_preferences: data.travel_preferences,
        status: "draft", // Reset to draft when modified as per business logic
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
      .select()
      .single();

    if (updateError) {
      console.error("Database error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update plan" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(plan), {
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

export const GET: APIRoute = async ({ params }) => {
  try {
    // 1. Validate plan ID
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Plan ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Fetch plan with places and check access
    const { data: plan, error } = await supabase
      .from("generated_user_plans")
      .select(`
        *,
        places(*),
        has_generated_plan:generated_ai_plans(id)
      `)
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
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

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Plan ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // First check if the plan exists and belongs to the user
    const { data: plan, error: fetchError } = await supabase
      .from("generated_user_plans")
      .select("id")
      .eq("id", id)
      .eq("user_id", DEFAULT_USER_ID)
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
      .eq("user_id", DEFAULT_USER_ID);

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