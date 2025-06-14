import React from 'react';

interface LogoProps {
  onClick?: () => void;
  className?: string;
}

/**
 * Logo aplikacji - tekstowa reprezentacja
 */
export const Logo: React.FC<LogoProps> = ({ onClick, className = "" }) => {
  return (
    <div 
      className={`font-bold text-xl cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      onClick={onClick}
    >
      <span className="text-blue-600">It's nice</span>
      <span className="text-emerald-600 ml-1">to travel</span>
    </div>
  );
}; 