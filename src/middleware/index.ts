import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client";
import { isPublicRoute, isProtectedRoute, isAuthRoute } from "../utils/auth-helpers";

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  
  // Dla API routes, używamy uproszczonej obsługi auth
  if (pathname.startsWith('/api/')) {
    // Skip auth check dla publicznych API routes
    if (isPublicRoute(pathname)) {
      return next();
    }
    
    // Dla chronionych API routes, sprawdź auth bez ustawiania cookies
    if (isProtectedRoute(pathname)) {
      try {
        const supabase = createSupabaseServerInstance({
          cookies: context.cookies,
          headers: context.request.headers,
        });
        
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          context.locals.user = {
            email: user.email!,
            id: user.id,
          };
        } else {
          // Zwróć 401 dla API routes zamiast przekierowania
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        console.error('Auth error in API middleware:', error);
        return new Response(JSON.stringify({ error: 'Authentication failed' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    return next();
  }

  // Dla stron (nie API), używamy pełnej obsługi auth z cookies
  const supabase = createSupabaseServerInstance({
    cookies: context.cookies,
    headers: context.request.headers,
  });
  
  context.locals.supabase = supabase;

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
