import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { PlaceDTO, CreatePlaceCommandDTO, UpdatePlaceCommandDTO } from "../../../types";
import { Button } from "../../ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { useState, useEffect } from "react";

const placeFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  note: z.string().max(2500, "Note must be at most 2500 characters").nullable(),
});

type PlaceFormData = z.infer<typeof placeFormSchema>;

interface PlaceFormDialogProps {
  isOpen: boolean;
  initialData?: PlaceDTO;
  planStartDate: string;
  planEndDate: string;
  onSubmit: (data: CreatePlaceCommandDTO | UpdatePlaceCommandDTO) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export function PlaceFormDialog({
  isOpen,
  initialData,
  planStartDate,
  planEndDate,
  onSubmit,
  onClose,
}: PlaceFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PlaceFormData>({
    resolver: zodResolver(placeFormSchema),
    defaultValues: {
      name: "",
      start_date: "",
      end_date: "",
      note: "",
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        start_date: initialData.start_date,
        end_date: initialData.end_date,
        note: initialData.note ?? "",
      });
    } else {
      form.reset({
        name: "",
        start_date: "",
        end_date: "",
        note: "",
      });
    }
  }, [form, initialData]);

  // Reset form when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [form, isOpen]);

  const handleSubmit = async (data: PlaceFormData) => {
    try {
      setIsSubmitting(true);
      const result = await onSubmit(data);
      if (!result.success && result.error) {
        form.setError("root", { message: result.error });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit(handleSubmit)(e);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Place" : "Add Place"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter place name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      min={planStartDate}
                      max={form.watch("end_date") || planEndDate}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      min={form.watch("start_date") || planStartDate}
                      max={planEndDate}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Textarea {...field} value={field.value || ""} placeholder="Enter optional notes about this place" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <div className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }} 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              onClick={(e) => {
                e.stopPropagation();
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Add Place"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 