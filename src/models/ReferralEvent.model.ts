import mongoose, { Schema } from 'mongoose'
import { IReferralEvent } from '../types'

const ReferralEventSchema = new Schema<IReferralEvent>(
  {
    referralCode: {
      type:     String,
      required: true,
      trim:     true,
    },
    referrerId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    newUserId: {
      type: Schema.Types.ObjectId,
      ref:  'User',
    },
    type: {
      type:     String,
      enum:     ['signup', 'upgrade', 'redemption'],
      required: true,
    },
    coinsAwarded: {
      type:    Number,
      default: 0,
    },
    reward: {
      type:    String,
      default: '',
    },
    coinsCost: {
      type:    Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// ── Index for fast lookup by referrer ─────────────────────────────
ReferralEventSchema.index({ referrerId: 1, createdAt: -1 })

// ── Index for fast lookup by referral code ────────────────────────
ReferralEventSchema.index({ referralCode: 1 })

// ── Strip __v from responses ──────────────────────────────────────
ReferralEventSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v
    return ret
  },
})

export default mongoose.model<IReferralEvent>(
  'ReferralEvent',
  ReferralEventSchema
)