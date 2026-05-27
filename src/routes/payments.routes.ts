import { Router } from 'express'
import {
  createCheckout,
  handleWebhook,
  getPaymentStatus,
} from '../controllers/payments.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { z } from 'zod'

const router = Router()

// ── Stripe webhook — raw body, no auth ────────────────────────────
router.post('/webhook', handleWebhook)

// ── Protected routes ──────────────────────────────────────────────
router.post(
  '/create-checkout',
  authenticate,
  validate(
    z.object({
      plan: z
        .enum(['pro_monthly', 'pro_yearly'])
    })
  ),
  createCheckout
)

router.get(
  '/status',
  authenticate,
  getPaymentStatus
)

export default router 