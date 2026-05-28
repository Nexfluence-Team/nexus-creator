import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

// ── Human-friendly message from the first Zod error ──────────────
function humaniseZodErrors(
  errors: { field: string; message: string }[]
): string {
  if (errors.length === 0) return 'Please check your input and try again.'
  const { field } = errors[0]
  if (field === 'otp')      return 'Incorrect code — please check and try again.'
  if (field === 'email')    return 'Please enter a valid email address.'
  if (field === 'password') return 'Password must be at least 6 characters.'
  return 'Please check your input and try again.'
}

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
          message: humaniseZodErrors(errors),
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