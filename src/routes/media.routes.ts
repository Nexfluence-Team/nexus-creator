import { Router } from 'express'
import {
  uploadFile,
  getVideos,
  createVideo,
  updateVideo,
  deleteVideo,
} from '../controllers/media.controller'
import { authenticate }     from '../middleware/auth.middleware'
import { validate }         from '../middleware/validate.middleware'
import { uploadLimiter }    from '../middleware/rateLimit.middleware'
import {
  uploadProfilePic,
  handleMulterError,
} from '../middleware/upload.middleware'
import {
  createVideoSchema,
  updateVideoSchema,
} from '../schemas/content.schemas'

const router = Router()

// ── All media routes require authentication ───────────────────────
router.use(authenticate)

// ── File upload ───────────────────────────────────────────────────
router.post(
  '/upload',
  uploadLimiter,
  uploadProfilePic,
  handleMulterError,
  uploadFile
)

// ── Videos ────────────────────────────────────────────────────────
router.get(
  '/videos',
  getVideos
)

router.post(
  '/videos',
  validate(createVideoSchema),
  createVideo
)

router.put(
  '/videos/:id',
  validate(updateVideoSchema),
  updateVideo
)

router.delete(
  '/videos/:id',
  deleteVideo
)

export default router