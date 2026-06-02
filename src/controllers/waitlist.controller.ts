import { Request, Response, NextFunction } from 'express'
import Waitlist from '../models/waitlist.model'

// POST /waitlist
export async function submitWaitlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, location, role, industry } = req.body

    // Check for duplicate email and return a clean message
    const existing = await Waitlist.findOne({ email })
    if (existing) {
      res.status(409).json({
        success: false,
        message: "You're already on the list! We'll be in touch soon.",
      })
      return
    }

    const entry = await Waitlist.create({ name, email, location, role, industry })

    res.status(201).json({
      success: true,
      message: "You're on the list! Expect early access perks when we launch.",
      data: { id: entry._id },
    })
  } catch (err) {
    next(err)
  }
}
