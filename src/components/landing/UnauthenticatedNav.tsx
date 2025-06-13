import type { UnauthenticatedNavProps } from '../../types/landing';
import { LoginButton } from './LoginButton';
import { SignupButton } from './SignupButton';

/**
 * Nawigacja dla niezalogowanych użytkowników
 */
export const UnauthenticatedNav: React.FC<UnauthenticatedNavProps> = ({
  onLogin,
  onSignup
}) => {
  return (
    <nav className="flex items-center space-x-4">
      <LoginButton onClick={onLogin} />
      <SignupButton onClick={onSignup} />
    </nav>
  );
}; 