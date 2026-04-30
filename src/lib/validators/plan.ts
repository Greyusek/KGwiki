import { z } from "zod";

export const dayPlanItemSchema = z.object({
  activityId: z.string().min(1),
  orderIndex: z.number().int().min(0),
  notes: z.string().trim().max(500).optional().nullable(),
  plannedTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Planned time must use HH:MM format.").optional().nullable()
});

const createInlineDaySchema = z.object({
  items: z.array(dayPlanItemSchema).min(1)
});

const weekDaySchema = z.object({
  dayIndex: z.number().int().min(0),
  inlineTitle: z.string().trim().max(120).optional().nullable(),
  attachedDayPlanId: z.string().min(1).optional().nullable(),
  inlineDayPlan: createInlineDaySchema.optional().nullable()
}).refine((value) => Boolean(value.attachedDayPlanId) !== Boolean(value.inlineDayPlan), {
  message: "Each week day must either attach a day plan or define an inline day plan."
});

export const planSchema = z
  .object({
    type: z.enum(["day", "week"]),
    title: z.string().trim().min(2).max(120),
    visibility: z.enum(["private", "public", "shared"]).default("private"),
    sharedUserIds: z.array(z.string().min(1)).optional().default([]),
    workingDays: z.number().int().min(2).max(6).optional(),
    items: z.array(dayPlanItemSchema).optional(),
    weekDays: z.array(weekDaySchema).optional()
  })
  .refine((value) => (value.type === "day" ? (value.items?.length ?? 0) > 0 : true), {
    message: "Day plans require at least one activity.",
    path: ["items"]
  })
  .refine((value) => (value.type === "week" ? Boolean(value.workingDays) : true), {
    message: "Week plans require a working days count.",
    path: ["workingDays"]
  })
  .refine((value) => (value.type === "week" ? (value.weekDays?.length ?? 0) === value.workingDays : true), {
    message: "Week plans must provide day entries for each working day.",
    path: ["weekDays"]
  })
  .refine((value) => {
    if (value.type !== "week" || !value.weekDays) return true;
    const sorted = [...value.weekDays].sort((a, b) => a.dayIndex - b.dayIndex);
    return sorted.every((entry, index) => entry.dayIndex === index);
  }, {
    message: "Week day indexes must be sequential and start from day 0.",
    path: ["weekDays"]
  })
  .refine((value) => (value.visibility === "shared" ? (value.sharedUserIds?.length ?? 0) > 0 : true), {
    message: "Shared visibility requires at least one selected user.",
    path: ["sharedUserIds"]
  });

export type PlanInput = z.infer<typeof planSchema>;


export const saveInlineDayPlanSchema = z.object({
  title: z.string().trim().min(2).max(120),
  items: z.array(dayPlanItemSchema).min(1)
});
