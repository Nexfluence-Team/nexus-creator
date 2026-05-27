import jwt from 'jsonwebtoken'
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  PendingTokenPayload,
} from '../types'

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  as string
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string
const PENDING_SECRET = process.env.JWT_PENDING_SECRET as string

if (!ACCESS_SECRET || !REFRESH_SECRET || !PENDING_SECRET) {
  throw new Error('JWT secrets are not defined in .env')
}

// ── Access Token — 7 days ─────────────────────────────────────────
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: '7d',
  })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload
}

// ── Refresh Token — 90 days ───────────────────────────────────────
export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: '90d',
  })
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload
}

// ── Pending Token — 10 minutes ────────────────────────────────────
// Issued after email/password entry during signup only.
// Has no access rights — only used to carry the email to /verify-otp
export function signPendingToken(payload: PendingTokenPayload): string {
  return jwt.sign(payload, PENDING_SECRET, {
    expiresIn: '10m',
  })
}

export function verifyPendingToken(token: string): PendingTokenPayload {
  return jwt.verify(token, PENDING_SECRET) as PendingTokenPayload
}

// ── Extract token from Authorization header ───────────────────────
export function extractBearerToken(
  authHeader: string | undefined
): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return authHeader.split(' ')[1]
}