import { z } from "zod";
import type { APIRoute } from "astro";
import type { PlanListItemDTO, PlanListResponseDTO, PlanStatus } from "../../../types";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { getUserIdFromLocals } from "../../../utils/auth";

// Walidacja parametrów zapytania
const queryParamsSchema = z.object({
  sort: z.enum(["created_at.desc", "created_at.asc", "name.asc", "name.desc"]).optional().default("created_at.desc"),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) || parsed <= 0 ? 10 : Math.min(parsed, 50);
    }),
  offset: z
    .string()
    .optional()
    .default("0")
    .transform((val) => {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    }),
  search: z.string().optional(),
  status: z
    .string()
    .optional()
    .transform((val) => (val ? (val.split(",") as PlanStatus[]) : undefined)),
});

// Typ dla dozwolonych pól sortowania
type SortableField = "created_at" | "name";

// Schemat walidacji dla tworzenia nowego planu
const createPlanSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  people_count: z.number().min(1, "At least 1 person is required").max(99, "Maximum 99 people allowed"),
  note: z.string().max(2500, "Note must be at most 2500 characters").nullable(),
  travel_preferences: z.string().max(2500, "Travel preferences must be at most 2500 characters").nullable(),
});

export const prerender = false;

export const GET: APIRoute = async ({ request, locals, cookies }) => {
  try {
    // 1. Pobierz i zwaliduj parametry zapytania
    const url = new URL(request.url);
    const queryParamsResult = queryParamsSchema.safeParse(Object.fromEntries(url.searchParams));

    if (!queryParamsResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: queryParamsResult.error.format(),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const queryParams = queryParamsResult.data;

    // 2. Pobierz ID zalogowanego użytkownika
    const userId = getUserIdFromLocals(locals);

    // 3. Utwórz instancję Supabase dla serwera
    const supabaseClient = createSupabaseServerInstance({
      headers: request.headers,
      cookies
    });

    // 4. Przygotowanie zapytania do bazy danych
    // Optymalizacja: Używając CTE (Common Table Expression) razem z COUNT możemy wykonać
    // bardziej efektywne zapytanie do bazy danych
    let query = supabaseClient
      .from("generated_user_plans")
      .select(
        `
        id, name, start_date, end_date, people_count, note, travel_preferences, 
        status, created_at, updated_at,
        places_count:places(count)
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .is("deleted_at", null);

    // Dodanie wyszukiwania jeśli podano parametr search
    if (queryParams.search) {
      query = query.ilike("name", `%${queryParams.search}%`);
    }

    // Dodanie filtrowania po statusie
    if (queryParams.status && queryParams.status.length > 0) {
      query = query.in("status", queryParams.status);
    }

    // Dodanie sortowania
    const [sortField, sortOrder] = queryParams.sort.split(".");
    query = query.order(sortField as SortableField, { ascending: sortOrder === "asc" });

    // Wykonanie zapytania z paginacją
    const {
      data: plans,
      count,
      error,
    } = await query.range(queryParams.offset, queryParams.offset + queryParams.limit - 1);

    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch plans" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Przygotowanie odpowiedzi
    const totalCount = count || 0;
    const pageCount = Math.ceil(totalCount / queryParams.limit);

    // Transformacja wyników do odpowiedniego formatu DTO
    const planItems = (plans || []).map((plan) => ({
      id: plan.id,
      name: plan.name,
      start_date: plan.start_date,
      end_date: plan.end_date,
      people_count: plan.people_count,
      note: plan.note,
      travel_preferences: plan.travel_preferences,
      status: plan.status,
      created_at: plan.created_at,
      updated_at: plan.updated_at,
      // Poprawne pobieranie liczby miejsc - SupabaseJS zwraca tablicę wyników dla relacji
      places_count: Array.isArray(plan.places_count) ? plan.places_count[0]?.count || 0 : 0,
    }));

    const response: PlanListResponseDTO = {
      data: planItems,
      meta: {
        total_count: totalCount,
        page_count: pageCount,
      },
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

/**
 * Endpoint POST /api/plans
 *
 * Tworzy nowy plan podróży dla zalogowanego użytkownika.
 *
 * @param {Object} request - Obiekt żądania HTTP
 * @param {Object} locals - Lokalny kontekst zawierający klienta Supabase
 * @returns {Response} Odpowiedź HTTP z kodem 201 i utworzonym planem lub odpowiednim kodem błędu
 */
export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    // 1. Pobierz ID zalogowanego użytkownika
    const userId = getUserIdFromLocals(locals);

    // 2. Utwórz instancję Supabase dla serwera
    const supabaseClient = createSupabaseServerInstance({
      headers: request.headers,
      cookies
    });

    // 3. Validate request body
    const body = await request.json();
    const validationResult = createPlanSchema.safeParse(body);

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

    // 5. Create plan in database
    const now = new Date().toISOString();
    const { data: plan, error } = await supabaseClient
      .from("generated_user_plans")
      .insert({
        name: data.name,
        start_date: data.start_date,
        end_date: data.end_date,
        people_count: data.people_count,
        note: data.note,
        travel_preferences: data.travel_preferences,
        status: "draft",
        user_id: userId,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: "Failed to create plan" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(plan), {
      status: 201,
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
