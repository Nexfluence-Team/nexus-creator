import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types'
import { extractBearerToken, verifyAccessToken } from '../lib/jwt'
import User from '../models/User.model'

// ── Protect routes — requires a valid access token ────────────────
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractBearerToken(req.headers.authorization)

    if (!token) {
      res.status(401).json({
        success: false,
        error:   'NO_TOKEN',
        message: 'No token provided. Please sign in.',
      })
      return
    }

    let payload
    try {
      payload = verifyAccessToken(token)
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          error:   'TOKEN_EXPIRED',
          message: 'Your session has expired. Please refresh your token.',
        })
        return
      }
      res.status(401).json({
        success: false,
        error:   'INVALID_TOKEN',
        message: 'Invalid token. Please sign in again.',
      })
      return
    }

    // Confirm user still exists in DB
    const user = await User.findById(payload.sub).select(
      '_id email plan coins'
    )

    if (!user) {
      res.status(401).json({
        success: false,
        error:   'USER_NOT_FOUND',
        message: 'Account not found. Please sign in again.',
      })
      return
    }

    // Attach to request
    req.user = {
      _id:   user._id.toString(),
      email: user.email,
      plan:  user.plan,
      coins: user.coins,
    }

    // Update lastActiveAt without awaiting — fire and forget
    User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() }).exec()

    next()
  } catch (error) {
    next(error)
  }
}

// ── Require Pro plan ──────────────────────────────────────────────
export async function requirePro(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error:   'NOT_AUTHENTICATED',
      message: 'Please sign in.',
    })
    return
  }

  if (req.user.plan !== 'pro') {
    res.status(403).json({
      success: false,
      error:   'PRO_REQUIRED',
      message: 'This feature requires a Pro plan. Upgrade to unlock.',
    })
    return
  }

  next()
}

// ── Require verified email ────────────────────────────────────────
export async function requireVerified(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error:   'NOT_AUTHENTICATED',
      message: 'Please sign in.',
    }) 
    return
  }

  const user = await User.findById(req.user._id).select('emailVerified')

  if (!user?.emailVerified) {
    res.status(403).json({
      success: false,
      error:   'EMAIL_NOT_VERIFIED',
      message: 'Please verify your email address before continuing.',
    })
    return
  }

  next()
}