import { z } from "zod";
import { UnauthorizedError } from "./errors";

/**
 * Mapuje błędy Supabase na bardziej user-friendly komunikaty
 */
export function mapSupabaseError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Invalid email or password";
  }
  if (message.includes("User already registered")) {
    return "An account with this email already exists";
  }
  if (message.includes("Password should be at least")) {
    return "Password does not meet security requirements";
  }
  if (message.includes("Email not confirmed")) {
    return "Please verify your email address";
  }
  if (message.includes("Invalid email")) {
    return "Please enter a valid email address";
  }
  return message;
}

/**
 * Obsługuje błędy w endpointach auth
 */
export function handleAuthError(error: unknown): Response {
  console.error("Auth error:", error);

  if (error instanceof z.ZodError) {
    return new Response(
      JSON.stringify({
        error: "Form data is invalid",
        details: error.errors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (error instanceof UnauthorizedError) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Supabase Auth errors mapping
  if (error && typeof error === "object" && "message" in error) {
    return new Response(
      JSON.stringify({
        error: mapSupabaseError(error.message as string),
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      error: "An unexpected error occurred",
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Sprawdza czy trasa jest publiczna
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = ["/", "/login", "/signup", "/password-reset", "/about", "/api/health"];
  return publicRoutes.includes(pathname) || pathname.startsWith("/api/auth/");
}

/**
 * Sprawdza czy trasa wymaga uwierzytelnienia
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ["/plans", "/profile", "/api/plans", "/api/user"];
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Sprawdza czy trasa jest stroną auth
 */
export function isAuthRoute(pathname: string): boolean {
  const authRoutes = ["/login", "/signup", "/password-reset"];
  return authRoutes.includes(pathname);
}
