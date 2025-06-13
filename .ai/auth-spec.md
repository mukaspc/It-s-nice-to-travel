# Specyfikacja techniczna modułu uwierzytelniania - It's nice to travel

## 1. Przegląd architektury

Moduł uwierzytelniania dla aplikacji "It's nice to travel" oparty jest na integracji Astro 5 z Supabase Auth, wykorzystując React 19 do komponentów interaktywnych. System implementuje pełny cykl uwierzytelniania z registracją, logowaniem, odzyskiwaniem hasła i zarządzaniem sesjami użytkowników zgodnie z wymaganiami US-000 do US-004.

### 1.1 Główne komponenty systemu

- **Frontend**: Komponenty React do formularzy uwierzytelniania
- **Backend**: Endpointy API Astro z integracją Supabase Auth
- **Middleware**: Weryfikacja tokenów JWT i zarządzanie sesjami
- **Ochrona tras**: Mechanizmy autoryzacji dostępu do chronionych zasobów

### 1.2 Rozwiązanie sprzeczności PRD

**Uwaga dotycząca pola potwierdzenia hasła w rejestracji:**
PRD zawiera sprzeczne wymagania:
- US-000 wymaga: "adres email, hasła i potwierdzenia hasła"
- US-001 wymaga: "adres e-mail, hasło"
- Sekcja 3.1 wymaga: "adres e-mail, hasła"

**Rozwiązanie:** Implementujemy zgodnie z US-001 (bardziej szczegółowe wymaganie) - formularz rejestracji będzie zawierał tylko pola email i hasło, bez potwierdzenia hasła. To jest zgodne z większością wymagań PRD i upraszcza UX.

**Uwaga dotycząca weryfikacji emaila:**
PRD nie wymaga weryfikacji emaila, ale Supabase domyślnie ją włącza. Dla MVP wyłączymy wymaganie weryfikacji emaila aby użytkownicy mogli się natychmiast logować po rejestracji.

## 2. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 2.1 Struktura stron uwierzytelniania

#### 2.1.1 Strony Astro (Server-Side)

**src/pages/login.astro**
- Odpowiedzialność: Renderowanie strony logowania po stronie serwera
- Layout: Wykorzystuje `Layout.astro` z konfiguracją meta tagów SEO
- Integracja: Ładuje React komponent przez `login.ts` script
- Hydratacja: Client-side hydratacja komponentu `LoginForm`

**src/pages/signup.astro**
- Odpowiedzialność: Renderowanie strony rejestracji
- Layout: Wspólny layout z meta tagami i konfiguracją
- Integracja: Script `signup.ts` inicjalizuje React komponenty
- Hydratacja: Komponent `SignupForm` z walidacją client-side

**src/pages/password-reset.astro**
- Odpowiedzialność: Strona odzyskiwania hasła (dwufunkcyjna)
- Logika: Rozróżnia tryb żądania resetu od ustawiania nowego hasła
- Token: Sprawdza parametr URL `?token=` dla trybu resetowania
- Komponenty: `ForgotPasswordForm` lub `ResetPasswordForm`

**src/pages/profile.astro** (nowa strona do implementacji)
- Odpowiedzialność: Panel edycji profilu użytkownika
- Ochrona: Wymaga uwierzytelnienia (middleware redirect)
- Funkcje: Zmiana hasła, aktualizacja danych profilu
- Komponent: `ProfileForm` z walidacją danych

#### 2.1.2 Komponenty React (Client-Side)

**src/components/auth/AuthLayout.tsx**
- Odpowiedzialność: Wspólny layout dla wszystkich formularzy uwierzytelniania
- Elementy: Logo, nagłówki, kontener formularza
- Stylowanie: Tailwind z responsywnym designem
- Props: `title`, `description`, `children`

**src/components/auth/LoginForm.tsx**
- Odpowiedzialność: Formularz logowania z walidacją
- Pola: Email, hasło
- Funkcje: "Zapomniałem hasła", opcja "Zapamiętaj mnie"
- Walidacja: Client-side z hook `useForm`
- Integracja: Supabase Auth przez `signInWithPassword`

