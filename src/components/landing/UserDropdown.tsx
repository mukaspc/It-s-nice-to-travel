import { useState, useRef, useEffect } from 'react';
import type { UserDropdownProps } from '../../types/landing';
import { UserIcon } from './UserIcon';

/**
 * Dropdown menu z opcjami dla zalogowanego użytkownika
 */
export const UserDropdown: React.FC<UserDropdownProps> = ({
  user,
  onNavigateToPlans,
  onLogout
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Zamknij dropdown po kliknięciu poza komponentem
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigateToPlans = () => {
    setIsOpen(false);
    onNavigateToPlans();
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <UserIcon user={user} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={handleNavigateToPlans}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            My plans
          </button>
          <hr className="my-1 border-gray-200" />
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}; 