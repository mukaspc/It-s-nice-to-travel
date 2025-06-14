import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client';
import { SignupSchema } from '../../../schemas/auth';
import { handleAuthError } from '../../../utils/auth-helpers';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    
    // Walidacja danych wejściowych
    const validatedData = SignupSchema.parse(body);
    const { email, password } = validatedData;

    const supabase = createSupabaseServerInstance({ 
      cookies, 
      headers: request.headers 
    });

    // Próba rejestracji bez wymagania weryfikacji emaila (zgodnie z MVP)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Wyłączamy weryfikację emaila dla MVP
        emailRedirectTo: undefined,
      }
    });

    if (error) {
      return handleAuthError(error);
    }

    if (!data.user) {
      return new Response(JSON.stringify({ 
        error: 'Account creation failed' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Sukces - zwracamy informacje o utworzonym koncie
    return new Response(JSON.stringify({ 
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email
      },
      message: 'Account created successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return handleAuthError(error);
  }
}; 