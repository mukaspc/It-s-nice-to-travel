# Plan implementacji widoku Landing Page

## 1. Przegląd

Landing page to główna strona aplikacji "It's nice to travel", która ma za zadanie zaprezentować możliwości aplikacji i zachęcić użytkowników do rejestracji. Strona będzie widoczna zarówno dla zalogowanych, jak i niezalogowanych użytkowników, z różnicą w nawigacji górnej. Widok ma być responsywny z priorytetem dla urządzeń mobilnych, wykorzystywać nowoczesną kolorystykę podróżniczą i oferować intuicyjny UX.

## 2. Routing widoku

**Ścieżka**: `/` (strona główna)
**Dostępność**: Publiczna - dostępna dla wszystkich użytkowników niezależnie od stanu uwierzytelnienia

## 3. Struktura komponentów

```
LandingPage.astro
├── Header.tsx
│   ├── Logo.tsx
│   ├── UnauthenticatedNav.tsx
│   │   ├── LoginButton.tsx
│   │   └── SignupButton.tsx
│   └── AuthenticatedNav.tsx
│       └── UserDropdown.tsx
│           ├── UserIcon.tsx
│           └── DropdownMenu.tsx
├── HeroSection.tsx
│   ├── HeroTitle.tsx
│   ├── HeroDescription.tsx
│   └── HeroCTA.tsx
├── FeaturesSection.tsx
│   └── FeatureCard.tsx[] (array komponentów)
└── AIAdvantageSection.tsx
    ├── AIImage.tsx
    └── AIDescription.tsx
```

## 4. Szczegóły komponentów

### LandingPage.astro

- **Opis**: Główny kontener widoku landing page w formacie Astro, łączący wszystkie sekcje strony
- **Główne elementy**: Layout wrapper, Header, main content sections, SEO meta tags
- **Obsługiwane interakcje**: Zarządzanie stanem uwierzytelnienia, przekazywanie props do komponentów React
- **Obsługiwana walidacja**: Sprawdzenie stanu uwierzytelnienia użytkownika z Supabase
- **Typy**: `LandingPageViewModel`, `AuthState`
- **Propsy**: Brak (główny widok Astro)

### Header.tsx

- **Opis**: Nawigacja górna z logo i przyciskami, adaptująca się do stanu uwierzytelnienia użytkownika
- **Główne elementy**: Container, Logo, warunkowa nawigacja (UnauthenticatedNav lub AuthenticatedNav)
- **Obsługiwane interakcje**: Kliknięcie logo (scroll to top), przekazywanie eventów nawigacji
- **Obsługiwana walidacja**: Sprawdzenie czy użytkownik jest zalogowany
- **Typy**: `HeaderProps`, `AuthState`
- **Propsy**: `authState: AuthState`, `onLogin: () => void`, `onSignup: () => void`, `onLogout: () => void`, `onNavigateToPlans: () => void`

### UnauthenticatedNav.tsx

- **Opis**: Nawigacja dla niezalogowanych użytkowników z przyciskami logowania i rejestracji
- **Główne elementy**: Nav container, LoginButton, SignupButton
- **Obsługiwane interakcje**: Kliknięcie "Login", kliknięcie "Signup"
- **Obsługiwana walidacja**: Brak
- **Typy**: `UnauthenticatedNavProps`
- **Propsy**: `onLogin: () => void`, `onSignup: () => void`

### AuthenticatedNav.tsx

- **Opis**: Nawigacja dla zalogowanych użytkowników z dropdown menu
- **Główne elementy**: Nav container, UserDropdown
- **Obsługiwane interakcje**: Przekazywanie eventów do UserDropdown
- **Obsługiwana walidacja**: Brak
- **Typy**: `AuthenticatedNavProps`, `User`
- **Propsy**: `user: User`, `onNavigateToPlans: () => void`, `onLogout: () => void`

### UserDropdown.tsx

- **Opis**: Dropdown menu z opcjami dla zalogowanego użytkownika
- **Główne elementy**: UserIcon, DropdownMenu z opcjami "Moje plany" i "Wyloguj"
- **Obsługiwane interakcje**: Otwieranie/zamykanie dropdown, kliknięcie "Moje plany", kliknięcie "Wyloguj"
- **Obsługiwana walidacja**: Brak
- **Typy**: `UserDropdownProps`, `User`
- **Propsy**: `user: User`, `onNavigateToPlans: () => void`, `onLogout: () => void`

### HeroSection.tsx

- **Opis**: Główna sekcja hero z nagłówkiem, opisem i przyciskiem CTA
- **Główne elementy**: Section container, HeroTitle, HeroDescription, HeroCTA button
- **Obsługiwane interakcje**: Kliknięcie przycisku CTA (przekierowanie do rejestracji)
- **Obsługiwana walidacja**: Brak
- **Typy**: `HeroSectionProps`, `HeroContent`
- **Propsy**: `heroContent: HeroContent`, `onCTAClick: () => void`

