import { Response } from 'express'
import { AuthRequest } from '../types'
import User from '../models/User.model'
import Video from '../models/Video.model'
import Rate from '../models/Rate.model'
import CaseStudy from '../models/CaseStudy.model'
import Testimonial from '../models/Testimonial.model'
import Link from '../models/Link.model'
import ProfileView from '../models/ProfileView.model'
import crypto from 'crypto'

// ── GET /profile/me ───────────────────────────────────────────────
export async function getMe(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const user = await User.findById(req.user?._id)

    if (!user) {
      res.status(404).json({
        success: false,
        error:   'USER_NOT_FOUND',
        message: 'Account not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      data:    { user },
    })
  } catch (error) {
    throw error
  }
}

// ── PUT /profile/header ───────────────────────────────────────────
export async function updateHeader(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.user?._id
    const {
      name,
      bio,
      location,
      ctaText,
      slug,
      niches,
      platforms,
      followerRange,
      profilePicUrl,
    } = req.body

    // Check slug uniqueness if slug is being updated
    if (slug) {
      const existing = await User.findOne({
        slug,
        _id: { $ne: userId },
      })

      if (existing) {
        // Suggest an alternative
        const suggested = `${slug}-${Math.floor(Math.random() * 9000 + 1000)}`
        res.status(409).json({
          success: false,
          error:   'SLUG_TAKEN',
          message: `The URL "${slug}" is already taken.`,
          data:    { suggested },
        })
        return
      }
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(name          !== undefined && { name }),
          ...(bio           !== undefined && { bio }),
          ...(location      !== undefined && { location }),
          ...(ctaText       !== undefined && { ctaText }),
          ...(slug          !== undefined && { slug }),
          ...(niches        !== undefined && { niches }),
          ...(platforms     !== undefined && { platforms }),
          ...(followerRange !== undefined && { followerRange }),
          ...(profilePicUrl !== undefined && { profilePicUrl }),
        },
      },
      { new: true }
    )

    res.status(200).json({
      success: true,
      data:    { user: updated },
    })
  } catch (error) {
    throw error
  }
}

// ── PUT /profile/design ───────────────────────────────────────────
export async function updateDesign(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { theme, primaryColor, accentColor, font } = req.body

    const updated = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          ...(theme        !== undefined && { theme }),
          ...(primaryColor !== undefined && { primaryColor }),
          ...(accentColor  !== undefined && { accentColor }),
          ...(font         !== undefined && { font }),
        },
      },
      { new: true }
    )

    res.status(200).json({
      success: true,
      data:    { user: updated },
    })
  } catch (error) {
    throw error
  }
}

// ── GET /profile/:slug — public ───────────────────────────────────
export async function getPublicProfile(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { slug } = req.params

    const user = await User.findOne({ slug })

    if (!user) {
      res.status(404).json({
        success: false,
        error:   'PROFILE_NOT_FOUND',
        message: 'Creator profile not found.',
      })
      return
    }

    // Fetch all profile data in parallel
    const [videos, rates, cases, testimonials, links] = await Promise.all([
      Video.find({ userId: user._id }).sort({ createdAt: -1 }),
      Rate.find({ userId: user._id }).sort({ order: 1 }),
      CaseStudy.find({ userId: user._id }).sort({ createdAt: -1 }),
      Testimonial.find({ userId: user._id }).sort({ createdAt: -1 }),
      Link.find({ userId: user._id }),
    ])

    // Record profile view — fire and forget
    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      ''
    const visitorIp = crypto
      .createHash('sha256')
      .update(rawIp)
      .digest('hex')

    ProfileView.create({
      profileUserId: user._id,
      visitorIp,
      referrer: req.headers.referer ?? '',
      viewedAt: new Date(),
    }).catch(() => {})

    // Shape links as a plain object
    const linksMap: Record<string, string> = {}
    links.forEach((l) => {
      linksMap[l.platform] = l.url
    })

    res.status(200).json({
      success: true,
      data: {
        user,
        videos,
        rates,
        cases,
        testimonials,
        links: linksMap,
      },
    })
  } catch (error) {
    throw error
  }
}