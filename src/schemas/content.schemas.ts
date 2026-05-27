import { z } from 'zod'

// ── Video ─────────────────────────────────────────────────────────
export const createVideoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(100, 'Title must be under 100 characters.'),

  url: z
    .string()
    .trim()
    .min(1, 'URL is required.')
    .url('Invalid video URL.'),

  platform: z
    .enum(['instagram', 'tiktok', 'youtube', 'other'])
    .default('instagram'),

  category: z
    .string()
    .trim()
    .max(50, 'Category must be under 50 characters.')
    .optional()
    .default(''),

  views: z
    .string()
    .trim()
    .max(20, 'Views must be under 20 characters.')
    .optional()
    .default(''),

  thumbnailUrl: z
    .string()
    .trim()
    .optional()
    .default(''),
})

export const updateVideoSchema =
  createVideoSchema.partial()

// ── Rate / Service Package ────────────────────────────────────────
export const createRateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(100, 'Title must be under 100 characters.'),

  price: z
    .string()
    .trim()
    .min(1, 'Price is required.')
    .max(50, 'Price must be under 50 characters.'),

  turnaround: z
    .string()
    .trim()
    .max(
      100,
      'Turnaround must be under 100 characters.'
    )
    .optional()
    .default(''),

  description: z
    .string()
    .trim()
    .max(
      500,
      'Description must be under 500 characters.'
    )
    .optional()
    .default(''),

  includes: z
    .array(z.string().trim().max(100))
    .max(20, 'You can add up to 20 items.')
    .optional()
    .default([]),

  order: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0),
})

export const updateRateSchema =
  createRateSchema.partial()

export const reorderRatesSchema = z.object({
  ids: z
    .array(z.string())
    .min(1, 'At least one ID is required.'),
})

// ── Case Study ────────────────────────────────────────────────────
export const createCaseStudySchema =
  z.object({
    brand: z
      .string()
      .trim()
      .min(1, 'Brand name is required.')
      .max(
        100,
        'Brand name must be under 100 characters.'
      ),

    description: z
      .string()
      .trim()
      .max(
        1000,
        'Description must be under 1000 characters.'
      )
      .optional()
      .default(''),

    period: z
      .string()
      .trim()
      .max(
        100,
        'Period must be under 100 characters.'
      )
      .optional()
      .default(''),

    metrics: z
      .array(
        z.object({
          label: z.string().trim().max(50),
          value: z.string().trim().max(50),
        })
      )
      .max(6, 'You can add up to 6 metrics.')
      .optional()
      .default([]),
  })

export const updateCaseStudySchema =
  createCaseStudySchema.partial()

// ── Testimonial ───────────────────────────────────────────────────
export const createTestimonialSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Name is required.')
      .max(
        100,
        'Name must be under 100 characters.'
      ),

    role: z
      .string()
      .trim()
      .max(
        100,
        'Role must be under 100 characters.'
      )
      .optional()
      .default(''),

    company: z
      .string()
      .trim()
      .max(
        100,
        'Company must be under 100 characters.'
      )
      .optional()
      .default(''),

    quote: z
      .string()
      .trim()
      .min(1, 'Quote is required.')
      .max(
        1000,
        'Quote must be under 1000 characters.'
      ),

    rating: z
      .number()
      .int()
      .min(1)
      .max(5)
      .optional()
      .default(5),
  })

export const updateTestimonialSchema =
  createTestimonialSchema.partial()

// ── Links ─────────────────────────────────────────────────────────
export const updateLinksSchema = z.object({
  links: z.record(
    z.string(),
    z.string()
      .trim()
      .max(
        200,
        'URL must be under 200 characters.'
      )
  ),
})

// ── Inbox message ─────────────────────────────────────────────────
export const createInboxMessageSchema =
  z.object({
    type: z.enum(['message', 'inquiry']),

    senderName: z
      .string()
      .trim()
      .min(1, 'Name is required.')
      .max(
        100,
        'Name must be under 100 characters.'
      ),

    senderCompany: z
      .string()
      .trim()
      .max(
        100,
        'Company must be under 100 characters.'
      )
      .optional()
      .default(''),

    senderEmail: z
      .string()
      .min(1, 'Email is required.')
      .email('Invalid email address.')
      .toLowerCase()
      .trim(),

    message: z
      .string()
      .trim()
      .min(1, 'Message is required.')
      .max(
        2000,
        'Message must be under 2000 characters.'
      ),

    budget: z
      .string()
      .trim()
      .max(
        50,
        'Budget must be under 50 characters.'
      )
      .optional()
      .default(''),
  })

// ── Types ─────────────────────────────────────────────────────────
export type CreateVideoInput =
  z.infer<typeof createVideoSchema>

export type UpdateVideoInput =
  z.infer<typeof updateVideoSchema>

export type CreateRateInput =
  z.infer<typeof createRateSchema>

export type UpdateRateInput =
  z.infer<typeof updateRateSchema>

export type ReorderRatesInput =
  z.infer<typeof reorderRatesSchema>

export type CreateCaseStudyInput =
  z.infer<typeof createCaseStudySchema>

export type UpdateCaseStudyInput =
  z.infer<typeof updateCaseStudySchema>

export type CreateTestimonialInput =
  z.infer<typeof createTestimonialSchema>

export type UpdateTestimonialInput =
  z.infer<typeof updateTestimonialSchema>

export type UpdateLinksInput =
  z.infer<typeof updateLinksSchema>

export type CreateInboxMessageInput =
  z.infer<typeof createInboxMessageSchema> 