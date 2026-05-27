import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env')
}

let isConnected = false

export async function connectDB(): Promise<void> {
  if (isConnected) {
    console.log('MongoDB already connected')
    return
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      dbName: 'creator-nexus',
    })

    isConnected = db.connections[0].readyState === 1

    console.log('MongoDB connected successfully')

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err)
      isConnected = false
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected')
      isConnected = false
    })

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected')
      isConnected = true
    })

  } catch (error) {
    console.error('MongoDB connection failed:', error)
    process.exit(1)
  }
}

export function getConnectionStatus(): boolean {
  return isConnected
}