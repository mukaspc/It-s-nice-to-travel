import { StrictMode, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import type { LoginFormData } from '../types/auth';

// Mock funkcje - w przyszłości będą zastąpione prawdziwymi wywołaniami API
const handleLogin = async (data: LoginFormData): Promise<void> => {
  console.log('Login attempt:', data);
  
  // Symulacja opóźnienia API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Symulacja błędu dla demonstracji
  if (data.email === 'error@example.com') {
    throw new Error('Invalid email or password');
  }
  
  // Symulacja sukcesu - przekierowanie do dashboard
  setTimeout(() => {
    window.location.href = '/dashboard';
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