// Stan uwierzytelnienia
export interface AuthState {
  isAuthenticated: boolean;
  user?: User;
  isLoading: boolean;
  error?: string;
}

// Informacje o użytkowniku
export interface User {
  id: string;
  email: string;
}

// Główny model widoku landing page
export interface LandingPageViewModel {
  authState: AuthState;
  features: FeatureItem[];
  heroContent: HeroContent;
  aiAdvantage: AIAdvantageContent;
}

// Treść sekcji hero
export interface HeroContent {
  title: string;
  description: string;
  ctaText: string;
}

// Element zalety serwisu
export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string; // Nazwa ikony z biblioteki ikon
}

// Treść sekcji przewagi AI
export interface AIAdvantageContent {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

// Props dla komponentów
export interface HeaderProps {
  authState: AuthState;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
  onNavigateToPlans: () => void;
}

export interface UnauthenticatedNavProps {
  onLogin: () => void;
  onSignup: () => void;
}

export interface AuthenticatedNavProps {
  user: User;
  onNavigateToPlans: () => void;
  onLogout: () => void;
}

export interface UserDropdownProps {
  user: User;
  onNavigateToPlans: () => void;
  onLogout: () => void;
}

export interface HeroSectionProps {
  heroContent: HeroContent;
  onCTAClick: () => void;
  authState?: AuthState;
}

export interface FeaturesSectionProps {
  features: FeatureItem[];
}

export interface FeatureCardProps {
  feature: FeatureItem;
}

export interface AIAdvantageSectionProps {
  aiAdvantage: AIAdvantageContent;
} 