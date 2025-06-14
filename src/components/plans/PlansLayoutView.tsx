import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../hooks/useNavigation';
import { Header } from '../landing/Header';

interface PlansLayoutViewProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper dla stron planów z Header i logiką auth/nawigacji
 */
export const PlansLayoutView: React.FC<PlansLayoutViewProps> = ({ children }) => {
  const { authState, logout } = useAuth();
  const { navigateToLogin, navigateToSignup, navigateToPlans, scrollToTop } = useNavigation();

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
      console.error('Błąd podczas wylogowywania:', error);
      // Tutaj można dodać toast notification
    }
  };

  const handleNavigateToPlans = () => {
    navigateToPlans();
  };

  const handleLogoClick = () => {
    // Na stronach planów kliknięcie logo przekierowuje na stronę główną
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        authState={authState}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onLogout={handleLogout}
        onNavigateToPlans={handleNavigateToPlans}
        onLogoClick={handleLogoClick}
      />
      
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}; 