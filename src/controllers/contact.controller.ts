import { Request, Response, NextFunction } from 'express'
import Contact from '../models/contact.model'

// POST /contact
export async function submitContact(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, type, subject, message } = req.body

    const entry = await Contact.create({ name, email, type, subject, message })

    res.status(201).json({
      success: true,
      message: 'Message received. We will get back to you within 24 hours.',
      data: { id: entry._id },
    })
  } catch (err) {
    next(err)
  }
}
