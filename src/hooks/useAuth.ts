import { useState, useEffect, useRef } from 'react';
import { supabase as getSupabaseClient } from '../db/supabase.client';
import type { AuthState, User } from '../types/landing';

/**
 * Custom hook do zarządzania stanem uwierzytelnienia
 * Integracja z Supabase Auth
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: undefined,
    user: undefined
  });

  // Ref do śledzenia czy już sprawdzaliśmy użytkownika
  const hasCheckedUser = useRef(false);
  const isCheckingUser = useRef(false);

  useEffect(() => {
    // Sprawdź początkową sesję tylko raz
    if (!hasCheckedUser.current && !isCheckingUser.current) {
      checkUser();
    }
    
    // Nasłuchuj zmian stanu uwierzytelnienia
    const supabase = getSupabaseClient();
    
    if (!supabase) {
      // Jeśli Supabase nie jest dostępny, ustaw stan jako niezalogowany
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: undefined, // Nie traktujemy tego jako błąd
        user: undefined
      });
      hasCheckedUser.current = true;
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Nie sprawdzaj ponownie dla INITIAL_SESSION jeśli już sprawdzaliśmy
        if (event === 'INITIAL_SESSION' && hasCheckedUser.current) {
          return;
        }

        if (event === 'SIGNED_IN' && session) {
          // Użyj getUser() aby zweryfikować autentyczność użytkownika
          await verifyAndSetUser();
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: undefined,
            error: undefined
          });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Ponownie zweryfikuj użytkownika po odświeżeniu tokena
          await verifyAndSetUser();
        } else if (event === 'INITIAL_SESSION') {
          // Dla initial session również użyj getUser()
          if (session) {
            await verifyAndSetUser();
          } else {
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              user: undefined,
              error: undefined
            });
          }
          hasCheckedUser.current = true;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const verifyAndSetUser = async () => {
    if (isCheckingUser.current) {
      return; // Już sprawdzamy, nie rób tego ponownie
    }

    try {
      isCheckingUser.current = true;
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: undefined,
          error: error ? 'Authentication verification failed' : undefined
        });
      } else {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: mapSupabaseUser(user),
          error: undefined
        });
      }
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: undefined,
        error: 'Authentication verification failed'
      });
    } finally {
      isCheckingUser.current = false;
    }
  };

  const checkUser = async () => {
    if (isCheckingUser.current) {
      return; // Już sprawdzamy, nie rób tego ponownie
    }

    try {
      isCheckingUser.current = true;
      hasCheckedUser.current = true;
      
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        // Jeśli Supabase nie jest dostępny, ustaw stan jako niezalogowany
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: undefined,
          error: undefined
        });
        return;
      }

      // Użyj getUser() zamiast getSession() dla bezpieczeństwa
      const { data: { user }, error } = await supabase.auth.getUser();
      
      setAuthState({
        isAuthenticated: !error && !!user,
        isLoading: false,
        user: user && !error ? mapSupabaseUser(user) : undefined,
        error: error ? 'Authentication verification failed' : undefined
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: undefined,
        error: 'Error checking authentication'
      });
    } finally {
      isCheckingUser.current = false;
    }
  };

  const logout = async () => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(mapSupabaseError(error.message));
      }
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: undefined,
        error: undefined
      });
      
      // Reset flag po wylogowaniu
      hasCheckedUser.current = false;
    } catch (error) {
      setAuthState(prevState => ({
        ...prevState,
        error: 'Error during logout'
      }));
      throw error;
    }
  };

  return { authState, logout };
};

/**
 * Mapuje użytkownika Supabase na lokalny typ User
 */
function mapSupabaseUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || ''
  };
}

/**
 * Mapuje błędy Supabase na przyjazne komunikaty
 */
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