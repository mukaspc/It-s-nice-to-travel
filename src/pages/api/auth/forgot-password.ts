import type { APIRoute } from 'astro';
import { createSupabaseServerInstance } from '../../../db/supabase.client';
import { ForgotPasswordSchema } from '../../../schemas/auth';
import { handleAuthError } from '../../../utils/auth-helpers';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, url }) => {
  try {
    const body = await request.json();
    
    // Walidacja danych wejściowych
    const validatedData = ForgotPasswordSchema.parse(body);
    const { email } = validatedData;

    const supabase = createSupabaseServerInstance({ 
      cookies, 
      headers: request.headers 
    });

    // Wysłanie emaila z linkiem resetującym hasło
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${url.origin}/password-reset`,
    });

    // Security: zawsze zwracamy sukces, niezależnie czy email istnieje
    // Nie ujawniamy czy użytkownik istnieje w systemie
    return new Response(JSON.stringify({ 
      success: true,
      message: 'If an account exists, we\'ll send password reset instructions'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return handleAuthError(error);
  }
}; 