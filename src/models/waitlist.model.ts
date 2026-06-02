import mongoose, { Schema, Document } from 'mongoose'

export interface IWaitlist extends Document {
  name:      string
  email:     string
  location:  string
  role:      string
  industry:  string
  createdAt: Date
  updatedAt: Date
}

const WaitlistSchema = new Schema<IWaitlist>(
  {
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    email: {
      type:      String,
      required:  true,
      trim:      true,
      lowercase: true,
      unique:    true,   // prevent duplicate signups
    },
    location: {
      type:     String,
      required: true,
      trim:     true,
    },
    role: {
      type:    String,
      enum:    ['brand', 'creator', 'agency', 'other'],
      default: 'other',
    },
    industry: {
      type:    String,
      enum:    ['beauty', 'fashion', 'fitness', 'food', 'tech', 'travel', 'other'],
      default: 'other',
    },
  },
  {
    timestamps: true,
  }
)

WaitlistSchema.index({ email: 1 }, { unique: true })
WaitlistSchema.index({ createdAt: -1 })

WaitlistSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v
    return ret
  },
})

export default mongoose.model<IWaitlist>('Waitlist', WaitlistSchema)
