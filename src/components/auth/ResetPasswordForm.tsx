import React, { useState } from "react";
import type { ResetPasswordFormProps, ResetPasswordFormData, FormState } from "../../types/auth";
import { useForm, validationRules } from "../../hooks/useForm";
import { FormField } from "./FormField";
import { ErrorMessage } from "./ErrorMessage";
import { SuccessMessage } from "./SuccessMessage";

/**
 * Formularz ustawiania nowego hasła
 */
export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSubmit, token }) => {
  const [formState, setFormState] = useState<FormState>({
    isLoading: false,
  });

  const initialValues: ResetPasswordFormData = { password: "", confirmPassword: "" };

  const { values, errors, setValue, markAsTouched, validate } = useForm<ResetPasswordFormData>(initialValues, {
    password: validationRules.password,
    confirmPassword: (value: string): string | undefined => validationRules.confirmPassword(value, values.password),
  });

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
        success: "Your password has been reset successfully! You can now sign in with your new password.",
      });
    } catch (error) {
      setFormState({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to reset password. Please try again or request a new reset link.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Komunikaty */}
      {formState.error && <ErrorMessage message={formState.error} />}
      {formState.success && <SuccessMessage message={formState.success} />}

      {/* Instrukcje */}
      <div className="text-sm text-gray-600">
        <p>Enter your new password below. Make sure it meets all the security requirements.</p>
      </div>

      {/* Pola formularza */}
      <FormField
        label="New Password"
        type="password"
        name="password"
        value={values.password}
        onChange={(value) => {
          setValue("password", value);
          // Rewalidacja confirm password gdy zmienia się password
          if (values.confirmPassword) {
            setValue("confirmPassword", values.confirmPassword);
          }
        }}
        onBlur={() => markAsTouched("password")}
        error={errors.password}
        placeholder="Enter your new password"
        required
        disabled={formState.isLoading}
      />

      <FormField
        label="Confirm New Password"
        type="password"
        name="confirmPassword"
        value={values.confirmPassword}
        onChange={(value) => setValue("confirmPassword", value)}
        onBlur={() => markAsTouched("confirmPassword")}
        error={errors.confirmPassword}
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
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Resetting password...
          </div>
        ) : (
          "Reset password"
        )}
      </button>

      {/* Informacja o tokenie (ukryta) */}
      <input type="hidden" name="token" value={token} />
    </form>
  );
};
