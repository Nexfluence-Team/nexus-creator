import { z } from 'zod'

// ── Update header ─────────────────────────────────────────────────
export const updateHeaderSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, 'Name must be under 100 characters.')
    .optional(),
  bio: z
    .string()
    .trim()
    .max(500, 'Bio must be under 500 characters.')
    .optional(),
  location: z
    .string()
    .trim()
    .max(100, 'Location must be under 100 characters.')
    .optional(),
  ctaText: z
    .string()
    .trim()
    .max(50, 'CTA text must be under 50 characters.')
    .optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Slug must be at least 3 characters.')
    .max(50, 'Slug must be under 50 characters.')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers and hyphens.'
    )
    .optional(),
  niches: z
    .array(z.string().trim())
    .max(10, 'You can select up to 10 niches.')
    .optional(),
  platforms: z
    .array(z.string().trim())
    .max(10, 'You can select up to 10 platforms.')
    .optional(),
  followerRange: z
    .string()
    .trim()
    .optional(),
  profilePicUrl: z
    .string()
    .trim()
    .url('Invalid profile picture URL.')
    .optional()
    .or(z.literal('')),
})

// ── Update design ─────────────────────────────────────────────────
export const updateDesignSchema = z.object({
  theme: z
    .enum(['minimal', 'dark', 'violet', 'warm', 'classic', 'bloom'])
    .optional(),
  primaryColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color.')
    .optional(),
  accentColor: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color.')
    .optional(),
  font: z
    .enum(['Rubik', 'Inter', 'Playfair Display', 'Montserrat'])
    .optional(),
})

// ── Types ─────────────────────────────────────────────────────────
export type UpdateHeaderInput = z.infer<typeof updateHeaderSchema>
export type UpdateDesignInput = z.infer<typeof updateDesignSchema>