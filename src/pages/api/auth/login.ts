import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client';
import { LoginSchema } from '../../../schemas/auth';
import { handleAuthError } from '../../../utils/auth-helpers';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    
    // Walidacja danych wejściowych
    const validatedData = LoginSchema.parse(body);
    const { email, password, rememberMe } = validatedData;

    const supabase = createSupabaseServerInstance({ 
      cookies, 
      headers: request.headers 
    });

    // Próba logowania
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return handleAuthError(error);
    }

    if (!data.user) {
      return new Response(JSON.stringify({ 
        error: 'Login failed' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sukces - zwracamy informacje o użytkowniku
    return new Response(JSON.stringify({ 
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return handleAuthError(error);
  }
}; 