import React from "react";
import type { AuthLayoutProps } from "../../types/auth";
import { Logo } from "../landing/Logo";

/**
 * Wspólny layout dla stron uwierzytelniania
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, description, children }) => {
  const handleLogoClick = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo onClick={handleLogoClick} />
        </div>

        {/* Nagłówek */}
        <div className="mt-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
        </div>
      </div>

      {/* Kontener formularza */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">{children}</div>
      </div>
    </div>
  );
};
