interface SignupButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Przycisk rejestracji - z większym akcentem wizualnym
 */
export const SignupButton: React.FC<SignupButtonProps> = ({ 
  onClick, 
  className = "" 
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors ${className}`}
    >
      Sign up
    </button>
  );
}; 