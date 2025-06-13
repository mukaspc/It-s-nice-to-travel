import React, { useState } from 'react';
import type { LoginFormProps, LoginFormData, FormState } from '../../types/auth';
import { useForm, validationRules } from '../../hooks/useForm';
import { FormField } from './FormField';
import { ErrorMessage } from './ErrorMessage';
import { SuccessMessage } from './SuccessMessage';

/**
 * Formularz logowania
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onForgotPassword,
  onSignupRedirect
}) => {
  const [formState, setFormState] = useState<FormState>({
    isLoading: false
  });

  const {
    values,
    errors,
    setValue,
    markAsTouched,
    validate
  } = useForm<LoginFormData>(
    { email: '', password: '', rememberMe: false },
    {
      email: validationRules.email,
      password: validationRules.password
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setFormState({ isLoading: true });

    try {
      await onSubmit(values);
      setFormState({ 
        isLoading: false, 
        success: 'Login successful! Redirecting...' 
      });
    } catch (error) {
      setFormState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed. Please try again.'
      });
    }
  };

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onForgotPassword();
  };

  const handleSignupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSignupRedirect();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Komunikaty */}
      {formState.error && (
        <ErrorMessage message={formState.error} />
      )}
      {formState.success && (
        <SuccessMessage message={formState.success} />
      )}

      {/* Pola formularza */}
      <FormField
        label="Email address"
        type="email"
        name="email"
        value={values.email}
        onChange={(value) => setValue('email', value)}
        onBlur={() => markAsTouched('email')}
        error={errors.email}
        placeholder="Enter your email"
        required
        disabled={formState.isLoading}
      />

      <FormField
        label="Password"
        type="password"
        name="password"
        value={values.password}
        onChange={(value) => setValue('password', value)}
        onBlur={() => markAsTouched('password')}
        error={errors.password}
        placeholder="Enter your password"
        required
        disabled={formState.isLoading}
      />

      {/* Remember me checkbox i link do resetu hasła */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={values.rememberMe || false}
            onChange={(e) => setValue('rememberMe', e.target.checked)}
            disabled={formState.isLoading}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <button
          type="button"
          onClick={handleForgotPasswordClick}
          className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
          disabled={formState.isLoading}
        >
          Forgot your password?
        </button>
      </div>

      {/* Przycisk submit */}
      <button
        type="submit"
        disabled={formState.isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {formState.isLoading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </div>
        ) : (
          'Sign in'
        )}
      </button>

      {/* Link do rejestracji */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={handleSignupClick}
            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
            disabled={formState.isLoading}
          >
            Sign up here
          </button>
        </p>
      </div>
    </form>
  );
}; 