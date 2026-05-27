import { Router } from 'express'
import {
  getRates,
  createRate,
  updateRate,
  deleteRate,
  reorderRates,
  getCases,
  createCase,
  updateCase,
  deleteCase,
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getLinks,
  updateLinks,
} from '../controllers/content.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validate }     from '../middleware/validate.middleware'
import {
  createRateSchema,
  updateRateSchema,
  reorderRatesSchema,
  createCaseStudySchema,
  updateCaseStudySchema,
  createTestimonialSchema,
  updateTestimonialSchema,
  updateLinksSchema,
} from '../schemas/content.schemas'

const router = Router()

// ── All content routes require authentication ─────────────────────
router.use(authenticate)

// ── Rates ─────────────────────────────────────────────────────────
router.get(
  '/rates',
  getRates
)

router.post(
  '/rates',
  validate(createRateSchema),
  createRate
)

router.put(
  '/rates/reorder',
  validate(reorderRatesSchema),
  reorderRates
)

router.put(
  '/rates/:id',
  validate(updateRateSchema),
  updateRate
)

router.delete(
  '/rates/:id',
  deleteRate
)

// ── Case Studies ──────────────────────────────────────────────────
router.get(
  '/cases',
  getCases
)

router.post(
  '/cases',
  validate(createCaseStudySchema),
  createCase
)

router.put(
  '/cases/:id',
  validate(updateCaseStudySchema),
  updateCase
)

router.delete(
  '/cases/:id',
  deleteCase
)

// ── Testimonials ──────────────────────────────────────────────────
router.get(
  '/testimonials',
  getTestimonials
)

router.post(
  '/testimonials',
  validate(createTestimonialSchema),
  createTestimonial
)

router.put(
  '/testimonials/:id',
  validate(updateTestimonialSchema),
  updateTestimonial
)

router.delete(
  '/testimonials/:id',
  deleteTestimonial
)

// ── Links ─────────────────────────────────────────────────────────
router.get(
  '/links',
  getLinks
)

router.put(
  '/links',
  validate(updateLinksSchema),
  updateLinks
)

export default router