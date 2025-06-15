import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";

import type { Database } from "./database.types";

// Sprawdź czy jesteśmy po stronie serwera czy klienta
const isServer = typeof window === "undefined";

// Server-side environment variables (dostępne tylko po stronie serwera)
const getServerSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_KEY;

  if (!supabaseUrl) throw new Error("Missing SUPABASE_URL");
  if (!supabaseKey) throw new Error("Missing SUPABASE_KEY");

  return { supabaseUrl, supabaseKey };
};

// Client-side Supabase client - inicjalizowany lazy
let clientSupabase: ReturnType<typeof createClient<Database>> | null = null;

// Funkcja do inicjalizacji klienta po stronie przeglądarki
export const initializeSupabaseClient = (url: string, key: string) => {
  if (!clientSupabase && !isServer) {
    // Używamy createServerClient również po stronie klienta dla synchronizacji cookies
    clientSupabase = createServerClient<Database>(url, key, {
      cookieOptions: {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        httpOnly: false, // Musi być false po stronie klienta
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dni
      },
      cookies: {
        getAll() {
          // Po stronie klienta pobieramy cookies z document.cookie
          return document.cookie
            .split(";")
            .map((cookie) => {
              const [name, ...rest] = cookie.trim().split("=");
              return { name, value: rest.join("=") };
            })
            .filter((cookie) => cookie.name && cookie.value);
        },
        setAll(cookiesToSet) {
          // Po stronie klienta ustawiamy cookies przez document.cookie
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookieString = `${name}=${value}`;

            if (options?.path) cookieString += `; Path=${options.path}`;
            if (options?.maxAge) cookieString += `; Max-Age=${options.maxAge}`;
            if (options?.sameSite) cookieString += `; SameSite=${options.sameSite}`;
            if (options?.secure) cookieString += `; Secure`;

            document.cookie = cookieString;
          });
        },
      },
    });
  }
  return clientSupabase;
};

// Getter dla klienta Supabase
export const getSupabaseClient = () => {
  if (isServer) {
    // Po stronie serwera nie używamy client-side klienta
    return null;
  }

  if (!clientSupabase) {
    // Jeśli klient nie został zainicjalizowany, zwróć null
    // Będzie zainicjalizowany przez komponent Astro
    return null;
  }

  return clientSupabase;
};

// Eksportujemy getter
export { getSupabaseClient as supabase };

// Server-side Supabase client configuration
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 dni
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

// Server-side instance creator for SSR
export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const { supabaseUrl, supabaseKey } = getServerSupabaseConfig();

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            context.cookies.set(name, value, options);
          } catch (error) {
            // Ignoruj błędy związane z próbą ustawienia cookies po wysłaniu response
            if (error instanceof Error && error.message.includes("response has already been sent")) {
              console.warn(`Cannot set cookie ${name}: response already sent`);
            } else {
              console.error(`Error setting cookie ${name}:`, error);
            }
          }
        });
      },
    },
  });

  return supabase;
};

// Eksportujemy konfigurację dla użycia w komponentach Astro
export const getSupabaseConfig = () => {
  if (isServer) {
    return getServerSupabaseConfig();
  }
  return null;
};
