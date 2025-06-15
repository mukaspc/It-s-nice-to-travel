import type { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "./form";
import { Input } from "./input";
import { Textarea } from "./textarea";

interface FormFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea";
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
}

export function FormFieldComponent({
  form,
  name,
  label,
  type = "text",
  placeholder,
  className,
  min,
  max,
}: FormFieldProps) {
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
