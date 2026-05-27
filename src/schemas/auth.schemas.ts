import { z } from 'zod'

// ── Register ──────────────────────────────────────────────────────
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Invalid email address.')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(6, 'Password must be at least 6 characters.'),

  ref: z
    .string()
    .trim()
    .optional(),
})

// ── Login ─────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Invalid email address.')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(1, 'Password is required.'),
})

// ── Verify OTP ────────────────────────────────────────────────────
export const verifyOTPSchema = z.object({
  otp: z
    .string()
    .min(1, 'OTP is required.')
    .length(6, 'OTP must be exactly 6 digits.')
    .regex(/^\d{6}$/, 'OTP must contain only numbers.'),
})

// ── Resend OTP ────────────────────────────────────────────────────
export const resendOTPSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Invalid email address.')
    .toLowerCase()
    .trim(),
})

// ── Types inferred from schemas ───────────────────────────────────
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>
export type ResendOTPInput = z.infer<typeof resendOTPSchema>