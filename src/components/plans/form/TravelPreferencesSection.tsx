import type { UseFormReturn } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { FormFieldComponent } from "../../ui/form-field";

interface TravelPreferencesSectionProps {
  form: UseFormReturn<any>;
}

export function TravelPreferencesSection({ form }: TravelPreferencesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Travel Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <FormFieldComponent
          form={form}
          name="travel_preferences"
          label="Travel Preferences"
          type="textarea"
          placeholder="Describe your travel preferences (e.g., preferred activities, accommodation type, etc.)"
          className="min-h-[100px]"
        />
      </CardContent>
    </Card>
  );
} 