**src/components/auth/SignupForm.tsx**
- Odpowiedzialność: Formularz rejestracji zgodny z US-001
- Pola: Email, hasło (BEZ potwierdzenia hasła)
- Walidacja: Format email, siła hasła (min 8 znaków, 1 duża litera, 1 cyfra)
- Komunikaty: Informacja o pomyślnej rejestracji i przekierowaniu
- Integracja: Supabase Auth przez `signUp` bez wymagania weryfikacji emaila

**src/components/auth/ForgotPasswordForm.tsx**
- Odpowiedzialność: Formularz żądania resetu hasła
- Pole: Email użytkownika
- Funkcja: Wysłanie emaila z linkiem resetującym
- Nawigacja: Powrót do logowania
- Integracja: `resetPasswordForEmail`

**src/components/auth/ResetPasswordForm.tsx**
- Odpowiedzialność: Formularz ustawiania nowego hasła
- Pola: Nowe hasło, potwierdzenie (tutaj potwierdzenie jest uzasadnione)
- Token: Ukryte pole z tokenem z URL
- Walidacja: Wymagania bezpieczeństwa hasła
- Integracja: `updateUser` z token verification

**src/components/auth/ProfileForm.tsx** (do implementacji)
- Odpowiedzialność: Edycja profilu zalogowanego użytkownika
- Pola: Stare hasło, nowe hasło, potwierdzenie nowego hasła
- Funkcje: Walidacja obecnego hasła przed zmianą
- Bezpieczeństwo: Re-autentykacja dla wrażliwych operacji
- Komunikaty: Potwierdzenie pomyślnej aktualizacji profilu

### 2.2 Wspólne komponenty pomocnicze

**src/components/auth/FormField.tsx**
- Odpowiedzialność: Uniwersalne pole formularza z walidacją
- Typy: Text, email, password z różnymi wariantami
- Stany: Error, success, loading, disabled
- Accessibility: ARIA labels, proper focus management

**src/components/auth/ErrorMessage.tsx**
- Odpowiedzialność: Wyświetlanie komunikatów błędów
- Stylowanie: Czerwone tło z ikoną ostrzeżenia
- Animacje: Fade-in/out transitions

**src/components/auth/SuccessMessage.tsx**
- Odpowiedzialność: Komunikaty sukcesu operacji
- Stylowanie: Zielone tło z ikoną potwierdzenia
- Auto-hide: Automatyczne znikanie po określonym czasie

### 2.3 Modyfikacje nawigacji

#### 2.3.1 Aktualizacja Header.tsx

**Nowe stany nawigacji:**
```typescript
interface HeaderAuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user?: AuthenticatedUser;
}
```

**Warunki renderowania:**
- `isLoading === true`: Skeleton loader w miejscu nawigacji
- `isAuthenticated === false`: `UnauthenticatedNav` z przyciskami Login/Signup
- `isAuthenticated === true`: `AuthenticatedNav` z dropdown użytkownika

#### 2.3.2 Rozszerzenie UnauthenticatedNav.tsx

**Nowe przyciski:**
- Login Button: Przekierowanie do `/login`
- Signup Button: Przekierowanie do `/signup`
- Responsywność: Mobile-first design z collapsed menu

#### 2.3.3 Aktualizacja AuthenticatedNav.tsx

**UserDropdown komponenty:**
- User avatar/ikona z inicjałami lub domyślną ikoną
- Dropdown menu z opcjami:
  - "My plans" → `/plans` (jako "panel użytkownika")
  - "Logout" → Wywołanie `signOut()`

### 2.4 Walidacja i komunikaty błędów

#### 2.4.1 Reguły walidacji

**Walidacja email:**
```typescript
email: (value: string): string | undefined => {
  if (!value) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Please enter a valid email address';
  }
  return undefined;
}
```

**Walidacja hasła:**
```typescript
password: (value: string): string | undefined => {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters long';
  if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
  if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
  return undefined;
}
```

#### 2.4.2 Scenariusze błędów

**Logowanie:**
- Nieprawidłowe dane: "Invalid email or password"
- Brak konta: "No account found with this email address"
- Rate limiting: "Too many attempts. Please try again in X minutes"

