import { useState } from "react";
import type { PlanDTO, CreatePlanCommandDTO } from "../../types";
import { BasicInfoSection } from "./form/BasicInfoSection";
import { TravelPreferencesSection } from "./form/TravelPreferencesSection";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const planFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  people_count: z.number().min(1, "At least 1 person is required").max(99, "Maximum 99 people allowed"),
  note: z.string().max(2500, "Note must be at most 2500 characters").nullable(),
  travel_preferences: z.string().max(2500, "Travel preferences must be at most 2500 characters").nullable(),
});

type PlanFormData = z.infer<typeof planFormSchema>;

interface PlanFormProps {
  initialData?: PlanDTO;
  onSubmit: (data: CreatePlanCommandDTO) => Promise<void>;
  onCancel: () => void;
}

export function PlanForm({ initialData, onSubmit, onCancel }: PlanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      start_date: initialData?.start_date ?? "",
      end_date: initialData?.end_date ?? "",
      people_count: initialData?.people_count ?? 1,
      note: initialData?.note ?? null,
      travel_preferences: initialData?.travel_preferences ?? null,
    },
  });

  const handleSubmit = async (data: PlanFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      // Error will be handled by the parent component
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
      <BasicInfoSection form={form} />
      <TravelPreferencesSection form={form} />

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Plan"}
        </Button>
      </div>
    </form>
  );
} 