import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";
import { isPublicRoute, isProtectedRoute, isAuthRoute } from "../utils/auth-helpers";

export const onRequest = defineMiddleware(async (context, next) => {
  // Dodaj Supabase do context.locals dla kompatybilności wstecznej
  const supabase = createSupabaseServerInstance({
    cookies: context.cookies,
    headers: context.request.headers,
  });
  
  context.locals.supabase = supabase;

  const pathname = context.url.pathname;

  // Skip auth check dla ścieżek publicznych
  if (isPublicRoute(pathname)) {
    return next();
  }

  // IMPORTANT: Zawsze sprawdzamy sesję użytkownika przed innymi operacjami  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Użytkownik jest zalogowany - dodaj do locals
    context.locals.user = {
      email: user.email!,
      id: user.id,
    };
  }

  // Sprawdź czy chroniona trasa wymaga uwierzytelnienia
  if (isProtectedRoute(pathname)) {
    if (!user) {
      // Przekieruj niezalogowanych użytkowników na login z redirect URL
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      return context.redirect(loginUrl);
    }
  }

  // Przekieruj zalogowanych użytkowników ze stron auth na /plans
  if (isAuthRoute(pathname) && user) {
    return context.redirect('/plans');
  }

  return next();
});
