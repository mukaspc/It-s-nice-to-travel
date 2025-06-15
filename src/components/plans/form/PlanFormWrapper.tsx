import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { Form } from "../../ui/form";
import { BasicInfoSection } from "./BasicInfoSection";
import { TravelPreferencesSection } from "./TravelPreferencesSection";
import { PlacesSection } from "./PlacesSection";
import { planFormSchema } from "./schema";
import type { PlanDTO } from "../../../types";
import { useToast } from "../../ui/use-toast";

interface PlanFormWrapperProps {
  initialData?: PlanDTO;
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export function PlanFormWrapper({ initialData, onSubmit }: PlanFormWrapperProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      start_date: initialData?.start_date || "",
      end_date: initialData?.end_date || "",
      people_count: initialData?.people_count || 1,
      note: initialData?.note || "",
      travel_preferences: initialData?.travel_preferences || "",
    },
  });

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const result = await onSubmit(data);

      if (result.success) {
        toast({
          title: "Success",
          description: initialData ? "Travel plan updated successfully" : "Travel plan created successfully",
        });
        navigate("/plans");
      } else {
        toast({
          title: "Error",
          description: result.error || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <BasicInfoSection form={form} />
        <TravelPreferencesSection form={form} />
        <PlacesSection form={form} />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate("/plans")} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : initialData ? (
              "Update Plan"
            ) : (
              "Create Plan"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
