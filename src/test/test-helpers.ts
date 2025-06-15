import { vi } from 'vitest';
import type { Mock } from 'vitest';

// Mock factory for Supabase client
export const createMockSupabaseClient = () => {
  return {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
      then: vi.fn(),
    })),
  };
};

// Mock factory for AI service
export const createMockAIService = () => {
  return {
    generatePlan: vi.fn(),
    checkStatus: vi.fn(),
    cancelGeneration: vi.fn(),
  };
};

// Helper to create mock functions with typed return values
export const createTypedMock = <T extends (...args: any[]) => any>() => {
  return vi.fn() as Mock<Parameters<T>, ReturnType<T>>;
};

// Helper to wait for async operations in tests
export const waitFor = (ms: number = 0) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper to create mock component props
export const createMockProps = <T>(overrides: Partial<T> = {}): T => {
  return {
    ...overrides,
  } as T;
};

// Mock localStorage for tests
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// Mock window.matchMedia for responsive tests
export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Helper to mock console methods
export const mockConsole = () => {
  return {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
  };
}; 