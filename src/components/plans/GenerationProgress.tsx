import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { ArrowLeft, Timer, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import type { GeneratePlanResponseDTO, GeneratedPlanStatusDTO, PlanDetailDTO } from '../../types';

interface GenerationProgressProps {
  planId: string;
}

export function GenerationProgress({ planId }: GenerationProgressProps) {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<'processing' | 'completed' | 'failed' | null>(null);
  const { navigateToPlans } = useNavigation();

  useEffect(() => {
    const validateAndStartGeneration = async () => {
      try {
        // First, validate that the plan has places
        const planResponse = await fetch(`/api/plans/${planId}`);
        
        if (!planResponse.ok) {
          const errorData = await planResponse.json();
          throw new Error(errorData.error || 'Failed to fetch plan details');
        }

        const planData: PlanDetailDTO = await planResponse.json();
        
        // Check if plan has places
        if (!planData.places || planData.places.length === 0) {
          setError('Cannot generate plan: No places have been added to this travel plan. Please add at least one place before generating your itinerary.');
          return;
        }

        // If validation passes, start the generation
        const response = await fetch(`/api/plans/${planId}/generate`, {
          method: 'POST',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to start generation');
        }

        const data: GeneratePlanResponseDTO = await response.json();
        setEstimatedTime(data.estimated_time);
        setIsGenerating(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    };

    validateAndStartGeneration();
  }, [planId]);

  useEffect(() => {
    if (!isGenerating) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/plans/${planId}/generate/status`);
        
        if (response.status === 404) {
          // Generation not started yet or no status available
          return false;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to check generation status');
        }

        const statusData: GeneratedPlanStatusDTO = await response.json();
        
        setProgress(statusData.progress);
        setEstimatedTime(statusData.estimated_time_remaining);
        setStatus(statusData.status);

        // If generation is completed, redirect to view page
        if (statusData.status === 'completed') {
          setTimeout(() => {
            window.location.href = `/plans/${planId}/view`;
          }, 1000);
          return true;
        }

        // If generation failed, show error
        if (statusData.status === 'failed') {
          setError('Plan generation failed. Please try again.');
          return true;
        }

        return false;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        return false;
      }
    };

    // Check status immediately
    checkStatus();

    // Then check every 2 seconds
    const interval = setInterval(async () => {
      const isComplete = await checkStatus();
      if (isComplete) {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [planId, isGenerating]);

  const handleBackToPlans = () => {
    navigateToPlans();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBackToPlans}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertTriangle className="h-12 w-12 text-amber-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Cannot Generate Plan</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={handleBackToPlans}>
                  Back to Plans
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => window.location.href = `/plans/${planId}/edit`}
                >
                  Add Places
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBackToPlans}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating Your Travel Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {progress < 100 ? `Generating your perfect travel plan... ${progress}%` : 'Generation complete!'}
            </p>
          </div>

          {estimatedTime !== null && estimatedTime > 0 && progress < 100 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>Estimated time remaining: {Math.ceil(estimatedTime)} seconds</span>
            </div>
          )}

          {status === 'processing' && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Our AI is crafting your personalized itinerary...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 