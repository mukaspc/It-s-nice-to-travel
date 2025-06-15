interface LoginButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Przycisk logowania
 */
export const LoginButton: React.FC<LoginButtonProps> = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors ${className}`}
    >
      Sign in
    </button>
  );
};
