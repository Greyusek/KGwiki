import { z } from "zod";

export const dayPlanItemSchema = z.object({
  activityId: z.string().min(1),
  orderIndex: z.number().int().min(0),
  notes: z.string().trim().max(500).optional().nullable(),
  plannedTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Planned time must use HH:MM format.").optional().nullable()
});

const createInlineDaySchema = z.object({
  title: z.string().trim().min(2).max(120),
  date: z.string().date(),
  items: z.array(dayPlanItemSchema).min(1)
});

const weekDaySchema = z.object({
  dayIndex: z.number().int().min(0),
  attachedDayPlanId: z.string().min(1).optional().nullable(),
  inlineDayPlan: createInlineDaySchema.optional().nullable()
}).refine((value) => Boolean(value.attachedDayPlanId) || Boolean(value.inlineDayPlan), {
  message: "Each week day must reference an existing day plan or define an inline day plan."
});

export const planSchema = z
  .object({
    type: z.enum(["day", "week"]),
    title: z.string().trim().min(2).max(120),
    date: z.string().date().optional().nullable(),
    weekStartDate: z.string().date().optional().nullable(),
    items: z.array(dayPlanItemSchema).optional(),
    weekDays: z.array(weekDaySchema).optional()
  })
  .refine((value) => (value.type === "day" ? Boolean(value.date) : true), {
    message: "Day plans require a date.",
    path: ["date"]
  })
  .refine((value) => (value.type === "day" ? (value.items?.length ?? 0) > 0 : true), {
    message: "Day plans require at least one activity.",
    path: ["items"]
  })
  .refine((value) => (value.type === "week" ? Boolean(value.weekStartDate) : true), {
    message: "Week plans require a week start date.",
    path: ["weekStartDate"]
  })
  .refine((value) => (value.type === "week" ? (value.weekDays?.length ?? 0) >= 2 : true), {
    message: "Week plans require at least 2 working days.",
    path: ["weekDays"]
  });

export type PlanInput = z.infer<typeof planSchema>;
