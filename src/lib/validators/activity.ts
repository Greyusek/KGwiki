import { z } from "zod";
import {
  AGE_GROUP_OPTIONS,
  CATEGORY_OPTIONS,
  COMPLEXITY_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  SEASON_OPTIONS
} from "@/lib/activity-options";

const stringListField = z
  .array(z.string().trim().min(1).max(200))
  .max(50)
  .default([]);
const tagsField = z.array(z.string().trim().min(1).max(200)).max(10, "Maximum 10 tags allowed.").default([]);

export const activityInputSchema = z.object({
  title: z.string().trim().min(3).max(140),
  summary: z.string().trim().min(10).max(400),
  ageGroup: z.enum(AGE_GROUP_OPTIONS),
  durationMinutes: z.number().int().min(5).max(1440),
  goal: z.string().trim().min(10).max(500),
  objectives: stringListField,
  description: z.string().trim().min(20).max(5000),
  steps: stringListField,
  materialsNeeded: stringListField,
  category: z.enum(CATEGORY_OPTIONS),
  tags: tagsField,
  season: z.enum(SEASON_OPTIONS).optional().or(z.literal("")),
  holidayLinks: stringListField,
  locationType: z.enum(LOCATION_TYPE_OPTIONS),
  complexityLevel: z.enum(COMPLEXITY_OPTIONS),
  isPublic: z.boolean().default(false),
  sourceActivityId: z.string().cuid().optional().nullable()
});

export const activityUpdateSchema = activityInputSchema;

export type ActivityInput = z.infer<typeof activityInputSchema>;
export type ActivityUpdateInput = z.infer<typeof activityUpdateSchema>;
