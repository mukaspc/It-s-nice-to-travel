import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { ArrowLeft, Timer, Loader2 } from 'lucide-react';
import type { GeneratePlanResponseDTO } from '../../types';

interface GenerationProgressProps {
  planId: string;
}

export function GenerationProgress({ planId }: GenerationProgressProps) {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const startGeneration = async () => {
      try {
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

    startGeneration();
  }, [planId]);

  useEffect(() => {
    if (!isGenerating) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/plans/${planId}/generated`);
        
        if (response.status === 404) {
          // Plan is still generating
          setProgress((prev) => Math.min(prev + 10, 90)); // Increment progress but cap at 90%
          return false;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to check generation status');
        }

        // Plan is ready
        setProgress(100);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        return false;
      }
    };

    const interval = setInterval(async () => {
      const isComplete = await checkStatus();
      if (isComplete) {
        clearInterval(interval);
        // Redirect to the view page after a short delay
        setTimeout(() => {
          window.location.href = `/plans/${planId}/view`;
        }, 1000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [planId, isGenerating]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => window.location.href = '/plans'}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => window.location.href = '/plans'}>
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
              {progress < 100 ? 'Generating your perfect travel plan...' : 'Generation complete!'}
            </p>
          </div>

          {estimatedTime && progress < 100 && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>Estimated time remaining: {Math.ceil((estimatedTime * (100 - progress)) / 100)} seconds</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 