**Rejestracja:**
- Email zajęty: "An account with this email already exists"
- Słabe hasło: Szczegółowe komunikaty o wymaganiach
- Błąd rejestracji: "An error occurred while creating your account"

**Reset hasła:**
- Komunikat uniwersalny: "If an account exists, we'll send password reset instructions"
- Token expired: "Password reset link has expired. Please request a new one"
- Token invalid: "Invalid password reset link"

**Edycja profilu:**
- Błędne stare hasło: "Current password is incorrect"
- Sukces: "Profile updated successfully"

### 2.5 Obsługa stanów ładowania i loading states

**Loading patterns:**
- Formularz: Przyciski z spinner icon i disabled state
- Nawigacja: Skeleton loader podczas sprawdzania auth
- Przekierowania: Loading screen z progress indicator
- API calls: Toast notifications z postępem operacji

## 3. LOGIKA BACKENDOWA

### 3.1 Endpointy API uwierzytelniania

#### 3.1.1 src/pages/api/auth/login.ts

**Endpoint:** `POST /api/auth/login`
**Odpowiedzialność:** Logowanie użytkownika przez Supabase Auth
**Request Body:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

**Response:**
```typescript
interface LoginResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}
```

**Implementacja:**
```typescript
export const POST: APIRoute = async ({ request }) => {
  const { email, password, rememberMe } = await request.json();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) return errorResponse(error);
  
  // Set session cookie for SSR (jeśli rememberMe)
  const response = successResponse(data);
  if (rememberMe) {
    response.headers.set('Set-Cookie', sessionCookie(data.session));
  }
  
  return response;
};
```

#### 3.1.2 src/pages/api/auth/signup.ts

**Endpoint:** `POST /api/auth/signup`
**Odpowiedzialność:** Rejestracja nowego użytkownika
**Request Body:**
```typescript
interface SignupRequest {
  email: string;
  password: string;
}
```

**Response:**
```typescript
interface SignupResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}
```

**Implementacja:**
```typescript
export const POST: APIRoute = async ({ request }) => {
  const { email, password } = await request.json();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Wyłączamy weryfikację emaila dla MVP
      emailRedirectTo: undefined,
    }
  });
  
  if (error) return errorResponse(error);
  
  return successResponse({
    user: data.user,
    message: 'Account created successfully'
  });
};
```

#### 3.1.3 src/pages/api/auth/forgot-password.ts

**Endpoint:** `POST /api/auth/forgot-password`
**Odpowiedzialność:** Wysłanie emaila z linkiem do resetu hasła
**Request Body:**
```typescript
interface ForgotPasswordRequest {
  email: string;
}
```

