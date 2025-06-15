import { StrictMode, createElement } from "react";
import { createRoot } from "react-dom/client";
import { LandingPageAppView } from "./LandingPageAppView";
import { initializeSupabaseClient } from "../../db/supabase.client";
import type { LandingPageViewModel } from "../../types/landing";

// Inicjalizacja React aplikacji w przeglądarce
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("landing-page");
  const viewModelData = container?.getAttribute("data-view-model");
  const supabaseUrl = container?.getAttribute("data-supabase-url");
  const supabaseKey = container?.getAttribute("data-supabase-key");

  if (container && viewModelData) {
    try {
      // Inicjalizuj klienta Supabase jeśli konfiguracja jest dostępna
      if (supabaseUrl && supabaseKey) {
        initializeSupabaseClient(supabaseUrl, supabaseKey);
      } else {
        console.warn("Supabase configuration not available - auth features will be disabled");
      }

      const viewModel: LandingPageViewModel = JSON.parse(viewModelData);
      const root = createRoot(container);

      root.render(createElement(StrictMode, null, createElement(LandingPageAppView, { viewModel })));
    } catch (error) {
      console.error("Błąd podczas inicjalizacji aplikacji landing page:", error);
    }
  }
});
