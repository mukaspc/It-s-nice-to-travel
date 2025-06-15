import { StrictMode, createElement } from "react";
import { createRoot } from "react-dom/client";
import { AuthLayout } from "../components/auth/AuthLayout";
import { SignupForm } from "../components/auth/SignupForm";
import { getSupabaseClient, initializeSupabaseClient } from "../db/supabase.client";
import type { SignupFormData } from "../types/auth";

// Funkcja rejestracji przez client-side Supabase
const handleSignup = async (data: SignupFormData): Promise<void> => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client not available");
  }

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      // Wyłączamy weryfikację emaila dla MVP zgodnie z wymaganiami
      emailRedirectTo: undefined,
    },
  });

  if (error) {
    throw new Error(error.message || "Registration failed");
  }

  if (!authData.user) {
    throw new Error("Registration failed");
  }

  // Poczekaj chwilę aby sesja została zapisana
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Przekierowanie do /plans zgodnie z wymaganiami
  window.location.href = "/plans";
};

const handleLoginRedirect = (): void => {
  window.location.href = "/login";
};

// Inicjalizacja React aplikacji
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("signup-page");
  const supabaseUrl = container?.getAttribute("data-supabase-url");
  const supabaseKey = container?.getAttribute("data-supabase-key");

  if (container) {
    // Inicjalizuj klienta Supabase jeśli konfiguracja jest dostępna
    if (supabaseUrl && supabaseKey) {
      initializeSupabaseClient(supabaseUrl, supabaseKey);
    } else {
      console.warn("Supabase configuration not available - signup will not work");
    }

    const root = createRoot(container);

    const authLayoutElement = createElement(AuthLayout, {
      title: "Create your account",
      description: "Start planning amazing trips with AI assistance.",
      children: createElement(SignupForm, {
        onSubmit: handleSignup,
        onLoginRedirect: handleLoginRedirect,
      }),
    });

    root.render(createElement(StrictMode, null, authLayoutElement));
  }
});
