import type { UseFormReturn } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { FormFieldComponent } from "../../ui/form-field";

interface BasicInfoSectionProps {
  form: UseFormReturn<any>;
}

export function BasicInfoSection({ form }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormFieldComponent
          form={form}
          name="name"
          label="Plan Name"
          placeholder="Enter plan name"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldComponent
            form={form}
            name="start_date"
            label="Start Date"
            type="date"
          />

          <FormFieldComponent
            form={form}
            name="end_date"
            label="End Date"
            type="date"
          />
        </div>

        <FormFieldComponent
          form={form}
          name="people_count"
          label="Number of People"
          type="number"
          min={1}
          max={99}
        />

        <FormFieldComponent
          form={form}
          name="note"
          label="Note"
          type="textarea"
          placeholder="Add a note about your travel plan"
        />
      </CardContent>
    </Card>
  );
} 