import { useEffect, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { MultiSelect, type Option } from "../../ui/multi-select";
import { useTravelPreferences } from "../../../hooks/useTravelPreferences";
import { planFormSchema } from "./schema";

interface TravelPreferencesSectionProps {
  form: UseFormReturn<z.infer<typeof planFormSchema>>;
}

export function TravelPreferencesSection({ form }: TravelPreferencesSectionProps) {
  const { preferences, isLoading, error, fetchPreferences } = useTravelPreferences();

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const options: Option[] = useMemo(
    () =>
      preferences.map((pref) => ({
        value: pref.description,
        label: pref.description,
      })),
    [preferences]
  );

  const selectedPreferences = form.watch("travel_preferences") || "";
  const selectedValues = selectedPreferences
    ? selectedPreferences
        .split(",")
        .map((p: string) => p.trim())
        .filter(Boolean)
    : [];

  const handleChange = (values: string[]) => {
    form.setValue("travel_preferences", values.join(", "), { shouldValidate: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Travel Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="travel_preferences"
          render={() => (
            <FormItem className="w-full">
              <FormLabel>Select your travel preferences</FormLabel>
              <MultiSelect
                value={selectedValues}
                onChange={handleChange}
                options={options}
                placeholder="Select preferences..."
                emptyMessage={error || "No preferences available"}
                disabled={isLoading}
                className="w-full"
              />
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
