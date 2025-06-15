import { StrictMode, createElement } from "react";
import { createRoot } from "react-dom/client";
import { PlansLayoutView } from "./PlansLayoutView";
import { PlanListView } from "./PlanListView";
import { PlanFormWrapper } from "./PlanFormWrapper";
import { GeneratedPlanView } from "./GeneratedPlanView";
import { initializeSupabaseClient } from "../../db/supabase.client";

// Flag do zapobiegania podwójnej inicjalizacji
let isInitialized = false;

// Funkcja do wykrywania typu strony i renderowania odpowiedniego komponentu
const getPageComponent = (container: Element) => {
  const planListContainer = container.querySelector("#plan-list-view");
  const planFormContainer = container.querySelector("#plan-form-wrapper");
  const generatedPlanContainer = container.querySelector("#generated-plan-view");

  if (planListContainer) {
    return createElement(PlanListView);
  } else if (planFormContainer) {
    const mode = planFormContainer.getAttribute("data-mode") as "create" | "edit";
    const initialDataStr = planFormContainer.getAttribute("data-initial-data");
    const initialData = initialDataStr ? JSON.parse(initialDataStr) : undefined;

    return createElement(PlanFormWrapper, { mode, initialData });
  } else if (generatedPlanContainer) {
    const planId = generatedPlanContainer.getAttribute("data-plan-id");
    if (planId) {
      return createElement(GeneratedPlanView, { planId });
    }
  }

  // Fallback - renderuj oryginalną zawartość jako HTML
  if (container.innerHTML.trim()) {
    return createElement("div", {
      dangerouslySetInnerHTML: { __html: container.innerHTML },
    });
  }

  return createElement("div", null, "Content not found");
};

// Inicjalizacja React aplikacji w przeglądarce dla stron planów
document.addEventListener("DOMContentLoaded", () => {
  // Zapobiegaj podwójnej inicjalizacji
  if (isInitialized) {
    return;
  }

  const container = document.getElementById("plans-layout");
  const supabaseUrl = container?.getAttribute("data-supabase-url");
  const supabaseKey = container?.getAttribute("data-supabase-key");

  if (container) {
    try {
      isInitialized = true;

      // Inicjalizuj klienta Supabase jeśli konfiguracja jest dostępna
      if (supabaseUrl && supabaseKey) {
        initializeSupabaseClient(supabaseUrl, supabaseKey);
      } else {
        console.warn("Supabase configuration not available - auth features will be disabled");
      }

      // Wykryj jaki komponent renderować na podstawie zawartości
      const pageComponent = getPageComponent(container);

      // Wyczyść kontener główny
      container.innerHTML = "";

      const root = createRoot(container);

      // Użyj StrictMode tylko w development
      const isDevelopment = process.env.NODE_ENV === "development";
      const AppComponent = createElement(PlansLayoutView, null, pageComponent);

      root.render(isDevelopment ? createElement(StrictMode, null, AppComponent) : AppComponent);
    } catch (error) {
      console.error("Błąd podczas inicjalizacji aplikacji planów:", error);
      isInitialized = false; // Reset flag w przypadku błędu
    }
  }
});
