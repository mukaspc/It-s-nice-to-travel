import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client';
import { handleAuthError } from '../../../utils/auth-helpers';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ 
      cookies, 
      headers: request.headers 
    });

    // Wylogowanie użytkownika
    const { error } = await supabase.auth.signOut();

    if (error) {
      return handleAuthError(error);
    }

    // Sukces - wylogowanie zakończone
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Logged out successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return handleAuthError(error);
  }
}; 