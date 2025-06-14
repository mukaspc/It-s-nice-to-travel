import { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Sprawdź początkową sesję
    checkSession();
    
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
      return;
    }

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
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: mapSupabaseUser(session.user),
            error: undefined
          });
        } else if (event === 'INITIAL_SESSION') {
          setAuthState({
            isAuthenticated: !!session,
            isLoading: false,
            user: session ? mapSupabaseUser(session.user) : undefined,
            error: undefined
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkSession = async () => {
    try {
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

      const { data: { session } } = await supabase.auth.getSession();
      
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