**Implementacja:**
```typescript
export const POST: APIRoute = async ({ request }) => {
  const { email } = await request.json();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${Astro.url.origin}/password-reset`,
  });
  
  // Security: zawsze zwracamy sukces, niezależnie czy email istnieje
  return successResponse({ 
    message: 'If an account exists, we\'ll send password reset instructions' 
  });
};
```

#### 3.1.4 src/pages/api/auth/reset-password.ts

**Endpoint:** `POST /api/auth/reset-password`
**Odpowiedzialność:** Ustawienie nowego hasła z tokenem
**Request Body:**
```typescript
interface ResetPasswordRequest {
  token: string;
  password: string;
}
```

**Implementacja:**
```typescript
export const POST: APIRoute = async ({ request }) => {
  const { token, password } = await request.json();
  
  // Verify token and set new password
  const { data, error } = await supabase.auth.updateUser({
    password: password
  });
  
  if (error) return errorResponse(error);
  
  return successResponse({
    message: 'Password reset successfully'
  });
};
```

#### 3.1.5 src/pages/api/auth/logout.ts

**Endpoint:** `POST /api/auth/logout`
**Odpowiedzialność:** Wylogowanie użytkownika
**Implementacja:**
```typescript
export const POST: APIRoute = async ({ request, locals }) => {
  const { error } = await locals.supabase.auth.signOut();
  
  if (error) return errorResponse(error);
  
  const response = successResponse({ message: 'Logged out successfully' });
  response.headers.set('Set-Cookie', 'session=; Max-Age=0; Path=/');
  
  return response;
};
```

#### 3.1.6 src/pages/api/auth/profile.ts

**Endpoint:** `PUT /api/auth/profile`
**Odpowiedzialność:** Aktualizacja profilu użytkownika
**Request Body:**
```typescript
interface UpdateProfileRequest {
  currentPassword: string;
  newPassword?: string;
}
```

**Implementacja:**
```typescript
export const PUT: APIRoute = async ({ request, locals }) => {
  const { currentPassword, newPassword } = await request.json();
  
  // Verify current password
  const user = await requireAuth(request);
  const { error: verifyError } = await locals.supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  });
  
  if (verifyError) {
    return errorResponse('Current password is incorrect');
  }
  
  // Update password if provided
  if (newPassword) {
    const { error } = await locals.supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) return errorResponse(error);
  }
  
  return successResponse({
    message: 'Profile updated successfully'
  });
};
```

### 3.2 Middleware uwierzytelniania

#### 3.2.1 Aktualizacja src/middleware/index.ts

**Nowe funkcjonalności:**
```typescript
export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  context.locals.supabase = supabase;
  
  // Get session from cookie or Authorization header
  const sessionToken = getSessionToken(context.request);
  
  if (sessionToken) {
    const { data: { user }, error } = await supabase.auth.getUser(sessionToken);
    
    if (!error && user) {
      context.locals.user = {
        id: user.id,
        email: user.email!,
        createdAt: user.created_at
      };
    }
  }
  
  // Check if route requires authentication
  if (isProtectedRoute(context.url.pathname)) {
    if (!context.locals.user) {
      return context.redirect('/login?redirect=' + encodeURIComponent(context.url.pathname));
    }
  }
  
  // Check if authenticated user accesses auth pages
  if (isAuthRoute(context.url.pathname) && context.locals.user) {
    return context.redirect('/plans');
  }
  
  return next();
});
```

#### 3.2.2 Utilities dla middleware

**src/utils/auth.ts:**
```typescript
export async function getUserIdFromRequest(request: Request): Promise<string> {
  const authHeader = request.headers.get('Authorization');
  const sessionCookie = getCookie(request, 'session');
  
  const token = authHeader?.replace('Bearer ', '') || sessionCookie;
  
  if (!token) {
    throw new UnauthorizedError('Token not provided');
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new UnauthorizedError('Invalid token');
  }
  
  return user.id;
}

export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ['/plans', '/profile', '/api/plans', '/api/user'];
  return protectedRoutes.some(route => pathname.startsWith(route));
}

export function isAuthRoute(pathname: string): boolean {
  const authRoutes = ['/login', '/signup', '/password-reset'];
  return authRoutes.includes(pathname);
}
```

### 3.3 Walidacja danych

#### 3.3.1 Zod schemas

**src/schemas/auth.ts:**
```typescript
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

export const SignupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number')
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number')
});

export const UpdateProfileSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain at least one number')
    .optional()
});
```

### 3.4 Obsługa błędów

#### 3.4.1 Rozszerzenie src/utils/errors.ts

**Nowe klasy błędów:**
```typescript
export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string = 'Validation failed') {
    super(message);
    this.name = 'ValidationError';
  }
}
```

#### 3.4.2 Error handling w endpointach

**Wspólna funkcja obsługi błędów:**
```typescript
export function handleAuthError(error: unknown): Response {
  if (error instanceof z.ZodError) {
    return new Response(JSON.stringify({
      error: 'Form data is invalid',
      details: error.errors
    }), { status: 400 });
  }
  
  if (error instanceof UnauthorizedError) {
    return new Response(JSON.stringify({
      error: error.message
    }), { status: 401 });
  }
  
  // Supabase Auth errors mapping
  if (error && typeof error === 'object' && 'message' in error) {
    return new Response(JSON.stringify({
      error: mapSupabaseError(error.message as string)
    }), { status: 400 });
  }
  
  return new Response(JSON.stringify({
    error: 'An unexpected error occurred'
  }), { status: 500 });
}

