import mongoose, { Schema } from 'mongoose'
import { IInboxMessage } from '../types'

const InboxMessageSchema = new Schema<IInboxMessage>(
  {
    recipientUserId: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    type: {
      type:     String,
      enum:     ['message', 'inquiry'],
      required: true,
    },
    read: {
      type:    Boolean,
      default: false,
    },
    senderName: {
      type:     String,
      required: true,
      trim:     true,
    },
    senderCompany: {
      type:    String,
      default: '',
      trim:    true,
    },
    senderEmail: {
      type:      String,
      required:  true,
      lowercase: true,
      trim:      true,
    },
    message: {
      type:     String,
      required: true,
      trim:     true,
    },
    budget: {
      type:    String,
      default: '',
      trim:    true,
    },
  },
  {
    timestamps: true,
  }
)

// ── Index for fast lookup by recipient ────────────────────────────
InboxMessageSchema.index({ recipientUserId: 1, createdAt: -1 })

// ── Index to enforce one message per sender per creator ───────────
InboxMessageSchema.index({ recipientUserId: 1, senderEmail: 1 })

// ── Strip __v from responses ──────────────────────────────────────
InboxMessageSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v
    return ret
  },
})

export default mongoose.model<IInboxMessage>('InboxMessage', InboxMessageSchema)