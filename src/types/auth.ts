// Typy dla formularzy uwierzytelniania

// Stan formularza
export interface FormState {
  isLoading: boolean;
  error?: string;
  success?: string;
}

// Dane formularza logowania
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Dane formularza rejestracji
export interface SignupFormData {
  email: string;
  password: string;
}

// Dane formularza resetu hasła
export interface ForgotPasswordFormData {
  email: string;
}

// Dane formularza nowego hasła
export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// Dane formularza edycji profilu
export interface ProfileFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Błędy walidacji pól
export interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

// Props dla komponentów auth
export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  onForgotPassword: () => void;
  onSignupRedirect: () => void;
}

export interface SignupFormProps {
  onSubmit: (data: SignupFormData) => Promise<void>;
  onLoginRedirect: () => void;
}

export interface ForgotPasswordFormProps {
  onSubmit: (data: ForgotPasswordFormData) => Promise<void>;
  onBackToLogin: () => void;
}

export interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => Promise<void>;
  token: string;
}

export interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => Promise<void>;
}

// Props dla layoutu auth
export interface AuthLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

// Props dla pola formularza
export interface FormFieldProps {
  label: string;
  type: "text" | "email" | "password";
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

// Props dla komunikatu błędu
export interface ErrorMessageProps {
  message: string;
  className?: string;
}

// Props dla komunikatu sukcesu
export interface SuccessMessageProps {
  message: string;
  className?: string;
}
