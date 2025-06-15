import React from "react";
import type { SuccessMessageProps } from "../../types/auth";

/**
 * Komponent komunikatu sukcesu
 */
export const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, className = "" }) => {
  if (!message) return null;

  return (
    <div className={`p-4 rounded-lg bg-green-50 border border-green-200 ${className}`} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-green-700">{message}</p>
        </div>
      </div>
    </div>
  );
};