### FeaturesSection.tsx

- **Opis**: Sekcja z kartami przedstawiającymi zalety serwisu
- **Główne elementy**: Section container, grid layout, array komponentów FeatureCard
- **Obsługiwane interakcje**: Brak interakcji użytkownika
- **Obsługiwana walidacja**: Walidacja czy features array nie jest pusty
- **Typy**: `FeaturesSectionProps`, `FeatureItem[]`
- **Propsy**: `features: FeatureItem[]`

### FeatureCard.tsx

- **Opis**: Pojedyncza karta z zaletą serwisu
- **Główne elementy**: Card container, FeatureIcon, FeatureTitle, FeatureDescription
- **Obsługiwane interakcje**: Hover effects (animacje CSS)
- **Obsługiwana walidacja**: Walidacja wymaganych pól (title, description)
- **Typy**: `FeatureCardProps`, `FeatureItem`
- **Propsy**: `feature: FeatureItem`

### AIAdvantageSection.tsx

- **Opis**: Sekcja z obrazem i opisem przewagi wykorzystania AI
- **Główne elementy**: Section container, AIImage, AIDescription
- **Obsługiwane interakcje**: Brak interakcji użytkownika
- **Obsługiwana walidacja**: Walidacja czy content jest dostępny
- **Typy**: `AIAdvantageSectionProps`, `AIAdvantageContent`
- **Propsy**: `aiAdvantage: AIAdvantageContent`

## 5. Typy

```typescript
// Stan uwierzytelnienia
interface AuthState {
  isAuthenticated: boolean;
  user?: User;
  isLoading: boolean;
  error?: string;
}

// Informacje o użytkowniku
interface User {
  id: string;
  email: string;
}

// Główny model widoku landing page
interface LandingPageViewModel {
  authState: AuthState;
  features: FeatureItem[];
  heroContent: HeroContent;
  aiAdvantage: AIAdvantageContent;
}

// Treść sekcji hero
interface HeroContent {
  title: string;
  description: string;
  ctaText: string;
}

// Element zalety serwisu
interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string; // Nazwa ikony z biblioteki ikon
}

// Treść sekcji przewagi AI
interface AIAdvantageContent {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}

// Props dla komponentów
interface HeaderProps {
  authState: AuthState;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
  onNavigateToPlans: () => void;
}

interface UnauthenticatedNavProps {
  onLogin: () => void;
  onSignup: () => void;
}

interface AuthenticatedNavProps {
  user: User;
  onNavigateToPlans: () => void;
  onLogout: () => void;
}

interface UserDropdownProps {
  user: User;
  onNavigateToPlans: () => void;
  onLogout: () => void;
}

interface HeroSectionProps {
  heroContent: HeroContent;
  onCTAClick: () => void;
}

interface FeaturesSectionProps {
  features: FeatureItem[];
}

interface FeatureCardProps {
  feature: FeatureItem;
}

interface AIAdvantageSectionProps {
  aiAdvantage: AIAdvantageContent;
}
```

## 6. Zarządzanie stanem

Stan w widoku landing page będzie zarządzany przez:

1. **useAuth** - Custom hook do zarządzania stanem uwierzytelnienia

   - Integracja z Supabase Auth
   - Sprawdzanie stanu logowania przy ładowaniu strony
   - Obsługa wylogowywania
   - Zwracanie: `{ authState, logout }`

2. **useNavigation** - Custom hook do obsługi nawigacji

   - Przekierowania do różnych stron aplikacji
   - Zwracanie: `{ navigateToLogin, navigateToSignup, navigateToPlans }`

3. **Stan lokalny komponentów**:
   - UserDropdown: `isOpen` - czy dropdown jest otwarty
   - Żadnych skomplikowanych stanów globalnych nie będzie potrzeba

```typescript
// Custom hook useAuth
const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Sprawdzenie stanu uwierzytelnienia z Supabase
  }, []);

  const logout = async () => {
    // Logika wylogowywania
  };

  return { authState, logout };
};

// Custom hook useNavigation
const useNavigation = () => {
  const navigateToLogin = () => (window.location.href = "/login");
  const navigateToSignup = () => (window.location.href = "/signup");
  const navigateToPlans = () => (window.location.href = "/plans");

  return { navigateToLogin, navigateToSignup, navigateToPlans };
};
```

## 7. Integracja API

Landing page nie wymaga bezpośrednich wywołań API. Jedyne integracje to:

1. **Supabase Auth** - sprawdzenie stanu uwierzytelnienia

   - Typ żądania: Brak (SDK call)
   - Typ odpowiedzi: `User | null`
   - Implementacja w `useAuth` hook

