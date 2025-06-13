import { StrictMode, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthLayout } from '../components/auth/AuthLayout';
import { SignupForm } from '../components/auth/SignupForm';
import type { SignupFormData } from '../types/auth';

// Mock funkcje - w przyszłości będą zastąpione prawdziwymi wywołaniami API
const handleSignup = async (data: SignupFormData): Promise<void> => {
  console.log('Signup attempt:', data);
  
  // Symulacja opóźnienia API
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Symulacja błędu dla demonstracji
  if (data.email === 'taken@example.com') {
    throw new Error('This email address is already registered');
  }
  
  // Symulacja sukcesu - przekierowanie do logowania
  setTimeout(() => {
    window.location.href = '/login?message=registration-success';
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