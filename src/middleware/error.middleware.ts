import { Request, Response, NextFunction } from 'express'

// ── Global error handler — must have 4 params for Express to
//    recognise it as an error handler ──────────────────────────────
export function errorHandler(
  err:  Error,
  req:  Request,
  res:  Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  console.error('Unhandled error:', {
    message: err.message,
    stack:   err.stack,
    path:    req.path,
    method:  req.method,
  })

  // ── Mongoose duplicate key error ──────────────────────────────
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue ?? {})[0] ?? 'field'
    res.status(409).json({
      success: false,
      error:   'DUPLICATE_KEY',
      message: `${field} already exists.`,
    })
    return
  }

  // ── Mongoose validation error ─────────────────────────────────
  if (err.name === 'ValidationError') {
    const errors = Object.values((err as any).errors).map((e: any) => ({
      field:   e.path,
      message: e.message,
    }))
    res.status(400).json({
      success: false,
      error:   'VALIDATION_ERROR',
      message: 'Invalid data.',
      errors,
    })
    return
  }

  // ── Mongoose cast error — invalid ObjectId ────────────────────
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error:   'INVALID_ID',
      message: 'Invalid ID format.',
    })
    return
  }

  // ── JWT errors ────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error:   'INVALID_TOKEN',
      message: 'Invalid token.',
    })
    return
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error:   'TOKEN_EXPIRED',
      message: 'Token has expired.',
    })
    return
  }

  // ── Default 500 ───────────────────────────────────────────────
  res.status(500).json({
    success: false,
    error:   'INTERNAL_SERVER_ERROR',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong. Please try again.'
        : err.message,
  })
}

// ── 404 handler — put this before errorHandler in main.ts ─────────
export function notFound(
  req:  Request,
  res:  Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  res.status(404).json({
    success: false,
    error:   'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found.`,
  })
}