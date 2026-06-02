import 'dotenv/config'
import express        from 'express'
import cors           from 'cors'
import cookieParser   from 'cookie-parser'
import { connectDB }  from './lib/db'
import { verifyMailer } from './lib/mailer'

import authRoutes      from './routes/auth.routes'
import profileRoutes   from './routes/profile.routes'
import mediaRoutes     from './routes/media.routes'
import contentRoutes   from './routes/content.routes'
import inboxRoutes     from './routes/inbox.routes'
import analyticsRoutes from './routes/analytics.routes'
import referralsRoutes from './routes/referrals.routes'
import paymentsRoutes  from './routes/payments.routes'
// ── NEW ───────────────────────────────────────────────────────────
import contactRoutes   from './routes/contact.routes'
import waitlistRoutes  from './routes/waitlist.routes'
// ─────────────────────────────────────────────────────────────────

import { generalLimiter }             from './middleware/rateLimit.middleware'
import { errorHandler, notFound }     from './middleware/error.middleware'

const app  = express()
const PORT = parseInt(process.env.PORT || '5000', 10)

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://nexus.nexfluence.eu',
  'https://nex-creator-profile.vercel.app',
  // ── NEW: add your second Vercel frontend URL below ────────────
  'https://YOUR-NEW-FRONTEND.vercel.app',   // <-- replace this
  // ─────────────────────────────────────────────────────────────
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true)
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
      callback(new Error(`CORS blocked: ${origin}`))
    },
    credentials:    true,
    methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Stripe webhook — must come BEFORE express.json()
app.use(
  '/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentsRoutes
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(generalLimiter)

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

app.use('/auth',       authRoutes)
app.use('/profile',    profileRoutes)
app.use('/media',      mediaRoutes)
app.use('/inbox',      inboxRoutes)
app.use('/analytics',  analyticsRoutes)
app.use('/referrals',  referralsRoutes)
app.use('/payments',   paymentsRoutes)
// ── NEW ───────────────────────────────────────────────────────────
app.use('/contact',    contactRoutes)
app.use('/waitlist',   waitlistRoutes)
// ─────────────────────────────────────────────────────────────────
app.use('/',           contentRoutes)

app.use(notFound)
app.use(errorHandler)

async function start(): Promise<void> {
  await connectDB()
  // await verifyMailer()
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Creator Nexus API
  Running on http://0.0.0.0:${PORT}
  Environment: ${process.env.NODE_ENV}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `)
  })
}

start()