import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

// ── Validate request body ─────────────────────────────────────────
export function validate(schema: ZodSchema) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))

        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid request data.',
          errors,
        })
        return
      }

      next(error)
    }
  }
}

// ── Validate request params ───────────────────────────────────────
export function validateParams(schema: ZodSchema) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      req.params = schema.parse(req.params) as any
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))

        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid request parameters.',
          errors,
        })
        return
      }

      next(error)
    }
  }
}

// ── Validate query string ─────────────────────────────────────────
export function validateQuery(schema: ZodSchema) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      req.query = schema.parse(req.query) as any
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))

        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid query parameters.',
          errors,
        })
        return
      }

      next(error)
    }
  }
}