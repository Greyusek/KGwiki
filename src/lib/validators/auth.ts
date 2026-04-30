import { z } from "zod";

const passwordSchema = z.string().min(8).max(72);

export const loginSchema = z.object({
  email: z.string().email(),
  password: passwordSchema
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: passwordSchema
});

export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmNewPassword: passwordSchema
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New password confirmation does not match.",
  path: ["confirmNewPassword"]
});

export const adminResetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: passwordSchema
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Password confirmation does not match.",
  path: ["confirmPassword"]
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  newPassword: passwordSchema
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
