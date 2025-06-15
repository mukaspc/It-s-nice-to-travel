import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "./form";
import { Input } from "./input";
import { Textarea } from "./textarea";

interface FormFieldProps<T extends Record<string, unknown> = Record<string, unknown>> {
  form: UseFormReturn<T>;
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea";
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
}

export function FormFieldComponent<T extends Record<string, unknown> = Record<string, unknown>>({
  form,
  name,
  label,
  type = "text",
  placeholder,
  className,
  min,
  max,
}: FormFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {type === "textarea" ? (
              <Textarea placeholder={placeholder} {...field} value={field.value || ""} />
            ) : (
              <Input
                type={type}
                placeholder={placeholder}
                min={min}
                max={max}
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  if (type === "number") {
                    field.onChange(e.target.value ? parseInt(e.target.value, 10) : "");
                  } else {
                    field.onChange(e.target.value);
                  }
                }}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
