import { Request } from 'express'
import { Document, Types } from 'mongoose'

// ── Authenticated request ─────────────────────────────────────────
export interface AuthRequest extends Request {
  user?: {
    _id: string
    email: string
    plan: 'free' | 'pro'
    coins: number
  }
}

// ── User ──────────────────────────────────────────────────────────
export interface IUser extends Document {
  _id: Types.ObjectId
  email: string
  passwordHash?: string
  name: string
  location: string
  bio: string
  profilePicUrl: string
  ctaText: string
  niches: string[]
  slug: string
  platforms: string[]
  followerRange: string
  theme: string
  primaryColor: string
  accentColor: string
  font: string
  referralCode: string
  referredBy?: string
  coins: number
  plan: 'free' | 'pro'
  planExpiresAt?: Date
  stripeCustomerId?: string
  instagramId?: string
  tiktokId?: string
  emailVerified: boolean
  createdAt: Date
  lastActiveAt: Date
}

// ── OTP Token ─────────────────────────────────────────────────────
export interface IOTPToken extends Document {
  email: string
  codeHash: string
  expiresAt: Date
  used: boolean
  createdAt: Date
}

// ── Video ─────────────────────────────────────────────────────────
export interface IVideo extends Document {
  userId: Types.ObjectId
  title: string
  url: string
  platform: 'instagram' | 'tiktok' | 'youtube' | 'other'
  category: string
  views: string
  thumbnailUrl: string
  createdAt: Date
}

// ── Rate / Service Package ────────────────────────────────────────
export interface IRate extends Document {
  userId: Types.ObjectId
  title: string
  price: string
  turnaround: string
  description: string
  includes: string[]
  order: number
  createdAt: Date
}

// ── Case Study ────────────────────────────────────────────────────
export interface ICaseStudy extends Document {
  userId: Types.ObjectId
  brand: string
  description: string
  period: string
  metrics: { label: string; value: string }[]
  createdAt: Date
}

// ── Testimonial ───────────────────────────────────────────────────
export interface ITestimonial extends Document {
  userId: Types.ObjectId
  name: string
  role: string
  company: string
  quote: string
  rating: number
  createdAt: Date
}

// ── Link ──────────────────────────────────────────────────────────
export interface ILink extends Document {
  userId: Types.ObjectId
  platform: string
  url: string
}

// ── Inbox Message ─────────────────────────────────────────────────
export interface IInboxMessage extends Document {
  recipientUserId: Types.ObjectId
  type: 'message' | 'inquiry'
  read: boolean
  senderName: string
  senderCompany: string
  senderEmail: string
  message: string
  budget?: string
  createdAt: Date
}

// ── Profile View ──────────────────────────────────────────────────
export interface IProfileView extends Document {
  profileUserId: Types.ObjectId
  visitorIp: string
  referrer: string
  viewedAt: Date
}

// ── Referral Event ────────────────────────────────────────────────
export interface IReferralEvent extends Document {
  referralCode: string
  referrerId: Types.ObjectId
  newUserId?: Types.ObjectId
  type: 'signup' | 'upgrade' | 'redemption'
  coinsAwarded: number
  reward?: string
  coinsCost?: number
  createdAt: Date
}

// ── JWT Payloads ──────────────────────────────────────────────────
export interface AccessTokenPayload {
  sub: string
  email: string
  plan: 'free' | 'pro'
  coins: number
}

export interface RefreshTokenPayload {
  sub: string
}

export interface PendingTokenPayload {
  email: string
}

// ── API Response helpers ──────────────────────────────────────────
export interface ApiSuccess<T = unknown> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: string
  message: string
}