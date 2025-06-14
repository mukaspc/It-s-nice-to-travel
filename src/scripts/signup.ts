import { StrictMode, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthLayout } from '../components/auth/AuthLayout';
import { SignupForm } from '../components/auth/SignupForm';
import type { SignupFormData } from '../types/auth';

// Prawdziwa funkcja rejestracji przez API
const handleSignup = async (data: SignupFormData): Promise<void> => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Registration failed');
  }

  // Przekierowanie do /plans zgodnie z wymaganiami
  setTimeout(() => {
    window.location.href = '/plans';
  }, 2000);
};

const handleLoginRedirect = (): void => {
  window.location.href = '/login';
};

// Inicjalizacja React aplikacji
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('signup-page');
  
  if (container) {
    const root = createRoot(container);
    
    const authLayoutElement = createElement(AuthLayout, {
      title: 'Create your account',
      description: 'Start planning amazing trips with AI assistance.',
      children: createElement(SignupForm, {
        onSubmit: handleSignup,
        onLoginRedirect: handleLoginRedirect
      })
    });
    
    root.render(
      createElement(StrictMode, null, authLayoutElement)
    );
  }
}); 