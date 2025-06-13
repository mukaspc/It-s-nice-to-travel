import React, { useState } from 'react';
import type { ProfileFormProps, ProfileFormData, FormState } from '../../types/auth';
import { useForm, validationRules } from '../../hooks/useForm';
import { FormField } from './FormField';
import { ErrorMessage } from './ErrorMessage';
import { SuccessMessage } from './SuccessMessage';

/**
 * Formularz edycji profilu użytkownika
 */
export const ProfileForm: React.FC<ProfileFormProps> = ({
  onSubmit
}) => {
  const [formState, setFormState] = useState<FormState>({
    isLoading: false
  });

  const initialValues: ProfileFormData = { 
    currentPassword: '', 
    newPassword: '', 
    confirmNewPassword: '' 
  };

  const {
    values,
    errors,
    setValue,
    markAsTouched,
    validate
  } = useForm<ProfileFormData>(
    initialValues,
    {
      currentPassword: (value: string): string | undefined => {
        if (!value) return 'Current password is required';
        return undefined;
      },
      newPassword: (value: string): string | undefined => {
        if (!value) return 'New password is required';
        return validationRules.password(value);
      },
      confirmNewPassword: (value: string): string | undefined => 
        validationRules.confirmPassword(value, values.newPassword)
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
        success: 'Profile updated successfully!' 
      });
      // Reset form after successful update
      setValue('currentPassword', '');
      setValue('newPassword', '');
      setValue('confirmNewPassword', '');
    } catch (error) {
      setFormState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update profile. Please try again.'
      });
    }
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

      {/* Instrukcje */}
      <div className="text-sm text-gray-600">
        <p>
          To change your password, please enter your current password and choose a new one.
        </p>
      </div>

      {/* Pola formularza */}
      <FormField
        label="Current Password"
        type="password"
        name="currentPassword"
        value={values.currentPassword}
        onChange={(value) => setValue('currentPassword', value)}
        onBlur={() => markAsTouched('currentPassword')}
        error={errors.currentPassword}
        placeholder="Enter your current password"
        required
        disabled={formState.isLoading}
      />

      <FormField
        label="New Password"
        type="password"
        name="newPassword"
        value={values.newPassword}
        onChange={(value) => {
          setValue('newPassword', value);
          // Rewalidacja confirm password gdy zmienia się new password
          if (values.confirmNewPassword) {
            setValue('confirmNewPassword', values.confirmNewPassword);
          }
        }}
        onBlur={() => markAsTouched('newPassword')}
        error={errors.newPassword}
        placeholder="Enter your new password"
        required
        disabled={formState.isLoading}
      />

      <FormField
        label="Confirm New Password"
        type="password"
        name="confirmNewPassword"
        value={values.confirmNewPassword}
        onChange={(value) => setValue('confirmNewPassword', value)}
        onBlur={() => markAsTouched('confirmNewPassword')}
        error={errors.confirmNewPassword}
        placeholder="Confirm your new password"
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
            Updating profile...
          </div>
        ) : (
          'Update Profile'
        )}
      </button>
    </form>
  );
}; 