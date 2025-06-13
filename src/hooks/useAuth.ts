import { useState, useEffect } from 'react';
import type { AuthState } from '../types/landing';

/**
 * Custom hook do zarządzania stanem uwierzytelnienia
 * Na razie implementacja mockowa - integracja z Supabase Auth zostanie dodana później
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: undefined,
    user: undefined
  });

  useEffect(() => {
    // Symulacja sprawdzenia stanu uwierzytelnienia
    // TODO: Zastąpić integracją z Supabase Auth
    const checkAuthStatus = async () => {
      try {
        // Symulacja delay sprawdzania auth
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mockowe sprawdzenie - na razie zawsze niezalogowany
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: undefined,
          user: undefined
        });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: 'Błąd podczas sprawdzania stanu uwierzytelnienia',
          user: undefined
        });
      }
    };

    checkAuthStatus();
  }, []);

  const logout = async () => {
    try {
      // TODO: Implementacja wylogowania z Supabase
      setAuthState(prevState => ({
        ...prevState,
        isAuthenticated: false,
        user: undefined,
        error: undefined
      }));
    } catch (error) {
      setAuthState(prevState => ({
        ...prevState,
        error: 'Wystąpił błąd podczas wylogowywania'
      }));
      throw error;
    }
  };

  return { authState, logout };
}; 