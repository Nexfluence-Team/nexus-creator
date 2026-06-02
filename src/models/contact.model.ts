import mongoose, { Schema, Document } from 'mongoose'

export interface IContact extends Document {
  name:      string
  email:     string
  type:      string
  subject:   string
  message:   string
  createdAt: Date
  updatedAt: Date
}

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    email: {
      type:     String,
      required: true,
      trim:     true,
      lowercase: true,
    },
    type: {
      type:    String,
      enum:    ['brand', 'creator', 'partner', 'other'],
      default: 'other',
    },
    subject: {
      type:     String,
      required: true,
      trim:     true,
    },
    message: {
      type:     String,
      required: true,
      trim:     true,
    },
  },
  {
    timestamps: true,
  }
)

ContactSchema.index({ email: 1 })
ContactSchema.index({ createdAt: -1 })

ContactSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.__v
    return ret
  },
})

export default mongoose.model<IContact>('Contact', ContactSchema)
