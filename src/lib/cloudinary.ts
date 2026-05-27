import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key:    process.env.CLOUDINARY_API_KEY    as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
})

// ── Upload a buffer directly (used with Multer memory storage) ────
export async function uploadImage(
  buffer: Buffer,
  folder: string,
  publicId: string,
  transformation?: object
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id:      publicId,
        overwrite:      true,
        transformation: transformation ?? [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'))
          return
        }
        resolve(result.secure_url)
      }
    )

    const readable = new Readable()
    readable.push(buffer)
    readable.push(null)
    readable.pipe(uploadStream)
  })
}

// ── Upload profile picture ────────────────────────────────────────
export async function uploadProfilePic(
  buffer: Buffer,
  userId: string
): Promise<string> {
  return uploadImage(
    buffer,
    'creator-nexus/profiles',
    `profile_${userId}`,
    [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' },
    ]
  )
}

// ── Upload video thumbnail ────────────────────────────────────────
export async function uploadThumbnail(
  buffer: Buffer,
  userId: string,
  videoId: string
): Promise<string> {
  return uploadImage(
    buffer,
    'creator-nexus/thumbnails',
    `thumb_${userId}_${videoId}`,
    [
      { width: 600, height: 900, crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' },
    ]
  )
}

// ── Delete an image by public ID ──────────────────────────────────
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export default cloudinary