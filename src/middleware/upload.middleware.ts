import multer, { FileFilterCallback } from 'multer'
import { Request } from 'express'

// ── Store files in memory so we can stream to Cloudinary ──────────
const storage = multer.memoryStorage()

// ── Only allow image files ────────────────────────────────────────
function imageFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, PNG, WEBP and GIF images are allowed.'))
  }
}

// ── Profile picture upload — 5MB max ─────────────────────────────
export const uploadProfilePic = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single('file')

// ── Thumbnail upload — 5MB max ────────────────────────────────────
export const uploadThumbnail = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single('file')

// ── Handle multer errors in a clean way ──────────────────────────
export function handleMulterError(
  err: any,
  _req: Request,
  res: any,
  next: any
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error:   'FILE_TOO_LARGE',
        message: 'File is too large. Maximum size is 5MB.',
      })
      return
    }
    res.status(400).json({
      success: false,
      error:   'UPLOAD_ERROR',
      message: err.message,
    })
    return
  }

  if (err) {
    res.status(400).json({
      success: false,
      error:   'UPLOAD_ERROR',
      message: err.message,
    })
    return
  }

  next()
}