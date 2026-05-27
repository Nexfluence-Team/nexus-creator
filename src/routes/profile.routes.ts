import { Router } from 'express'
import {
  getMe,
  updateHeader,
  updateDesign,
  getPublicProfile,
} from '../controllers/profile.controller'
import { authenticate }   from '../middleware/auth.middleware'
import { validate }       from '../middleware/validate.middleware'
import {
  updateHeaderSchema,
  updateDesignSchema,
} from '../schemas/profile.schemas'

const router = Router()

// ── Protected routes ──────────────────────────────────────────────
router.get(
  '/me',
  authenticate,
  getMe
)

router.put(
  '/header',
  authenticate,
  validate(updateHeaderSchema),
  updateHeader
)

router.put(
  '/design',
  authenticate,
  validate(updateDesignSchema),
  updateDesign
)

// ── Public routes ─────────────────────────────────────────────────
// Must be last so /me and /header do not get caught by /:slug
router.get(
  '/:slug',
  getPublicProfile
)

export default router