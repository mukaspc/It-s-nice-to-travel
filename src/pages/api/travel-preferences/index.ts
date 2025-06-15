import { createSupabaseServerInstance } from "../../../db/supabase.client";
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals, cookies }) => {
  try {
    const supabaseClient = createSupabaseServerInstance({
      headers: request.headers,
      cookies,
    });

    const { data, error } = await supabaseClient
      .from("travel_preferences")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch travel preferences" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(data), {
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
