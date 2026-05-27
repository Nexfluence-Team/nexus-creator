import 'dotenv/config'
import express        from 'express'
import cors           from 'cors'
import cookieParser   from 'cookie-parser'
import { connectDB }  from './lib/db'
import { verifyMailer } from './lib/mailer'

// ── Routes ────────────────────────────────────────────────────────
import authRoutes      from './routes/auth.routes'
import profileRoutes   from './routes/profile.routes'
import mediaRoutes     from './routes/media.routes'
import contentRoutes   from './routes/content.routes'
import inboxRoutes     from './routes/inbox.routes'
import analyticsRoutes from './routes/analytics.routes'
import referralsRoutes from './routes/referrals.routes'
import paymentsRoutes  from './routes/payments.routes'

// ── Middleware ────────────────────────────────────────────────────
import { generalLimiter }       from './middleware/rateLimit.middleware'
import { errorHandler, notFound } from './middleware/error.middleware'

const app  = express()
const PORT = process.env.PORT || 5000

// ── CORS ──────────────────────────────────────────────────────────
app.use(
  cors({
    origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ── Stripe webhook — must come BEFORE express.json() ─────────────
// Stripe requires the raw request body to verify the signature
app.use(
  '/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentsRoutes
)

// ── Body parsers ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── Global rate limiter ───────────────────────────────────────────
app.use(generalLimiter)

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status:      'ok',
      environment: process.env.NODE_ENV,
      timestamp:   new Date().toISOString(),
    },
  })
})

// ── API routes ────────────────────────────────────────────────────
app.use('/auth',       authRoutes)
app.use('/profile',    profileRoutes)
app.use('/media',      mediaRoutes)
// app.use('/rates',      contentRoutes)
// app.use('/cases',      contentRoutes)
// app.use('/testimonials', contentRoutes)
// app.use('/links',      contentRoutes)
app.use('/inbox',      inboxRoutes)
app.use('/analytics',  analyticsRoutes)
app.use('/referrals',  referralsRoutes)
app.use('/payments',   paymentsRoutes)
app.use('/', contentRoutes)

// ── 404 handler ───────────────────────────────────────────────────
app.use(notFound)

// ── Global error handler ──────────────────────────────────────────
app.use(errorHandler)

// ── Start server ──────────────────────────────────────────────────
async function start(): Promise<void> {
  await connectDB()
  await verifyMailer()

  app.listen(PORT, () => {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Creator Nexus API
  Running on http://localhost:${PORT}
  Environment: ${process.env.NODE_ENV}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `)
  })
}

start()