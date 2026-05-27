import { Router } from 'express'
import {
  getOverview,
  getViewsChart,
} from '../controllers/analytics.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

// ── All analytics routes require authentication ───────────────────
router.use(authenticate)

// ── Overview stats ────────────────────────────────────────────────
router.get(
  '/overview',
  getOverview
)

// ── Daily views chart ─────────────────────────────────────────────
// Query params: ?days=30
router.get(
  '/views',
  getViewsChart
)

export default router