import { Router } from 'express'
import {
  getMyReferrals,
  redeemCoins,
} from '../controllers/referrals.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { z } from 'zod'

const router = Router()

// ── All referral routes require authentication ────────────────────
router.use(authenticate)

// ── Get referral stats and code ───────────────────────────────────
router.get('/me', getMyReferrals)

// ── Redeem coins for a reward ─────────────────────────────────────
router.post(
  '/redeem',
  validate(
    z.object({
      reward: z
        .string()
        .min(1, 'Reward is required.'),
    })
  ),
  redeemCoins
)

export default router