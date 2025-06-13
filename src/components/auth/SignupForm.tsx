import React, { useState } from 'react';
import type { SignupFormProps, SignupFormData, FormState } from '../../types/auth';
import { useForm, validationRules } from '../../hooks/useForm';
import { FormField } from './FormField';
import { ErrorMessage } from './ErrorMessage';
import { SuccessMessage } from './SuccessMessage';

/**
 * Formularz rejestracji
 */
export const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  onLoginRedirect
}) => {
  const [formState, setFormState] = useState<FormState>({
    isLoading: false
  });

  const initialValues: SignupFormData = { email: '', password: '', confirmPassword: '' };

  const {
    values,
    errors,
    setValue,
    markAsTouched,
    validate
  } = useForm<SignupFormData>(
    initialValues,
    {
      email: validationRules.email,
      password: validationRules.password,
      confirmPassword: (value: string): string | undefined => validationRules.confirmPassword(value, values.password)
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
        success: 'Account created successfully! Please check your email to verify your account.' 
      });
    } catch (error) {
      setFormState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed. Please try again.'
      });
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onLoginRedirect();
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
        onChange={(value) => {
          setValue('password', value);
          // Rewalidacja confirm password gdy zmienia się password
          if (values.confirmPassword) {
            setValue('confirmPassword', values.confirmPassword);
          }
        }}
        onBlur={() => markAsTouched('password')}
        error={errors.password}
        placeholder="Create a password"
        required
        disabled={formState.isLoading}
      />

      <FormField
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={values.confirmPassword}
        onChange={(value) => setValue('confirmPassword', value)}
        onBlur={() => markAsTouched('confirmPassword')}
        error={errors.confirmPassword}
        placeholder="Confirm your password"
        required
        disabled={formState.isLoading}
      />

      {/* Informacja o wymaganiach hasła */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Password requirements:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>At least 8 characters long</li>
          <li>Contains uppercase and lowercase letters</li>
          <li>Contains at least one number</li>
        </ul>
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
            Creating account...
          </div>
        ) : (
          'Create account'
        )}
      </button>

      {/* Link do logowania */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={handleLoginClick}
            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
            disabled={formState.isLoading}
          >
            Sign in here
          </button>
        </p>
      </div>
    </form>
  );
}; 