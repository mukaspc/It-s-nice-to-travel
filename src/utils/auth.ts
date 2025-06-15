import { UnauthorizedError } from "./errors";

// Type for Astro locals based on App.Locals interface
interface AuthLocals {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Pobiera ID użytkownika z middleware locals (preferowane podejście)
 */
export function getUserIdFromLocals(locals: AuthLocals): string {
  if (!locals.user || !locals.user.id) {
    throw new UnauthorizedError("User not authenticated");
  }
  return locals.user.id;
}

/**
 * @deprecated Używaj getUserIdFromLocals zamiast tej funkcji
 * Pobiera ID użytkownika z request (legacy dla kompatybilności)
 */
export async function getUserIdFromRequest(_request: Request): Promise<string> {
  throw new UnauthorizedError(
    "getUserIdFromRequest is deprecated. Use getUserIdFromLocals with middleware locals instead."
  );
}

// Dodajemy funkcję pomocniczą do weryfikacji w middleware
export async function requireAuth(_request: Request, locals: AuthLocals): Promise<{ id: string; email: string }> {
  if (!locals.user) {
    throw new UnauthorizedError("Authentication required");
  }

  return {
    id: locals.user.id,
    email: locals.user.email,
  };
}
