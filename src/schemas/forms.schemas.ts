import { z } from 'zod'

// ── Contact form ──────────────────────────────────────────────────
export const contactSchema = z.object({
  name:    z.string().min(1, 'Name is required').max(100).trim(),
  email:   z.string().email('Invalid email address').trim().toLowerCase(),
  type:    z.enum(['brand', 'creator', 'partner', 'other']).default('other'),
  subject: z.string().min(1, 'Subject is required').max(200).trim(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000).trim(),
})

// ── Waitlist / interest form ──────────────────────────────────────
export const waitlistSchema = z.object({
  name:     z.string().min(1, 'Name is required').max(100).trim(),
  email:    z.string().email('Invalid email address').trim().toLowerCase(),
  location: z.string().min(1, 'Location is required').max(100).trim(),
  role:     z.enum(['brand', 'creator', 'agency', 'other']).default('other'),
  industry: z.enum(['beauty', 'fashion', 'fitness', 'food', 'tech', 'travel', 'other']).default('other'),
})
