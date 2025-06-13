import type { AIAdvantageSectionProps } from '../../types/landing';

/**
 * Sekcja z obrazem i opisem przewagi wykorzystania AI
 */
export const AIAdvantageSection: React.FC<AIAdvantageSectionProps> = ({ aiAdvantage }) => {
  if (!aiAdvantage || !aiAdvantage.title || !aiAdvantage.description) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Obraz po lewej stronie na desktop */}
          <div className="order-2 lg:order-1">
            <div className="relative">
              <img
                src={aiAdvantage.imageUrl}
                alt={aiAdvantage.imageAlt}
                className="rounded-2xl shadow-lg w-full h-auto"
                onError={(e) => {
                  // Fallback do placeholder jeśli obraz się nie załaduje
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial, sans-serif" font-size="18" fill="%236b7280" text-anchor="middle" dy="0.3em"%3ETravel planning image%3C/text%3E%3C/svg%3E';
                }}
              />
              {/* Dekoracyjny element */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 blur-xl"></div>
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-emerald-100 rounded-full opacity-50 blur-xl"></div>
            </div>
          </div>

          {/* Tekst po prawej stronie na desktop */}
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              {aiAdvantage.title}
            </h2>
            <div className="prose prose-lg text-gray-600 max-w-none">
              <p className="text-xl leading-relaxed mb-6">
                {aiAdvantage.description}
              </p>
            </div>
            
            {/* Lista przewag AI */}
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-700">
                  <strong>Time savings</strong> - automated search and route planning
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-700">
                  <strong>Personalization</strong> - considers your preferences and interests
                </p>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-700">
                  <strong>Hidden gems</strong> - discover places off the beaten path
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 