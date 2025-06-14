import { StrictMode, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import type { LoginFormData } from '../types/auth';

// Prawdziwa funkcja logowania przez API
const handleLogin = async (data: LoginFormData): Promise<void> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Login failed');
  }

  // Sprawdź czy jest redirect URL w query params
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get('redirect') || '/plans';
  
  // Przekierowanie do odpowiedniej strony
  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 1500);
};

const handleForgotPassword = (): void => {
  window.location.href = '/password-reset';
};

const handleSignupRedirect = (): void => {
  window.location.href = '/signup';
};

// Inicjalizacja React aplikacji
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('login-page');
  
  if (container) {
    const root = createRoot(container);
    
    const authLayoutElement = createElement(AuthLayout, {
      title: 'Sign in to your account',
      description: 'Welcome back! Please sign in to continue.',
      children: createElement(LoginForm, {
        onSubmit: handleLogin,
        onForgotPassword: handleForgotPassword,
        onSignupRedirect: handleSignupRedirect
      })
    });
    
    root.render(
      createElement(StrictMode, null, authLayoutElement)
    );
  }
}); 