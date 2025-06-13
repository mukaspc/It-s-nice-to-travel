/**
 * Custom hook do obsługi nawigacji w aplikacji
 */
export const useNavigation = () => {
  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  const navigateToSignup = () => {
    window.location.href = '/signup';
  };

  const navigateToPlans = () => {
    window.location.href = '/plans';
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { 
    navigateToLogin, 
    navigateToSignup, 
    navigateToPlans,
    scrollToTop
  };
}; 