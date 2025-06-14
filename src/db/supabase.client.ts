import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from 'astro';
import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';

import type { Database } from "./database.types";

// Sprawdź czy jesteśmy po stronie serwera czy klienta
const isServer = typeof window === 'undefined';

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
    clientSupabase = createClient<Database>(url, key);
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
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'lax',
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(';').map((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    return { name, value: rest.join('=') };
  });
}

// Server-side instance creator for SSR
export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
}) => {
  const { supabaseUrl, supabaseKey } = getServerSupabaseConfig();
  
  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return parseCookieHeader(context.headers.get('Cookie') ?? '');
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return supabase;
};

// Eksportujemy konfigurację dla użycia w komponentach Astro
export const getSupabaseConfig = () => {
  if (isServer) {
    return getServerSupabaseConfig();
  }
  return null;
};
