import { z } from "zod";

export const planFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  
  start_date: z.string()
    .min(1, "Start date is required"),
  
  end_date: z.string()
    .min(1, "End date is required"),
  
  people_count: z.number()
    .min(1, "At least 1 person is required")
    .max(99, "Maximum 99 people allowed"),
  
  note: z.string()
    .max(2500, "Note must be at most 2500 characters")
    .nullable(),
  
  travel_preferences: z.string()
    .max(2500, "Travel preferences must be at most 2500 characters")
    .nullable(),
})
.refine(
  (data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end >= start;
  },
  {
    message: "End date must be after start date",
    path: ["end_date"],
  }
); 