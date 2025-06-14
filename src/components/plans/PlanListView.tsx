import { useState } from "react";
import { PlanFilterBar } from "./PlanFilterBar";
import { PlanGrid } from "./PlanGrid";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { EditConfirmDialog } from "../ui/edit-confirm-dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { usePlanList } from "../../hooks/usePlanList";
import { ErrorBoundary } from "../ErrorBoundary";

export function PlanListView() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { plans, isLoading, error, sort, filters, handleSortChange, handleFilterChange, handleRetry, handleDelete } =
    usePlanList();

  const handleDeleteClick = (id: string) => {
    setSelectedPlanId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPlanId) {
      try {
        setIsDeleting(true);
        await handleDelete(selectedPlanId);
        setDeleteDialogOpen(false);
        setSelectedPlanId(undefined);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedPlanId(undefined);
  };

  const handleEditWithConfirmClick = (id: string) => {
    setSelectedPlanId(id);
    setEditDialogOpen(true);
  };

  const handleEditConfirm = () => {
    if (selectedPlanId) {
      window.location.href = `/plans/${selectedPlanId}/edit`;
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setSelectedPlanId(undefined);
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Travel Plans</h1>
          <Button asChild>
            <a href="/plans/new" className="gap-2">
              <Plus className="h-4 w-4" />
              New Plan
            </a>
          </Button>
        </div>

        <PlanFilterBar
          filters={filters}
          sort={sort}
          onFiltersChange={handleFilterChange}
          onSortChange={handleSortChange}
        />

        <PlanGrid
          plans={plans}
          isLoading={isLoading}
          error={error}
          onRetry={handleRetry}
          onEdit={(id) => (window.location.href = `/plans/${id}/edit`)}
          onDelete={handleDeleteClick}
          onGenerate={(id) => (window.location.href = `/plans/${id}/generate`)}
          onExplore={(id) => (window.location.href = `/plans/${id}/view`)}
          onEditWithConfirm={handleEditWithConfirmClick}
        />

        <DeleteConfirmDialog
          isOpen={isDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          planName={selectedPlan?.name || ""}
          isDeleting={isDeleting}
        />

        <EditConfirmDialog
          isOpen={isEditDialogOpen}
          onConfirm={handleEditConfirm}
          onCancel={handleEditCancel}
          planName={selectedPlan?.name || ""}
        />
      </div>
    </ErrorBoundary>
  );
}
