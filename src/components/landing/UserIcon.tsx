import type { User } from "../../types/landing";

interface UserIconProps {
  user: User;
  className?: string;
}

/**
 * Ikona użytkownika - wyświetla inicjały lub domyślną ikonę
 */
export const UserIcon: React.FC<UserIconProps> = ({ user, className = "" }) => {
  // Pobierz inicjały z emaila użytkownika
  const getInitials = (email: string): string => {
    const parts = email.split("@")[0];
    return parts.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium ${className}`}
    >
      {getInitials(user.email)}
    </div>
  );
};
