import { StrictMode, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthLayout } from '../components/auth/AuthLayout';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import type { ForgotPasswordFormData, ResetPasswordFormData } from '../types/auth';

// Funkcja do pobrania tokenu z URL
const getTokenFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
};

// Mock funkcje - w przyszłości będą zastąpione prawdziwymi wywołaniami API
const handleForgotPassword = async (data: ForgotPasswordFormData): Promise<void> => {
  console.log('Forgot password request:', data);
  
  // Symulacja opóźnienia API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Symulacja błędu dla demonstracji
  if (data.email === 'notfound@example.com') {
    throw new Error('No account found with this email address');
  }
  
  // Symulacja sukcesu
  console.log('Password reset email sent successfully');
};

const handleResetPassword = async (data: ResetPasswordFormData): Promise<void> => {
  console.log('Reset password attempt:', data);
  
  // Symulacja opóźnienia API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Symulacja błędu dla demonstracji (token expired)
  const token = getTokenFromUrl();
  if (token === 'expired') {
    throw new Error('Reset link has expired. Please request a new one.');
  }
  
  // Symulacja sukcesu - przekierowanie do logowania
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
  const token = getTokenFromUrl();
  
  if (container) {
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