import mongoose, { Schema } from 'mongoose'
import { ILink } from '../types'

const LinkSchema = new Schema<ILink>(
  {
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    platform: {
      type:     String,
      required: true,
      trim:     true,
      lowercase: true,
    },
    url: {
      type:    String,
      default: '',
      trim:    true,
    },
  },
  {
    timestamps: true,
  }
)

// ── One document per platform per user ────────────────────────────
LinkSchema.index({ userId: 1, platform: 1 }, { unique: true })

// ── Strip __v from responses ──────────────────────────────────────
LinkSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v
    return ret
  },
})

export default mongoose.model<ILink>('Link', LinkSchema)