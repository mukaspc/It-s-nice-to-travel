import type { APIRoute } from "astro";
import { z } from "zod";
import type { PlaceDTO } from "../../../../../types";
import { createSupabaseServerInstance } from "../../../../../db/supabase.client";
import { getUserIdFromLocals } from "../../../../../utils/auth";

const updatePlaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  note: z.string().max(2500, "Note must be at most 2500 characters").nullable(),
});

export const PUT: APIRoute = async ({ params, request, locals, cookies }) => {
  try {
    const { planId, placeId } = params;
    if (!planId || !placeId) {
      return new Response(JSON.stringify({ error: "Plan ID and Place ID are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = getUserIdFromLocals(locals);
    
    const supabaseClient = createSupabaseServerInstance({
      headers: request.headers,
      cookies
    });

    // First check if the plan exists and belongs to the user
    const { data: plan, error: planError } = await supabaseClient
      .from("generated_user_plans")
      .select("id, start_date, end_date")
      .eq("id", planId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if the place exists and belongs to the plan
    const { data: existingPlace, error: placeError } = await supabaseClient
      .from("places")
      .select("id")
      .eq("id", placeId)
      .eq("plan_id", planId)
      .single();

    if (placeError || !existingPlace) {
      return new Response(JSON.stringify({ error: "Place not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate request body
    const body = await request.json();
    const validationResult = updatePlaceSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(JSON.stringify({ error: "Invalid data", details: validationResult.error.issues }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = validationResult.data;

    // Validate date range
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    const planStartDate = new Date(plan.start_date);
    const planEndDate = new Date(plan.end_date);

    if (endDate < startDate) {
      return new Response(JSON.stringify({ error: "End date must be after start date" }), {
        status: 422,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (startDate < planStartDate || endDate > planEndDate) {
      return new Response(
        JSON.stringify({ error: "Place dates must be within the plan's date range" }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update place
    const { data: updatedPlace, error: updateError } = await supabaseClient
      .from("places")
      .update({
        name: data.name,
        start_date: data.start_date,
        end_date: data.end_date,
        note: data.note,
        updated_at: new Date().toISOString(),
      })
      .eq("id", placeId)
      .eq("plan_id", planId)
      .select()
      .single();

    if (updateError) {
      console.error("Database error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update place" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(updatedPlace), {
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

export const DELETE: APIRoute = async ({ params, request, locals, cookies }) => {
  try {
    const { planId, placeId } = params;
    if (!planId || !placeId) {
      return new Response(JSON.stringify({ error: "Plan ID and Place ID are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = getUserIdFromLocals(locals);
    
    const supabaseClient = createSupabaseServerInstance({
      headers: request.headers,
      cookies
    });

    // First check if the plan exists and belongs to the user
    const { data: plan, error: planError } = await supabaseClient
      .from("generated_user_plans")
      .select("id")
      .eq("id", planId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ error: "Plan not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if the place exists and belongs to the plan
    const { data: existingPlace, error: placeError } = await supabaseClient
      .from("places")
      .select("id")
      .eq("id", placeId)
      .eq("plan_id", planId)
      .single();

    if (placeError || !existingPlace) {
      return new Response(JSON.stringify({ error: "Place not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete place
    const { error: deleteError } = await supabaseClient
      .from("places")
      .delete()
      .eq("id", placeId)
      .eq("plan_id", planId);

    if (deleteError) {
      console.error("Database error:", deleteError);
      return new Response(JSON.stringify({ error: "Failed to delete place" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}; 