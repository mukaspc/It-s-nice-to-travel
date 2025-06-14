import type { HeroSectionProps } from '../../types/landing';

/**
 * Główna sekcja hero z nagłówkiem, opisem i przyciskiem CTA
 */
export const HeroSection: React.FC<HeroSectionProps> = ({
  heroContent,
  onCTAClick,
  authState
}) => {
  // Określ tekst i akcję CTA na podstawie stanu uwierzytelnienia
  const getCTAContent = () => {
    if (authState?.isAuthenticated) {
      return {
        text: 'Go to My Plans',
        description: 'Continue planning your amazing trips'
      };
    }
    return {
      text: heroContent.ctaText,
      description: heroContent.description
    };
  };

  const ctaContent = getCTAContent();

  return (
    <section className="bg-gradient-to-br from-blue-50 to-emerald-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-blue-600">Plan</span>{' '}
            <span className="text-emerald-600">trips</span>{' '}
            <span className="block sm:inline">with AI</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {ctaContent.description}
          </p>
          
          <button
            onClick={onCTAClick}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {ctaContent.text}
            <svg 
              className="ml-2 w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7l5 5m0 0l-5 5m5-5H6" 
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}; 