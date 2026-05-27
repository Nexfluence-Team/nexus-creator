import { Response } from 'express'
import { AuthRequest } from '../types'
import Rate from '../models/Rate.model'
import CaseStudy from '../models/CaseStudy.model'
import Testimonial from '../models/Testimonial.model'
import Link from '../models/Link.model'

// ─────────────────────────────────────────────────────────────────
// RATES
// ─────────────────────────────────────────────────────────────────

// ── GET /rates ────────────────────────────────────────────────────
export async function getRates(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const rates = await Rate.find({ userId: req.user?._id }).sort({
      order: 1,
    })

    res.status(200).json({
      success: true,
      data:    { rates },
    })
  } catch (error) {
    throw error
  }
}

// ── POST /rates ───────────────────────────────────────────────────
export async function createRate(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { title, price, turnaround, description, includes, order } =
      req.body

    // Set order to end of list if not provided
    const count = await Rate.countDocuments({ userId: req.user?._id })

    const rate = await Rate.create({
      userId: req.user?._id,
      title,
      price,
      turnaround,
      description,
      includes,
      order:  order ?? count,
    })

    res.status(201).json({
      success: true,
      data:    { rate },
    })
  } catch (error) {
    throw error
  }
}

// ── PUT /rates/:id ────────────────────────────────────────────────
export async function updateRate(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const rate = await Rate.findOneAndUpdate(
      {
        _id:    req.params.id,
        userId: req.user?._id,
      },
      { $set: req.body },
      { new: true }
    )

    if (!rate) {
      res.status(404).json({
        success: false,
        error:   'RATE_NOT_FOUND',
        message: 'Service package not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      data:    { rate },
    })
  } catch (error) {
    throw error
  }
}

// ── DELETE /rates/:id ─────────────────────────────────────────────
export async function deleteRate(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const rate = await Rate.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user?._id,
    })

    if (!rate) {
      res.status(404).json({
        success: false,
        error:   'RATE_NOT_FOUND',
        message: 'Service package not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      data:    { message: 'Service package deleted.' },
    })
  } catch (error) {
    throw error
  }
}

// ── PUT /rates/reorder ────────────────────────────────────────────
export async function reorderRates(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { ids } = req.body as { ids: string[] }

    const updates = ids.map((id, index) =>
      Rate.findOneAndUpdate(
        { _id: id, userId: req.user?._id },
        { $set: { order: index } }
      )
    )

    await Promise.all(updates)

    res.status(200).json({
      success: true,
      data:    { message: 'Rates reordered.' },
    })
  } catch (error) {
    throw error
  }
}

// ─────────────────────────────────────────────────────────────────
// CASE STUDIES
// ─────────────────────────────────────────────────────────────────

// ── GET /cases ────────────────────────────────────────────────────
export async function getCases(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const cases = await CaseStudy.find({ userId: req.user?._id }).sort({
      createdAt: -1,
    })

    res.status(200).json({
      success: true,
      data:    { cases },
    })
  } catch (error) {
    throw error
  }
}

// ── POST /cases ───────────────────────────────────────────────────
export async function createCase(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { brand, description, period, metrics } = req.body

    const caseStudy = await CaseStudy.create({
      userId: req.user?._id,
      brand,
      description,
      period,
      metrics,
    })

    res.status(201).json({
      success: true,
      data:    { caseStudy },
    })
  } catch (error) {
    throw error
  }
}

// ── PUT /cases/:id ────────────────────────────────────────────────
export async function updateCase(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const caseStudy = await CaseStudy.findOneAndUpdate(
      {
        _id:    req.params.id,
        userId: req.user?._id,
      },
      { $set: req.body },
      { new: true }
    )

    if (!caseStudy) {
      res.status(404).json({
        success: false,
        error:   'CASE_NOT_FOUND',
        message: 'Case study not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      data:    { caseStudy },
    })
  } catch (error) {
    throw error
  }
}

// ── DELETE /cases/:id ─────────────────────────────────────────────
export async function deleteCase(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const caseStudy = await CaseStudy.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user?._id,
    })

    if (!caseStudy) {
      res.status(404).json({
        success: false,
        error:   'CASE_NOT_FOUND',
        message: 'Case study not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      data:    { message: 'Case study deleted.' },
    })
  } catch (error) {
    throw error
  }
}

// ─────────────────────────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────────────────────────

// ── GET /testimonials ─────────────────────────────────────────────
export async function getTestimonials(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const testimonials = await Testimonial.find({
      userId: req.user?._id,
    }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data:    { testimonials },
    })
  } catch (error) {
    throw error
  }
}

// ── POST /testimonials ────────────────────────────────────────────
export async function createTestimonial(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { name, role, company, quote, rating } = req.body

    const testimonial = await Testimonial.create({
      userId: req.user?._id,
      name,
      role,
      company,
      quote,
      rating,
    })

    res.status(201).json({
      success: true,
      data:    { testimonial },
    })
  } catch (error) {
    throw error
  }
}

// ── PUT /testimonials/:id ─────────────────────────────────────────
export async function updateTestimonial(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const testimonial = await Testimonial.findOneAndUpdate(
      {
        _id:    req.params.id,
        userId: req.user?._id,
      },
      { $set: req.body },
      { new: true }
    )

    if (!testimonial) {
      res.status(404).json({
        success: false,
        error:   'TESTIMONIAL_NOT_FOUND',
        message: 'Testimonial not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      data:    { testimonial },
    })
  } catch (error) {
    throw error
  }
}

// ── DELETE /testimonials/:id ──────────────────────────────────────
export async function deleteTestimonial(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const testimonial = await Testimonial.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user?._id,
    })

    if (!testimonial) {
      res.status(404).json({
        success: false,
        error:   'TESTIMONIAL_NOT_FOUND',
        message: 'Testimonial not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      data:    { message: 'Testimonial deleted.' },
    })
  } catch (error) {
    throw error
  }
}

// ─────────────────────────────────────────────────────────────────
// LINKS
// ─────────────────────────────────────────────────────────────────

// ── GET /links ────────────────────────────────────────────────────
export async function getLinks(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const links = await Link.find({ userId: req.user?._id })

    const linksMap: Record<string, string> = {}
    links.forEach((l) => {
      linksMap[l.platform] = l.url
    })

    res.status(200).json({
      success: true,
      data:    { links: linksMap },
    })
  } catch (error) {
    throw error
  }
}

// ── PUT /links ────────────────────────────────────────────────────
export async function updateLinks(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { links } = req.body as {
      links: Record<string, string>
    }

    const userId = req.user?._id

    // Upsert one document per platform
    const ops = Object.entries(links).map(([platform, url]) =>
      Link.findOneAndUpdate(
        { userId, platform },
        { userId, platform, url },
        { upsert: true, new: true }
      )
    )

    await Promise.all(ops)

    res.status(200).json({
      success: true,
      data:    { links },
    })
  } catch (error) {
    throw error
  }
}
