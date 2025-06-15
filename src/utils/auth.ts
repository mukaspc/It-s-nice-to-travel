import { createSupabaseServerInstance } from "../db/supabase.client";
import { UnauthorizedError } from "./errors";

/**
 * Pobiera ID użytkownika z middleware locals (preferowane podejście)
 */
export function getUserIdFromLocals(locals: any): string {
  if (!locals.user || !locals.user.id) {
    throw new UnauthorizedError("User not authenticated");
  }
  return locals.user.id;
}

/**
 * @deprecated Używaj getUserIdFromLocals zamiast tej funkcji
 * Pobiera ID użytkownika z request (legacy dla kompatybilności)
 */
export async function getUserIdFromRequest(request: Request): Promise<string> {
  throw new UnauthorizedError(
    "getUserIdFromRequest is deprecated. Use getUserIdFromLocals with middleware locals instead."
  );
}

// Dodajemy funkcję pomocniczą do weryfikacji w middleware
export async function requireAuth(_request: Request, locals: any): Promise<{ id: string; email: string }> {
  if (!locals.user) {
    throw new UnauthorizedError("Authentication required");
  }

  return {
    id: locals.user.id,
    email: locals.user.email,
  };
}
