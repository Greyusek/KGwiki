import { z } from "zod";

const stringListField = z
  .array(z.string().trim().min(1).max(200))
  .max(50)
  .default([]);

export const activityInputSchema = z.object({
  title: z.string().trim().min(3).max(140),
  summary: z.string().trim().min(10).max(400),
  ageGroup: z.string().trim().min(2).max(60),
  durationMinutes: z.number().int().min(5).max(1440),
  goal: z.string().trim().min(10).max(500),
  objectives: stringListField,
  description: z.string().trim().min(20).max(5000),
  steps: stringListField,
  materialsNeeded: stringListField,
  category: z.string().trim().min(2).max(80),
  tags: stringListField,
  season: z.string().trim().max(60).optional().or(z.literal("")),
  holidayLinks: stringListField,
  locationType: z.string().trim().min(2).max(80),
  complexityLevel: z.string().trim().min(2).max(40),
  isPublic: z.boolean().default(false),
  sourceActivityId: z.string().cuid().optional().nullable()
});

export const activityUpdateSchema = activityInputSchema;

export type ActivityInput = z.infer<typeof activityInputSchema>;
export type ActivityUpdateInput = z.infer<typeof activityUpdateSchema>;
