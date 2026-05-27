import mongoose, { Schema } from 'mongoose'
import { IUser } from '../types'

const UserSchema = new Schema<IUser>(
  {
    email: {
      type:     String,
      unique:   true,
      sparse:   true,
      lowercase: true,
      trim:     true,
    },
    passwordHash: {
      type:   String,
      select: false,
    },
    name: {
      type:    String,
      default: '',
      trim:    true,
    },
    location: {
      type:    String,
      default: '',
      trim:    true,
    },
    bio: {
      type:    String,
      default: '',
      trim:    true,
      maxlength: 500,
    },
    profilePicUrl: {
      type:    String,
      default: '',
    },
    ctaText: {
      type:    String,
      default: 'Work With Me',
      trim:    true,
    },
    niches: {
      type:    [String],
      default: [],
    },
    slug: {
      type:      String,
      unique:    true,
      sparse:    true,
      lowercase: true,
      trim:      true,
    },
    platforms: {
      type:    [String],
      default: [],
    },
    followerRange: {
      type:    String,
      default: '',
    },
    theme: {
      type:    String,
      default: 'minimal',
    },
    primaryColor: {
      type:    String,
      default: '#8061ff',
    },
    accentColor: {
      type:    String,
      default: '#ff33bc',
    },
    font: {
      type:    String,
      default: 'Rubik',
    },
    referralCode: {
      type:   String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: String,
    },
    coins: {
      type:    Number,
      default: 0,
      min:     0,
    },
    plan: {
      type:    String,
      enum:    ['free', 'pro'],
      default: 'free',
    },
    planExpiresAt: {
      type: Date,
    },
    stripeCustomerId: {
      type: String,
    },
    instagramId: {
      type:   String,
      unique: true,
      sparse: true,
    },
    tiktokId: {
      type:   String,
      unique: true,
      sparse: true,
    },
    emailVerified: {
      type:    Boolean,
      default: false,
    },
    lastActiveAt: {
      type:    Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)



// ── Strip passwordHash from any JSON response ─────────────────────
UserSchema.set('toJSON', {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    delete ret.passwordHash
    delete ret.__v
    return ret
  },
})

export default mongoose.model<IUser>('User', UserSchema)