import { useState } from "react";
import type { PlanDTO, CreatePlanCommandDTO } from "../../types";
import { PlanForm } from "./PlanForm";

interface PlanFormWrapperProps {
  initialData?: PlanDTO;
  mode: "create" | "edit";
}

export function PlanFormWrapper({ initialData, mode }: PlanFormWrapperProps) {
  const [error, setError] = useState<string>();

  const handleSubmit = async (data: CreatePlanCommandDTO) => {
    try {
      setError(undefined);
      const response = await fetch(`/api/plans${mode === "edit" && initialData ? `/${initialData.id}` : ""}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save plan");
      }

      await response.json();
      window.location.href = "/plans";
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      throw err; // Re-throw to let the form component handle the submission state
    }
  };

  const handleCancel = () => {
    window.location.href = "/plans";
  };

  return (
    <>
      {error && <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">{error}</div>}
      <PlanForm initialData={initialData} onSubmit={handleSubmit} onCancel={handleCancel} />
    </>
  );
} 