import { Router } from 'express'
import {
  sendMessage,
  getInbox,
  markAsRead,
  deleteMessage,
  getUnreadCount,
} from '../controllers/inbox.controller'
import { authenticate }  from '../middleware/auth.middleware'
import { validate }      from '../middleware/validate.middleware'
import { inboxLimiter }  from '../middleware/rateLimit.middleware'
import { createInboxMessageSchema } from '../schemas/content.schemas'

const router = Router()

// ── Public routes ─────────────────────────────────────────────────
router.post(
  '/:slug',
  inboxLimiter,
  validate(createInboxMessageSchema),
  sendMessage
)

// ── Protected routes ──────────────────────────────────────────────
router.get(
  '/',
  authenticate,
  getInbox
)

router.get(
  '/unread-count',
  authenticate,
  getUnreadCount
)

router.put(
  '/:id/read',
  authenticate,
  markAsRead
)

router.delete(
  '/:id',
  authenticate,
  deleteMessage
)

export default router