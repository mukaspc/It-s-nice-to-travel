import { z } from "zod";
import type { APIRoute } from "astro";
import type { PlanListItemDTO, PlanListResponseDTO, PlanDTO } from "../../../types";
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

// Schemat walidacji dla tworzenia nowego planu
const createPlanSchema = z
  .object({
    name: z.string().min(1).max(100, "Nazwa planu nie może przekraczać 100 znaków"),
    start_date: z.string().refine((date) => {
      // Weryfikacja czy to poprawna data
      return !isNaN(Date.parse(date));
    }, "Data rozpoczęcia musi być prawidłową datą"),
    end_date: z.string().refine((date) => {
      // Weryfikacja czy to poprawna data
      return !isNaN(Date.parse(date));
    }, "Data zakończenia musi być prawidłową datą"),
    people_count: z.number().int().min(1).max(99, "Liczba osób musi być między 1 a 99"),
    note: z.string().max(2500, "Notatka nie może przekraczać 2500 znaków").nullable().optional(),
    travel_preferences: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      // Weryfikacja relacji dat: data zakończenia musi być równa lub późniejsza niż data rozpoczęcia
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      return endDate >= startDate;
    },
    {
      message: "Data zakończenia musi być równa lub późniejsza niż data rozpoczęcia",
      path: ["end_date"],
    }
  );

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

/**
 * Endpoint POST /api/plans
 *
 * Tworzy nowy plan podróży dla zalogowanego użytkownika.
 *
 * @param {Object} request - Obiekt żądania HTTP
 * @param {Object} locals - Lokalny kontekst zawierający klienta Supabase
 * @returns {Response} Odpowiedź HTTP z kodem 201 i utworzonym planem lub odpowiednim kodem błędu
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // 1. Wykorzystanie klienta Supabase z lokalnego kontekstu
    const { supabase } = locals;

    // Używamy DEFAULT_USER_ID zamiast pobierania ID z sesji
    const userId = DEFAULT_USER_ID;

    // 2. Parsowanie danych wejściowych
    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // 3. Walidacja danych wejściowych
    const validationResult = createPlanSchema.safeParse(requestData);

    if (!validationResult.success) {
      // Przygotowanie czytelnych komunikatów błędów
      const formattedErrors = validationResult.error.flatten();

      // Utwórz obiekt, który zawiera błędy dla wszystkich pól
      const errorDetails = {
        ...formattedErrors.fieldErrors,
        ...(formattedErrors.formErrors.length > 0 ? { general: formattedErrors.formErrors[0] } : {}),
      };

      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: errorDetails,
        }),
        {
          status: 422,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const validatedData = validationResult.data;

    // 4. Przygotowanie danych do zapisu w bazie
    const planData = {
      name: validatedData.name,
      start_date: validatedData.start_date,
      end_date: validatedData.end_date,
      people_count: validatedData.people_count,
      note: validatedData.note,
      travel_preferences: validatedData.travel_preferences,
      user_id: userId,
      status: "draft" as const, // Ustawienie statusu na 'draft'
    };

    // 5. Zapis nowego planu do bazy danych
    const { data: newPlan, error: dbError } = await supabase
      .from("generated_user_plans")
      .insert(planData)
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);

      // Obsługa różnych rodzajów błędów bazy danych
      if (dbError.code === "23505") {
        // Violation of unique constraint
        return new Response(
          JSON.stringify({
            error: "Plan with this name already exists",
            details: dbError.message,
          }),
          {
            status: 409, // Conflict
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else if (dbError.code === "23503") {
        // Foreign key violation
        return new Response(
          JSON.stringify({
            error: "Referenced entity does not exist",
            details: dbError.message,
          }),
          {
            status: 422, // Unprocessable Entity
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else if (dbError.code === "42P01") {
        // Undefined table
        console.error("Critical database error: Table does not exist", dbError);
      }

      // Ogólny błąd bazy danych
      return new Response(
        JSON.stringify({
          error: "Failed to create plan",
          code: dbError.code,
          message: "An error occurred while saving the plan",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 6. Zwrócenie utworzonego planu jako PlanDTO
    const planResponse: PlanDTO = {
      id: newPlan.id,
      name: newPlan.name,
      start_date: newPlan.start_date,
      end_date: newPlan.end_date,
      people_count: newPlan.people_count,
      note: newPlan.note,
      travel_preferences: newPlan.travel_preferences,
      status: newPlan.status,
      created_at: newPlan.created_at,
      updated_at: newPlan.updated_at,
    };

    return new Response(JSON.stringify(planResponse), {
      status: 201,
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
