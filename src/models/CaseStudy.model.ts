import mongoose, { Schema } from 'mongoose'
import { ICaseStudy } from '../types'

const CaseStudySchema = new Schema<ICaseStudy>(
  {
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    brand: {
      type:     String,
      required: true,
      trim:     true,
    },
    description: {
      type:    String,
      default: '',
      trim:    true,
    },
    period: {
      type:    String,
      default: '',
      trim:    true,
    },
    metrics: {
      type: [
        {
          label: { type: String, default: '' },
          value: { type: String, default: '' },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// ── Index for fast lookup by userId ───────────────────────────────
CaseStudySchema.index({ userId: 1 })

// ── Strip __v from responses ──────────────────────────────────────
CaseStudySchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v
    return ret
  },
})

export default mongoose.model<ICaseStudy>('CaseStudy', CaseStudySchema)