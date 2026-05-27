import mongoose, { Schema } from 'mongoose'
import { IRate } from '../types'

const RateSchema = new Schema<IRate>(
  {
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    title: {
      type:     String,
      required: true,
      trim:     true,
    },
    price: {
      type:     String,
      required: true,
      trim:     true,
    },
    turnaround: {
      type:    String,
      default: '',
      trim:    true,
    },
    description: {
      type:    String,
      default: '',
      trim:    true,
    },
    includes: {
      type:    [String],
      default: [],
    },
    order: {
      type:    Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// ── Index for fast lookup by userId, sorted by order ──────────────
RateSchema.index({ userId: 1, order: 1 })

// ── Strip __v from responses ──────────────────────────────────────
RateSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v
    return ret
  },
})

export default mongoose.model<IRate>('Rate', RateSchema)