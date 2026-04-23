import { z } from "zod";

export const commentInputSchema = z.object({
  content: z.string().trim().min(1).max(1000)
});

export const ratingInputSchema = z.object({
  value: z.number().int().min(1).max(5)
});

export const feedbackInputSchema = z.object({
  summary: z.string().trim().min(3).max(400),
  whatWorked: z.string().trim().min(3).max(3000),
  whatToImprove: z.string().trim().min(3).max(3000)
});

export type CommentInput = z.infer<typeof commentInputSchema>;
export type RatingInput = z.infer<typeof ratingInputSchema>;
export type FeedbackInput = z.infer<typeof feedbackInputSchema>;
