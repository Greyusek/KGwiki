import { z } from "zod";

export const planItemSchema = z.object({
  activityId: z.string().min(1),
  orderIndex: z.number().int().min(0),
  notes: z.string().trim().max(500).optional().nullable(),
  plannedTime: z.string().datetime().optional().nullable()
});

export const planSchema = z
  .object({
    type: z.enum(["day", "week"]),
    title: z.string().trim().min(2).max(120),
    date: z.string().date().optional().nullable(),
    weekStartDate: z.string().date().optional().nullable(),
    items: z.array(planItemSchema).min(1)
  })
  .refine((value) => (value.type === "day" ? Boolean(value.date) : true), {
    message: "Day plans require a date.",
    path: ["date"]
  })
  .refine((value) => (value.type === "week" ? Boolean(value.weekStartDate) : true), {
    message: "Week plans require a week start date.",
    path: ["weekStartDate"]
  });

export type PlanInput = z.infer<typeof planSchema>;