function mapSupabaseError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password';
  }
  if (message.includes('User already registered')) {
    return 'An account with this email already exists';
  }
  if (message.includes('Password should be at least')) {
    return 'Password does not meet security requirements';
  }
  return message;
}
```

## 4. SYSTEM AUTENTYKACJI

### 4.1 Integracja z Supabase Auth

#### 4.1.1 Konfiguracja klienta

**src/lib/supabase.ts:**
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../db/database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Client-side auth helper
export const supabaseAuth = {
  signIn: (email: string, password: string) => 
    supabase.auth.signInWithPassword({ email, password }),
  
  signUp: (email: string, password: string) =>
    supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: undefined // Wyłączamy weryfikację dla MVP
      }
    }),
  
  signOut: () => supabase.auth.signOut(),
  
  resetPassword: (email: string) =>
    supabase.auth.resetPasswordForEmail(email),
  
  updatePassword: (password: string) =>
    supabase.auth.updateUser({ password }),
  
  getSession: () => supabase.auth.getSession(),
  
  getUser: () => supabase.auth.getUser()
};
```

#### 4.1.2 Hook uwierzytelniania

**src/hooks/useAuth.ts:**
```typescript
import { useState, useEffect } from 'react';
import { supabaseAuth } from '../lib/supabase';
import type { AuthState, User } from '../types/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: undefined,
    error: undefined
  });

  useEffect(() => {
    // Check initial session
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: mapSupabaseUser(session.user),
            error: undefined
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: undefined,
            error: undefined
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabaseAuth.getSession();
      
      setAuthState({
        isAuthenticated: !!session,
        isLoading: false,
        user: session ? mapSupabaseUser(session.user) : undefined,
        error: undefined
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: undefined,
        error: 'Error checking session'
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabaseAuth.signIn(email, password);
    if (error) throw new Error(mapSupabaseError(error.message));
    return data;
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabaseAuth.signUp(email, password);
    if (error) throw new Error(mapSupabaseError(error.message));
    return data;
  };

  const signOut = async () => {
    const { error } = await supabaseAuth.signOut();
    if (error) throw new Error(mapSupabaseError(error.message));
  };

  return {
    authState,
    signIn,
    signUp,
    signOut,
    checkSession
  };
};
```

### 4.2 Zarządzanie sesjami

#### 4.2.1 Cookie management

