import mongoose, { Schema } from 'mongoose'
import { ITestimonial } from '../types'

const TestimonialSchema = new Schema<ITestimonial>(
  {
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    role: {
      type:    String,
      default: '',
      trim:    true,
    },
    company: {
      type:    String,
      default: '',
      trim:    true,
    },
    quote: {
      type:     String,
      required: true,
      trim:     true,
    },
    rating: {
      type:    Number,
      default: 5,
      min:     1,
      max:     5,
    },
  },
  {
    timestamps: true,
  }
)

// ── Index for fast lookup by userId ───────────────────────────────
TestimonialSchema.index({ userId: 1 })

// ── Strip __v from responses ──────────────────────────────────────
TestimonialSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v
    return ret
  },
})

export default mongoose.model<ITestimonial>('Testimonial', TestimonialSchema)