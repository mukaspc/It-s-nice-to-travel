import type { HeaderProps } from '../../types/landing';
import { Logo } from './Logo';
import { UnauthenticatedNav } from './UnauthenticatedNav';
import { AuthenticatedNav } from './AuthenticatedNav';

/**
 * Główna nawigacja górna z logo i przyciskami
 * Adaptuje się do stanu uwierzytelnienia użytkownika
 */
export const Header: React.FC<HeaderProps> = ({
  authState,
  onLogin,
  onSignup,
  onLogout,
  onNavigateToPlans
}) => {
  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderNavigation = () => {
    if (authState.isLoading) {
      return (
        <div className="flex items-center space-x-4">
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      );
    }

    if (authState.isAuthenticated && authState.user) {
      return (
        <AuthenticatedNav
          user={authState.user}
          onNavigateToPlans={onNavigateToPlans}
          onLogout={onLogout}
        />
      );
    }

    return (
      <UnauthenticatedNav
        onLogin={onLogin}
        onSignup={onSignup}
      />
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo onClick={handleLogoClick} />
          {renderNavigation()}
        </div>
      </div>
    </header>
  );
}; 