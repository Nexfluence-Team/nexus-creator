import { Request, Response } from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { AuthRequest } from '../types'
import User from '../models/User.model'
import OTPToken from '../models/OTPToken.model'
import ReferralEvent from '../models/ReferralEvent.model'
import {
  signAccessToken,
  signRefreshToken,
  signPendingToken,
  verifyPendingToken,
  verifyRefreshToken,
  extractBearerToken,
} from '../lib/jwt'
import {
  sendOTPEmail,
  sendWelcomeEmail,
} from '../lib/mailer'

// ── Helpers ───────────────────────────────────────────────────────
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

function generateReferralCode(name: string): string {
  const prefix = (name + 'XXX')
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, 'X')
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  return `${prefix}-${suffix}`
}

function issueTokens(user: {
  _id: { toString(): string }
  email: string
  plan: 'free' | 'pro'
  coins: number
}) {
  const accessToken = signAccessToken({
    sub:   user._id.toString(),
    email: user.email,
    plan:  user.plan,
    coins: user.coins,
  })
  const refreshToken = signRefreshToken({
    sub: user._id.toString(),
  })
  return { accessToken, refreshToken }
}

function setCookies(res: Response, refreshToken: string) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure:   true,
    sameSite: 'none',
    maxAge:   90 * 24 * 60 * 60 * 1000,
  })
}

// ── POST /auth/register ───────────────────────────────────────────
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, ref } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      res.status(409).json({
        success: false,
        error:   'EMAIL_EXISTS',
        message: 'An account with this email already exists.',
      })
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)

    let referralCode = generateReferralCode(email)
    let codeExists   = await User.findOne({ referralCode })
    while (codeExists) {
      referralCode = generateReferralCode(email)
      codeExists   = await User.findOne({ referralCode })
    }

    await User.create({
      email,
      passwordHash,
      referralCode,
      referredBy:    ref ?? null,
      emailVerified: false,
      plan:          'free',
      coins:         0,
    })

    const otp      = generateOTP()
    const codeHash = hashOTP(otp)
    await OTPToken.create({
      email,
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      used:      false,
    })

    await sendOTPEmail(email, otp, 'signup')

    const pendingToken = signPendingToken({ email })

    res.status(200).json({
      success: true,
      data: {
        pendingToken,
        expiresIn:   600,
        requiresOtp: true,
        message:     'OTP sent to your email.',
      },
    })
  } catch (error) {
    throw error
  }
}

// ── POST /auth/verify-otp ─────────────────────────────────────────
export async function verifyOTP(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { otp } = req.body

    const pendingToken = extractBearerToken(req.headers.authorization)
    if (!pendingToken) {
      res.status(401).json({
        success: false,
        error:   'NO_PENDING_TOKEN',
        message: 'Missing pending token.',
      })
      return
    }

    let email: string
    try {
      const payload = verifyPendingToken(pendingToken)
      email         = payload.email
    } catch {
      res.status(401).json({
        success: false,
        error:   'INVALID_PENDING_TOKEN',
        message: 'Session expired. Please start again.',
      })
      return
    }

    const otpRecord = await OTPToken.findOne({
      email,
      used:      false,
      expiresAt: { $gt: new Date() },
    })

    if (!otpRecord) {
      res.status(410).json({
        success: false,
        error:   'OTP_EXPIRED',
        message: 'Code has expired. Please request a new one.',
      })
      return
    }

    const inputHash = hashOTP(otp)
    if (inputHash !== otpRecord.codeHash) {
      res.status(400).json({
        success: false,
        error:   'INVALID_OTP',
        message: 'Incorrect code. Please try again.',
      })
      return
    }

    await OTPToken.findByIdAndUpdate(otpRecord._id, { used: true })

    const user = await User.findOneAndUpdate(
      { email },
      { emailVerified: true },
      { new: true }
    )

    if (!user) {
      res.status(404).json({
        success: false,
        error:   'USER_NOT_FOUND',
        message: 'Account not found.',
      })
      return
    }

    // Handle referral attribution
    if (user.referredBy) {
      const referrer = await User.findOne({ referralCode: user.referredBy })
      if (referrer) {
        await ReferralEvent.create({
          referralCode: user.referredBy,
          referrerId:   referrer._id,
          newUserId:    user._id,
          type:         'signup',
          coinsAwarded: 10,
        })
        await User.findByIdAndUpdate(referrer._id, { $inc: { coins: 10 } })
      }
    }

    const { accessToken, refreshToken } = issueTokens(user)
    setCookies(res, refreshToken)

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        requiresOtp: false,
        user: {
          _id:           user._id,
          email:         user.email,
          name:          user.name,
          slug:          user.slug,
          plan:          user.plan,
          coins:         user.coins,
          referralCode:  user.referralCode,
          emailVerified: user.emailVerified,
        },
      },
    })
  } catch (error) {
    throw error
  }
}

