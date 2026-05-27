import { Router } from 'express'
import {
  register,
  verifyOTP,
  login,
  resendOTP,
  refresh,
  logout,
  completeProfile,
} from '../controllers/auth.controller'
import { validate }         from '../middleware/validate.middleware'
import { authenticate }     from '../middleware/auth.middleware'
import { authLimiter, otpResendLimiter } from '../middleware/rateLimit.middleware'
import {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
} from '../schemas/auth.schemas'

const router = Router()

// ── Public routes ─────────────────────────────────────────────────
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  register
)

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  login
)

router.post(
  '/verify-otp',
  authLimiter,
  validate(verifyOTPSchema),
  verifyOTP
)

router.post(
  '/resend-otp',
  otpResendLimiter,
  validate(resendOTPSchema),
  resendOTP
)

router.post(
  '/refresh',
  refresh
)

router.post(
  '/logout',
  logout
)

// ── Protected routes ──────────────────────────────────────────────
router.post(
  '/complete-profile',
  authenticate,
  completeProfile
)

export default router