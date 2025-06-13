import { useEffect, useRef } from 'react';
import type { GeneratedPlanDTO } from '../types';

interface Props {
  plan: GeneratedPlanDTO;
}

export function PlanView({ plan }: Props) {
  const imageRefs = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    imageRefs.current.forEach((img) => {
      if (img) {
        observer.observe(img);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const registerImage = (img: HTMLImageElement | null, url: string) => {
    if (img && url) {
      imageRefs.current.set(url, img);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {plan.content.places.map((place) => (
        <div key={place.name} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{place.name}</h2>
          {place.days.map((day) => (
            <div key={day.date} className="mb-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">{day.date}</h3>
              
              <div className="space-y-4">
                {day.schedule.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-1/3">
                      {item.image_url && (
                        <img
                          ref={(img) => registerImage(img, item.image_url!)}
                          data-src={item.image_url}
                          alt={item.activity}
                          className="w-full h-48 object-cover rounded-lg bg-gray-100"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="w-2/3">
                      <div className="text-gray-600">{item.time}</div>
                      <div className="font-semibold">{item.activity}</div>
                      <div className="text-sm text-gray-500">{item.address}</div>
                      <div className="mt-2 text-gray-700">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Dining Recommendations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {day.dining_recommendations.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      {item.image_url && (
                        <img
                          ref={(img) => registerImage(img, item.image_url!)}
                          data-src={item.image_url}
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-lg mb-3 bg-gray-100"
                          loading="lazy"
                        />
                      )}
                      <div className="text-sm text-gray-600">{item.type}</div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.address}</div>
                      <div className="mt-2 text-sm text-gray-700">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
} 