// ── POST /auth/login ──────────────────────────────────────────────
// No OTP for verified users — direct token issuance
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+passwordHash')

    if (!user) {
      res.status(404).json({
        success: false,
        error:   'USER_NOT_FOUND',
        message: 'No account found with this email.',
      })
      return
    }

    if (!user.passwordHash) {
      res.status(400).json({
        success: false,
        error:   'SOCIAL_ACCOUNT',
        message: 'This account uses social login. Please sign in with Instagram or TikTok.',
      })
      return
    }

    const match = await bcrypt.compare(password, user.passwordHash)
    if (!match) {
      res.status(401).json({
        success: false,
        error:   'INVALID_CREDENTIALS',
        message: 'Incorrect email or password.',
      })
      return
    }

    // Unverified account — send OTP to complete verification
    if (!user.emailVerified) {
      const otp      = generateOTP()
      const codeHash = hashOTP(otp)
      await OTPToken.updateMany({ email, used: false }, { used: true })
      await OTPToken.create({
        email,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        used:      false,
      })
      await sendOTPEmail(email, otp, 'signup')
      const pendingToken = signPendingToken({ email })
      res.status(200).json({
        success: true,
        data: {
          pendingToken,
          expiresIn:     600,
          emailVerified: false,
          requiresOtp:   true,
          message:       'Please verify your email first.',
        },
      })
      return
    }

    // Verified account — issue tokens directly, no OTP
    const { accessToken, refreshToken } = issueTokens(user)
    setCookies(res, refreshToken)

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        requiresOtp: false,
        user: {
          _id:           user._id,
          email:         user.email,
          name:          user.name,
          slug:          user.slug,
          plan:          user.plan,
          coins:         user.coins,
          referralCode:  user.referralCode,
          emailVerified: user.emailVerified,
        },
      },
    })
  } catch (error) {
    throw error
  }
}

// ── POST /auth/resend-otp ─────────────────────────────────────────
export async function resendOTP(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      res.status(404).json({
        success: false,
        error:   'USER_NOT_FOUND',
        message: 'No account found with this email.',
      })
      return
    }

    await OTPToken.updateMany({ email, used: false }, { used: true })

    const otp      = generateOTP()
    const codeHash = hashOTP(otp)
    await OTPToken.create({
      email,
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      used:      false,
    })

    await sendOTPEmail(email, otp, 'signup')

    const pendingToken = signPendingToken({ email })

    res.status(200).json({
      success: true,
      data: {
        pendingToken,
        expiresIn: 600,
        message:   'New code sent.',
      },
    })
  } catch (error) {
    throw error
  }
}

// ── POST /auth/refresh ────────────────────────────────────────────
export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies?.refreshToken

    if (!token) {
      res.status(401).json({
        success: false,
        error:   'NO_REFRESH_TOKEN',
        message: 'No refresh token found.',
      })
      return
    }

    let payload
    try {
      payload = verifyRefreshToken(token)
    } catch {
      res.status(401).json({
        success: false,
        error:   'REFRESH_EXPIRED',
        message: 'Session expired. Please sign in again.',
      })
      return
    }

    const user = await User.findById(payload.sub)
    if (!user) {
      res.status(401).json({
        success: false,
        error:   'USER_NOT_FOUND',
        message: 'Account not found.',
      })
      return
    }

    const { accessToken, refreshToken: newRefreshToken } = issueTokens(user)
    setCookies(res, newRefreshToken)

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: {
          _id:   user._id,
          email: user.email,
          plan:  user.plan,
          coins: user.coins,
          name:  user.name,
          slug:  user.slug,
        },
      },
    })
  } catch (error) {
    throw error
  }
}

// ── POST /auth/logout ─────────────────────────────────────────────
export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  })

  res.status(200).json({
    success: true,
    data: {
      message: 'Logged out successfully.',
    },
  })
}

// ── POST /auth/complete-profile ───────────────────────────────────
export async function completeProfile(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const user = await User.findById(req.user?._id)
    if (!user) {
      res.status(404).json({
        success: false,
        error:   'USER_NOT_FOUND',
        message: 'Account not found.',
      })
      return
    }

    if (user.name) {
      await sendWelcomeEmail(user.email, user.name, user.referralCode)
    }

    res.status(200).json({
      success: true,
      data: { message: 'Welcome email sent.' },
    })
  } catch (error) {
    throw error
  }
}