import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, MapPin, Clock, Utensils } from 'lucide-react';
import type { GeneratedPlanDTO } from '../../types';

interface GeneratedPlanViewProps {
  planId: string;
}

export function GeneratedPlanView({ planId }: GeneratedPlanViewProps) {
  const [plan, setPlan] = useState<GeneratedPlanDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/plans/${planId}/generated`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch plan');
        }
        const data = await response.json();
        setPlan(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-48 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button variant="outline" onClick={() => window.location.href = '/plans'}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => window.location.href = '/plans'}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
      </div>

      {plan.content.places.map((place) => (
        <div key={place.name} className="space-y-4">
          <h2 className="text-2xl font-bold">{place.name}</h2>
          
          {place.days.map((day) => (
            <Card key={day.date}>
              <CardHeader>
                <CardTitle>{new Date(day.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Schedule */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Schedule</h3>
                    {day.schedule.map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex-shrink-0 w-24 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 inline-block mr-1" />
                          {item.time}
                        </div>
                        <div className="flex-grow space-y-2">
                          <h4 className="font-medium">{item.activity}</h4>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {item.address}
                          </p>
                          <p className="text-sm">{item.description}</p>
                          {item.image_url && (
                            <img 
                              src={item.image_url} 
                              alt={item.activity}
                              className="rounded-md w-full max-w-lg h-48 object-cover mt-2"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dining Recommendations */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Dining Recommendations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {day.dining_recommendations.map((recommendation, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Utensils className="h-4 w-4" />
                                <span className="capitalize">{recommendation.type}</span>
                              </div>
                              <h4 className="font-medium">{recommendation.name}</h4>
                              <p className="text-sm text-muted-foreground flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {recommendation.address}
                              </p>
                              <p className="text-sm">{recommendation.description}</p>
                              {recommendation.image_url && (
                                <img 
                                  src={recommendation.image_url} 
                                  alt={recommendation.name}
                                  className="rounded-md w-full h-32 object-cover mt-2"
                                />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
} 