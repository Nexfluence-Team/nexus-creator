import mongoose, { Schema } from 'mongoose'
import { IOTPToken } from '../types'

const OTPTokenSchema = new Schema<IOTPToken>(
  {
    email: {
      type:      String,
      required:  true,
      lowercase: true,
      trim:      true,
    },
    codeHash: {
      type:     String,
      required: true,
    },
    expiresAt: {
      type:     Date,
      required: true,
    },
    used: {
      type:    Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// ── TTL index — MongoDB auto-deletes expired tokens ───────────────
OTPTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// ── Index for fast lookup by email ────────────────────────────────
OTPTokenSchema.index({ email: 1 })

export default mongoose.model<IOTPToken>('OTPToken', OTPTokenSchema)