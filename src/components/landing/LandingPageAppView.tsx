import React from "react";
import type { LandingPageViewModel } from "../../types/landing";
import { useAuth } from "../../hooks/useAuth";
import { useNavigation } from "../../hooks/useNavigation";
import { Header } from "./Header";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { AIAdvantageSection } from "./AIAdvantageSection";

interface LandingPageAppViewProps {
  viewModel: LandingPageViewModel;
}

/**
 * Główny komponent aplikacji landing page
 */
export const LandingPageAppView: React.FC<LandingPageAppViewProps> = ({ viewModel }) => {
  const { authState, logout } = useAuth();
  const { navigateToLogin, navigateToSignup, navigateToPlans } = useNavigation();

  const handleLogin = () => {
    navigateToLogin();
  };

  const handleSignup = () => {
    navigateToSignup();
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Opcjonalnie: odświeżenie strony lub przekierowanie
      window.location.reload();
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
      // Tutaj można dodać toast notification
    }
  };

  const handleNavigateToPlans = () => {
    navigateToPlans();
  };

  const handleCTAClick = () => {
    // Dla zalogowanych użytkowników kieruj do planów, dla niezalogowanych do rejestracji
    if (authState.isAuthenticated) {
      navigateToPlans();
    } else {
      navigateToSignup();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        authState={authState}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onLogout={handleLogout}
        onNavigateToPlans={handleNavigateToPlans}
      />

      <HeroSection heroContent={viewModel.heroContent} onCTAClick={handleCTAClick} authState={authState} />

      <FeaturesSection features={viewModel.features} />

      <AIAdvantageSection aiAdvantage={viewModel.aiAdvantage} />
    </div>
  );
};
