import { StrictMode, createElement } from "react";
import { createRoot } from "react-dom/client";
import { AuthLayout } from "../components/auth/AuthLayout";
import { LoginForm } from "../components/auth/LoginForm";
import { getSupabaseClient, initializeSupabaseClient } from "../db/supabase.client";
import type { LoginFormData } from "../types/auth";

// Funkcja logowania przez client-side Supabase
const handleLogin = async (data: LoginFormData): Promise<void> => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase client not available");
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    throw new Error(error.message || "Login failed");
  }

  if (!authData.user || !authData.session) {
    throw new Error("Login failed");
  }

  // Poczekaj chwilę aby sesja została zapisana w localStorage
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Sprawdź czy jest redirect URL w query params
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get("redirect") || "/plans";

  // Przekierowanie do odpowiedniej strony
  window.location.href = redirectUrl;
};

const handleForgotPassword = (): void => {
  window.location.href = "/password-reset";
};

const handleSignupRedirect = (): void => {
  window.location.href = "/signup";
};

// Inicjalizacja React aplikacji
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("login-page");
  const supabaseUrl = container?.getAttribute("data-supabase-url");
  const supabaseKey = container?.getAttribute("data-supabase-key");

  if (container) {
    // Inicjalizuj klienta Supabase jeśli konfiguracja jest dostępna
    if (supabaseUrl && supabaseKey) {
      initializeSupabaseClient(supabaseUrl, supabaseKey);
    } else {
      console.warn("Supabase configuration not available - login will not work");
    }

    const root = createRoot(container);

    const authLayoutElement = createElement(AuthLayout, {
      title: "Sign in to your account",
      description: "Welcome back! Please sign in to continue.",
      children: createElement(LoginForm, {
        onSubmit: handleLogin,
        onForgotPassword: handleForgotPassword,
        onSignupRedirect: handleSignupRedirect,
      }),
    });

    root.render(createElement(StrictMode, null, authLayoutElement));
  }
});
