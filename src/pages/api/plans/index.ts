import { z } from "zod";
import type { APIRoute } from "astro";
import type { PlanListItemDTO, PlanListResponseDTO } from "../../../types";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

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
});

// Typ dla dozwolonych pól sortowania
type SortableField = "created_at" | "name";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
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

    // 2. Wykorzystanie klienta Supabase z lokalnego kontekstu
    const { supabase } = locals;

    // Używamy DEFAULT_USER_ID zamiast pobierania ID z sesji
    const userId = DEFAULT_USER_ID;

    // 3. Przygotowanie zapytania do bazy danych
    // Optymalizacja: Używając CTE (Common Table Expression) razem z COUNT możemy wykonać
    // bardziej efektywne zapytanie do bazy danych
    let query = supabase
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
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // 4. Transformacja wyników do odpowiedniego formatu DTO
    const totalCount = count || 0;

    // Optymalizacja: Bardziej efektywny sposób mapowania wyników
    const planItems: PlanListItemDTO[] = plans.map((plan) => ({
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
      places_count: plan.places_count?.[0]?.count || 0,
    }));

    // Obliczanie liczby stron na podstawie limitów i całkowitej liczby wyników
    const pageCount = Math.ceil(totalCount / queryParams.limit);

    const response: PlanListResponseDTO = {
      data: planItems,
      meta: {
        total_count: totalCount,
        page_count: pageCount,
      },
    };

    // 5. Zwróć odpowiedź
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
