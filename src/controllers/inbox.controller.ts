import { Request, Response } from 'express'
import { AuthRequest } from '../types'
import InboxMessage from '../models/InboxMessage.model'
import User from '../models/User.model'
import { sendInboxNotification } from '../lib/mailer'

// ── POST /inbox/:slug — public, no auth required ──────────────────
export async function sendMessage(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { slug } = req.params
    const {
      type,
      senderName,
      senderCompany,
      senderEmail,
      message,
      budget,
    } = req.body

    // Find the creator by slug
    const creator = await User.findOne({ slug })
    if (!creator) {
      res.status(404).json({
        success: false,
        error:   'CREATOR_NOT_FOUND',
        message: 'Creator profile not found.',
      })
      return
    }

    // Enforce one message per sender per creator
    const existing = await InboxMessage.findOne({
      recipientUserId: creator._id,
      senderEmail:     senderEmail.toLowerCase(),
    })

    if (existing) {
      res.status(429).json({
        success: false,
        error:   'ALREADY_MESSAGED',
        message: `You have already sent a message to ${creator.name || 'this creator'}. Please wait for their reply via email.`,
      })
      return
    }

    // Save message
    const inboxMessage = await InboxMessage.create({
      recipientUserId: creator._id,
      type,
      read:            false,
      senderName,
      senderCompany:   senderCompany ?? '',
      senderEmail:     senderEmail.toLowerCase(),
      message,
      budget:          budget ?? '',
    })

    // Notify creator by email — fire and forget
    sendInboxNotification(
      creator.email,
      creator.name || 'Creator',
      senderName,
      senderCompany ?? '',
      type,
      message.slice(0, 200)
    ).catch(() => {})

    res.status(201).json({
      success: true,
      data: {
        message: 'Message sent successfully.',
        id:      inboxMessage._id,
      },
    })
  } catch (error) {
    throw error
  }
}

// ── GET /inbox — authenticated ────────────────────────────────────
export async function getInbox(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const messages = await InboxMessage.find({
      recipientUserId: req.user?._id,
    }).sort({ createdAt: -1 })

    const unreadCount = messages.filter((m) => !m.read).length

    res.status(200).json({
      success: true,
      data: {
        messages,
        unreadCount,
      },
    })
  } catch (error) {
    throw error
  }
}

// ── PUT /inbox/:id/read — authenticated ───────────────────────────
export async function markAsRead(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const message = await InboxMessage.findOneAndUpdate(
      {
        _id:             req.params.id,
        recipientUserId: req.user?._id,
      },
      { $set: { read: true } },
      { new: true }
    )

    if (!message) {
      res.status(404).json({
        success: false,
        error:   'MESSAGE_NOT_FOUND',
        message: 'Message not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      data:    { message },
    })
  } catch (error) {
    throw error
  }
}

// ── DELETE /inbox/:id — authenticated ─────────────────────────────
export async function deleteMessage(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const message = await InboxMessage.findOneAndDelete({
      _id:             req.params.id,
      recipientUserId: req.user?._id,
    })

    if (!message) {
      res.status(404).json({
        success: false,
        error:   'MESSAGE_NOT_FOUND',
        message: 'Message not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      data:    { message: 'Message deleted.' },
    })
  } catch (error) {
    throw error
  }
}

// ── GET /inbox/unread-count — authenticated ───────────────────────
export async function getUnreadCount(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const count = await InboxMessage.countDocuments({
      recipientUserId: req.user?._id,
      read:            false,
    })

    res.status(200).json({
      success: true,
      data:    { unreadCount: count },
    })
  } catch (error) {
    throw error
  }
}