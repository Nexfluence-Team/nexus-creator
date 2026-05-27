import mongoose, { Schema } from 'mongoose'
import { IProfileView } from '../types'

const ProfileViewSchema = new Schema<IProfileView>(
  {
    profileUserId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    visitorIp: {
      type:    String,
      default: '',
    },
    referrer: {
      type:    String,
      default: '',
      trim:    true,
    },
    viewedAt: {
      type:    Date,
      default: Date.now,
    },
  }
)

// ── Index for fast analytics queries ──────────────────────────────
ProfileViewSchema.index({ profileUserId: 1, viewedAt: -1 })

// ── Index for unique visitor counting ─────────────────────────────
ProfileViewSchema.index({ profileUserId: 1, visitorIp: 1 })

// ── Strip __v from responses ──────────────────────────────────────
ProfileViewSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v
    return ret
  },
})

export default mongoose.model<IProfileView>('ProfileView', ProfileViewSchema)