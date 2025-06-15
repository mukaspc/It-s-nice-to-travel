import { useState } from "react";
import type { FieldErrors } from "../types/auth";

/**
 * Custom hook do obsługi formularzy z walidacją
 */
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: Partial<Record<keyof T, (value: any) => string | undefined>>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  // Ustawienie wartości pola
  const setValue = (name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));

    // Walidacja przy zmianie wartości jeśli pole było już dotknięte
    if (touched[name] && validationRules?.[name]) {
      const error = validationRules[name]!(value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Oznaczenie pola jako dotknięte
  const markAsTouched = (name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Walidacja przy opuszczeniu pola
    if (validationRules?.[name]) {
      const error = validationRules[name]!(values[name]);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Walidacja wszystkich pól
  const validate = (): boolean => {
    if (!validationRules) return true;

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach((key) => {
      const fieldName = key as keyof T;
      const rule = validationRules[fieldName];
      if (rule) {
        const error = rule(values[fieldName]);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Reset formularza
  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    markAsTouched,
    validate,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
};

// Reguły walidacji dla pól email i hasła
export const validationRules = {
  email: (value: string): string | undefined => {
    if (!value) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Please enter a valid email address";
    }
    return undefined;
  },

  password: (value: string): string | undefined => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])/.test(value)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(value)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(value)) return "Password must contain at least one number";
    return undefined;
  },

  confirmPassword: (value: string, originalPassword?: string): string | undefined => {
    if (!value) return "Please confirm your password";
    if (originalPassword && value !== originalPassword) {
      return "Passwords do not match";
    }
    return undefined;
  },
};