2. **Nawigacja** - przekierowania do innych widoków
   - Brak wywołań API
   - Wykorzystanie window.location.href lub Astro navigation

## 8. Interakcje użytkownika

1. **Kliknięcie "Login"** → Przekierowanie do `/login`
2. **Kliknięcie "Signup"** → Przekierowanie do `/signup`
3. **Kliknięcie ikony użytkownika** → Otwarcie/zamknięcie dropdown menu
4. **Kliknięcie "Moje plany"** → Przekierowanie do `/plans`
5. **Kliknięcie "Wyloguj"** → Wylogowanie użytkownika i odświeżenie strony
6. **Kliknięcie CTA w hero** → Przekierowanie do `/signup`
7. **Kliknięcie logo** → Scroll do góry strony
8. **Hover na kartach funkcji** → Animacje CSS (transform, shadow)

## 9. Warunki i walidacja

1. **Sprawdzenie stanu uwierzytelnienia**:

   - Komponent: Header.tsx
   - Warunek: `authState.isAuthenticated === true`
   - Wpływ: Wyświetlenie AuthenticatedNav zamiast UnauthenticatedNav

2. **Loading state podczas sprawdzania auth**:

   - Komponent: Header.tsx
   - Warunek: `authState.isLoading === true`
   - Wpływ: Wyświetlenie skeleton/spinner w miejsce nawigacji

3. **Walidacja danych treści**:

   - Komponent: FeaturesSection.tsx
   - Warunek: `features.length > 0`
   - Wpływ: Wyświetlenie sekcji lub fallback message

4. **Walidacja pojedynczej karty**:
   - Komponent: FeatureCard.tsx
   - Warunek: `feature.title && feature.description`
   - Wpływ: Wyświetlenie karty lub pominięcie

## 10. Obsługa błędów

1. **Błąd podczas sprawdzania stanu auth**:

   - Strategia: Fallback do stanu niezalogowanego
   - Implementacja: Catch w `useAuth` hook
   - UI: Wyświetlenie UnauthenticatedNav

2. **Błąd podczas wylogowywania**:

   - Strategia: Wyświetlenie toast z komunikatem błędu
   - Implementacja: Try-catch w funkcji logout
   - UI: Toast notification "Wystąpił błąd podczas wylogowywania"

3. **Brak dostępu do Supabase**:

   - Strategia: Graceful degradation
   - Implementacja: Timeout w sprawdzaniu auth
   - UI: Wyświetlenie strony bez funkcji zalogowanych

4. **Błędy ładowania obrazów**:

   - Strategia: Placeholder images
   - Implementacja: onError handlers na img tags
   - UI: Fallback image lub ikona

5. **Błędy nawigacji**:
   - Strategia: Fallback do window.location
   - Implementacja: Try-catch w navigation functions
   - UI: Sprawdzenie czy przekierowanie działa

## 11. Kroki implementacji

1. **Przygotowanie struktury plików**

   - Utworzenie `src/pages/index.astro`
   - Utworzenie folderu `src/components/landing/`
   - Utworzenie plików typów w `src/types/landing.ts`

2. **Implementacja custom hooks**

   - Utworzenie `src/hooks/useAuth.ts`
   - Utworzenie `src/hooks/useNavigation.ts`
   - Integracja z Supabase Auth

3. **Implementacja komponentów podstawowych**

   - Logo.tsx - prosty komponent z tekstem/obrazem
   - LoginButton.tsx i SignupButton.tsx - przyciski z linkami
   - UserIcon.tsx - ikona użytkownika

4. **Implementacja nawigacji**

   - Header.tsx - główny kontener nawigacji
   - UnauthenticatedNav.tsx - nawigacja dla niezalogowanych
   - AuthenticatedNav.tsx - nawigacja dla zalogowanych
   - UserDropdown.tsx - dropdown menu z wykorzystaniem Shadcn/ui

5. **Implementacja sekcji Hero**

   - HeroSection.tsx - layout sekcji hero
   - Dodanie responsywnego stylu z Tailwind
   - Implementacja CTA button z hover effects

6. **Implementacja sekcji Features**

   - FeatureCard.tsx - pojedyncza karta funkcji
   - FeaturesSection.tsx - grid layout kart
   - Dodanie ikon z biblioteki (np. Lucide React)

7. **Implementacja sekcji AI Advantage**

   - AIAdvantageSection.tsx - sekcja z obrazem i tekstem
   - Responsywny layout (obraz po lewej, tekst po prawej na desktop)
   - Optymalizacja obrazów

8. **Integracja w głównym widoku Astro**

   - Połączenie wszystkich komponentów w index.astro
   - Konfiguracja SEO meta tags
   - Testowanie stanu uwierzytelnienia

9. **Stylowanie i responsywność**
   - Implementacja mobile-first design
   - Testowanie na różnych rozmiarach ekranów
   - Dodanie animacji i transitions