**src/utils/cookies.ts:**
```typescript
export function setSessionCookie(response: Response, session: Session) {
  const cookie = `session=${session.access_token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${session.expires_in}; Path=/`;
  response.headers.set('Set-Cookie', cookie);
}

export function clearSessionCookie(response: Response) {
  const cookie = 'session=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/';
  response.headers.set('Set-Cookie', cookie);
}

export function getSessionFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies.session || null;
}
```

#### 4.2.2 Token refresh mechanism

**src/utils/auth-refresh.ts:**
```typescript
export async function refreshTokenIfNeeded(
  session: Session,
  supabase: SupabaseClient
): Promise<Session | null> {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = session.expires_at || 0;
  
  // Refresh token 5 minutes before expiry
  if (expiresAt - now < 300) {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: session.refresh_token
    });
    
    if (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
    
    return data.session;
  }
  
  return session;
}
```

### 4.3 Callbacks i redirect URLs

#### 4.3.1 Auth callback handler

**src/pages/auth/callback.astro:**
```astro
---
const { searchParams } = Astro.url;
const error = searchParams.get('error');
const type = searchParams.get('type');

if (error) {
  return Astro.redirect(`/login?error=${encodeURIComponent(error)}`);
}

if (type === 'recovery') {
  // Password reset callback
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  
  if (accessToken && refreshToken) {
    return Astro.redirect(`/password-reset?access_token=${accessToken}&refresh_token=${refreshToken}`);
  }
}

// Default redirect to plans
return Astro.redirect('/plans');
---
```

### 4.4 Ochrona tras i autoryzacja

#### 4.4.1 Route protection middleware

**src/middleware/auth-guard.ts:**
```typescript
import { defineMiddleware } from 'astro:middleware';

export const authGuard = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;
  
  // Skip auth check for public routes
  if (isPublicRoute(pathname)) {
    return next();
  }
  
  // Check authentication for protected routes
  if (isProtectedRoute(pathname)) {
    if (!context.locals.user) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      return context.redirect(loginUrl);
    }
  }
  
  // Redirect authenticated users from auth pages
  if (isAuthRoute(pathname) && context.locals.user) {
    return context.redirect('/plans');
  }
  
  return next();
});

function isPublicRoute(pathname: string): boolean {
  const publicRoutes = ['/', '/about', '/api/health'];
  return publicRoutes.includes(pathname);
}

function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ['/plans', '/profile', '/api/plans', '/api/user'];
  return protectedRoutes.some(route => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  const authRoutes = ['/login', '/signup', '/password-reset'];
  return authRoutes.includes(pathname);
}
```

#### 4.4.2 API route protection

**Wspólna funkcja dla API endpoints:**
```typescript
export async function requireAuth(request: Request): Promise<User> {
  const userId = await getUserIdFromRequest(request);
  
  if (!userId) {
    throw new UnauthorizedError('Authentication required');
  }
  
  return { id: userId, email: '' }; // Basic user info
}
```

### 4.5 Konfiguracja Supabase

#### 4.5.1 Ustawienia projektu Supabase

**Wyłączenie weryfikacji emaila:**
- W panelu Supabase: Authentication → Settings → Email Auth → Disable "Confirm email"

**Redirect URLs:**
- Development: `http://localhost:3000/auth/callback`
- Production: `https://yourdomain.com/auth/callback`

**Email templates:**
- Password reset: Przekierowanie do `/password-reset?access_token={access_token}&refresh_token={refresh_token}`

**RLS Policies:**
Wszystkie tabele z danymi użytkowników muszą mieć włączone Row Level Security zgodnie z istniejącymi politykami w migracji.

#### 4.5.2 Environment variables

**Wymagane zmienne środowiskowe:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

## 5. Implementacja scenariuszy

### 5.1 Przepływ rejestracji

1. Użytkownik wypełnia `SignupForm` z polami: email, hasło
2. Walidacja client-side przez `useForm` (format email, siła hasła)
3. Wysłanie POST do `/api/auth/signup`
4. Walidacja server-side przez Zod schema
5. Wywołanie `supabase.auth.signUp()` bez weryfikacji emaila
6. Zwrócenie komunikatu o pomyślnej rejestracji
7. Automatyczne przekierowanie do `/plans`

### 5.2 Przepływ logowania

1. Użytkownik wypełnia `LoginForm` z polami: email, hasło
2. Opcjonalne zaznaczenie "Remember me"
3. Walidacja client-side
4. Wysłanie POST do `/api/auth/login`
5. Wywołanie `supabase.auth.signInWithPassword()`
6. Ustawienie session cookie (jeśli "Remember me")
7. Przekierowanie do `/plans` lub URL z parametru `redirect`

### 5.3 Przepływ odzyskiwania hasła

1. Użytkownik wypełnia `ForgotPasswordForm` z polem email
2. Wysłanie POST do `/api/auth/forgot-password`
3. Wywołanie `resetPasswordForEmail()`
4. Wysłanie emaila z linkiem resetującym
5. Użytkownik klika link z tokenem
6. Przekierowanie do `/password-reset?access_token=...&refresh_token=...`
7. Renderowanie `ResetPasswordForm`
8. Wysłanie POST do `/api/auth/reset-password`
9. Wywołanie `updateUser({ password })`
10. Komunikat o pomyślnym zresetowaniu hasła
11. Możliwość zalogowania się nowym hasłem

### 5.4 Edycja profilu

1. Zalogowany użytkownik przechodzi do `/profile`
2. Wypełnia `ProfileForm` z polami: stare hasło, nowe hasło
3. Wysłanie PUT do `/api/auth/profile`
4. Weryfikacja starego hasła
5. Aktualizacja hasła jeśli podane
6. Komunikat o pomyślnej aktualizacji

### 5.5 Ochrona tras

1. Middleware sprawdza każde żądanie
2. Weryfikacja session token z cookie lub header
3. Pobranie user object z Supabase
4. Zapisanie user w `context.locals`
5. Sprawdzenie czy trasa wymaga uwierzytelnienia
6. Przekierowanie do `/login` jeśli brak uwierzytelnienia
7. Przekierowanie do `/plans` jeśli zalogowany użytkownik próbuje dostać się na stronę auth

## 6. Bezpieczeństwo

### 6.1 Najlepsze praktyki

- **HTTPS Only**: Wszystkie ciasteczka z flagą Secure
- **SameSite**: Ochrona przed CSRF z SameSite=Lax
- **HttpOnly**: Session cookies niedostępne dla JavaScript
- **Rate Limiting**: Ograniczenia na endpointach auth
- **Input Validation**: Zod schemas na wszystkich endpointach
- **Error Handling**: Nie ujawnianie wrażliwych informacji
- **Password Requirements**: Min 8 znaków, 1 duża litera, 1 cyfra

### 6.2 Supabase RLS

Wszystkie tabele aplikacji mają włączone Row Level Security z politykami:
- Użytkownicy widzą tylko swoje dane
- Operacje CRUD tylko na własnych zasobach

### 6.3 Session Management

- Sesje wygasają po 1 godzinie (domyślnie)
- Automatyczne odświeżanie tokenów
- Wylogowanie czyści wszystkie tokeny
- Bezpieczne przechowywanie w httpOnly cookies (opcjonalne)

## 7. Testowanie

### 7.1 Testy zgodności z User Stories

**US-001 - Rejestracja:**
- Formularz zawiera pola email i hasło (bez potwierdzenia)
- Walidacja formatu email
- Walidacja hasła (8+ znaków, 1 duża litera, 1 cyfra)
- Komunikat o pomyślnej rejestracji
- Przekierowanie do panelu użytkownika (/plans)
- Komunikat błędu gdy email zajęty

**US-002 - Logowanie:**
- Formularz zawiera pola email i hasło
- Przycisk "Forgot password"
- Komunikat błędu przy nieprawidłowych danych
- Przekierowanie do panelu użytkownika po logowaniu
- Opcja "Remember me"

**US-003 - Reset hasła:**
- Formularz z polem email
- Wysłanie emaila z linkiem
- Link prowadzi do formularza nowego hasła
- Komunikat o pomyślnym resecie
- Możliwość logowania nowym hasłem

**US-004 - Edycja profilu:**
- Możliwość zmiany hasła z podaniem starego
- Przycisk zapisania zmian
- Komunikat o pomyślnej aktualizacji

### 7.2 Integration testy

- Pełne przepływy auth zgodne z PRD
- API endpoints z prawdziwym Supabase
- Middleware protection
- Redirect logic

### 7.3 E2E testy

- Rejestracja bez weryfikacji emaila
- Logowanie i wylogowanie
- Reset hasła z emailem
- Ochrona tras
- Responsywność interfejsu

## 8. Podsumowanie zgodności z PRD

### 8.1 Rozwiązane sprzeczności

1. **Pole potwierdzenia hasła**: Usunięto z rejestracji zgodnie z US-001
2. **Weryfikacja emaila**: Wyłączona dla MVP (nie wymagana przez PRD)
3. **Przekierowania**: Wszystkie prowadzą do `/plans` jako "panel użytkownika"
4. **Komunikaty błędów**: Dostosowane do wymagań PRD

### 8.2 Implementowane User Stories

- ✅ US-000: Bezpieczny dostęp i uwierzytelnianie
- ✅ US-001: Rejestracja (email + hasło, bez potwierdzenia)
- ✅ US-002: Logowanie (z opcją "Remember me")
- ✅ US-003: Odzyskiwanie hasła (pełny przepływ)
- ✅ US-004: Edycja profilu (zmiana hasła)

### 8.3 Zgodność z wymaganiami funkcjonalnymi

- ✅ System kont użytkowników (sekcja 3.1 PRD)
- ✅ Ochrona funkcji planowania dla zalogowanych (US-000)
- ✅ Dedykowane strony uwierzytelniania
- ✅ Nawigacja w prawym górnym rogu
- ✅ Brak zewnętrznych serwisów logowania

Ten dokument stanowi zaktualizowaną specyfikację techniczną implementacji modułu uwierzytelniania w pełnej zgodności z wymaganiami PRD i najlepszymi praktykami bezpieczeństwa dla aplikacji Astro z Supabase Auth. 