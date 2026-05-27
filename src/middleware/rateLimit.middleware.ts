import rateLimit from 'express-rate-limit'

// ── General API rate limit — 100 requests per 15 minutes ──────────
export const generalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              100,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    error:   'TOO_MANY_REQUESTS',
    message: 'Too many requests. Please try again in 15 minutes.',
  },
})

// ── Auth endpoints — 10 requests per 15 minutes ───────────────────
export const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    error:   'TOO_MANY_AUTH_ATTEMPTS',
    message: 'Too many attempts. Please try again in 15 minutes.',
  },
})

// ── OTP resend — 3 requests per hour ─────────────────────────────
export const otpResendLimiter = rateLimit({
  windowMs:         60 * 60 * 1000,
  max:              3,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    error:   'TOO_MANY_OTP_REQUESTS',
    message: 'Too many OTP requests. Please try again in 1 hour.',
  },
})

// ── Public inbox — 1 request per sender per 24 hours ─────────────
// Note: deep per-email enforcement is handled inside the controller
// This limiter adds a first layer of IP-based protection
export const inboxLimiter = rateLimit({
  windowMs:         24 * 60 * 60 * 1000,
  max:              5,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    error:   'TOO_MANY_MESSAGES',
    message: 'You have sent too many messages today. Please try again tomorrow.',
  },
})

// ── Upload — 20 uploads per hour ──────────────────────────────────
export const uploadLimiter = rateLimit({
  windowMs:         60 * 60 * 1000,
  max:              20,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    error:   'TOO_MANY_UPLOADS',
    message: 'Too many uploads. Please try again in 1 hour.',
  },
})