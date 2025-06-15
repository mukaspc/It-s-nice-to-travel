import type { FeaturesSectionProps } from "../../types/landing";
import { FeatureCard } from "./FeatureCard";

/**
 * Sekcja z kartami przedstawiającymi zalety serwisu
 */
export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ features }) => {
  if (!features || features.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">No features to display</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Why choose our solution?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Discover the benefits of AI-powered travel planning</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};
