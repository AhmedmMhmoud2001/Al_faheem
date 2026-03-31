import { z } from 'zod';

const emailField = z.preprocess(
  (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
  z.string().email(),
);

export const registerSchema = z.object({
  email: emailField,
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(10),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const verifyCodeSchema = z.object({
  email: emailField,
  code: z.string().min(4).max(8),
});

export const resetPasswordSchema = z.object({
  email: emailField,
  code: z.string().min(4).max(8),
  newPassword: z.string().min(8),
});
