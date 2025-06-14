import { StrictMode, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthLayout } from '../components/auth/AuthLayout';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { getSupabaseClient, initializeSupabaseClient } from '../db/supabase.client';
import type { ForgotPasswordFormData, ResetPasswordFormData } from '../types/auth';

// Funkcja do pobrania tokenu z URL
const getTokenFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  // Sprawdzamy różne parametry tokenów zgodnie ze specyfikacją Supabase
  return urlParams.get('access_token') || urlParams.get('token');
};

// Funkcja wysyłania emaila z resetem hasła
const handleForgotPassword = async (data: ForgotPasswordFormData): Promise<void> => {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${window.location.origin}/password-reset`,
  });

  if (error) {
    throw new Error(error.message || 'Failed to send reset email');
  }

  // Sukces - nie ujawniamy czy email istnieje w systemie dla bezpieczeństwa
};

// Funkcja resetowania hasła z tokenem
const handleResetPassword = async (data: ResetPasswordFormData): Promise<void> => {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const { error } = await supabase.auth.updateUser({
    password: data.password
  });

  if (error) {
    throw new Error(error.message || 'Failed to reset password');
  }

  // Sukces - przekierowanie do logowania po krótkim opóźnieniu
  setTimeout(() => {
    window.location.href = '/login?message=password-reset-success';
  }, 2000);
};

const handleBackToLogin = (): void => {
  window.location.href = '/login';
};

// Inicjalizacja React aplikacji
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('password-reset-page');
  const supabaseUrl = container?.getAttribute('data-supabase-url');
  const supabaseKey = container?.getAttribute('data-supabase-key');
  const token = getTokenFromUrl();
  
  if (container) {
    // Inicjalizuj klienta Supabase jeśli konfiguracja jest dostępna
    if (supabaseUrl && supabaseKey) {
      initializeSupabaseClient(supabaseUrl, supabaseKey);
    } else {
      console.warn('Supabase configuration not available - password reset will not work');
    }

    const root = createRoot(container);
    
    let authLayoutElement;
    
    if (token) {
      // Strona ustawiania nowego hasła (z tokenem)
      authLayoutElement = createElement(AuthLayout, {
        title: 'Reset your password',
        description: 'Enter your new password below.',
        children: createElement(ResetPasswordForm, {
          onSubmit: handleResetPassword,
          token: token
        })
      });
    } else {
      // Strona żądania resetu hasła (bez tokenu)
      authLayoutElement = createElement(AuthLayout, {
        title: 'Reset your password',
        description: 'Enter your email to receive reset instructions.',
        children: createElement(ForgotPasswordForm, {
          onSubmit: handleForgotPassword,
          onBackToLogin: handleBackToLogin
        })
      });
    }
    
    root.render(
      createElement(StrictMode, null, authLayoutElement)
    );
  }
}); 