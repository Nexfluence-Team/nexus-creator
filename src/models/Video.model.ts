import mongoose, { Schema } from 'mongoose'
import { IVideo } from '../types'

const VideoSchema = new Schema<IVideo>(
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
    url: {
      type:     String,
      required: true,
      trim:     true,
    },
    platform: {
      type:    String,
      enum:    ['instagram', 'tiktok', 'youtube', 'other'],
      default: 'instagram',
    },
    category: {
      type:    String,
      default: '',
      trim:    true,
    },
    views: {
      type:    String,
      default: '',
      trim:    true,
    },
    thumbnailUrl: {
      type:    String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

// ── Index for fast lookup by userId ───────────────────────────────
VideoSchema.index({ userId: 1 })

// ── Strip __v from responses ──────────────────────────────────────
VideoSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v
    return ret
  },
})

export default mongoose.model<IVideo>('Video', VideoSchema)