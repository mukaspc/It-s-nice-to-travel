import type { PlanListItemDTO } from "../../types";
import { PlanCard } from "./PlanCard";
import { PlanCardSkeleton } from "./PlanCardSkeleton";

interface PlanGridProps {
  plans: PlanListItemDTO[];
  isLoading: boolean;
  error?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onGenerate: (id: string) => void;
  onExplore: (id: string) => void;
  onRetry?: () => void;
  onEditWithConfirm?: (id: string) => void;
}

export function PlanGrid({ plans, isLoading, error, onEdit, onDelete, onGenerate, onExplore, onRetry, onEditWithConfirm }: PlanGridProps) {
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="text-sm text-muted-foreground hover:text-foreground underline">
            Try again
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <PlanCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No plans found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onEdit={() => onEdit(plan.id)}
          onDelete={() => onDelete(plan.id)}
          onGenerate={() => onGenerate(plan.id)}
          onExplore={() => onExplore(plan.id)}
          onEditWithConfirm={onEditWithConfirm ? () => onEditWithConfirm(plan.id) : undefined}
        />
      ))}
    </div>
  );
}
