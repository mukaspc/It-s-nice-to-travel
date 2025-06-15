import type { AuthenticatedNavProps } from "../../types/landing";
import { UserDropdown } from "./UserDropdown";

/**
 * Nawigacja dla zalogowanych użytkowników z dropdown menu
 */
export const AuthenticatedNav: React.FC<AuthenticatedNavProps> = ({ user, onNavigateToPlans, onLogout }) => {
  return (
    <nav className="flex items-center">
      <UserDropdown user={user} onNavigateToPlans={onNavigateToPlans} onLogout={onLogout} />
    </nav>
  );
};
