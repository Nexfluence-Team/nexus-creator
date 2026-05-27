import { Request, Response } from 'express'
import Stripe from 'stripe'
import { AuthRequest } from '../types'
import User from '../models/User.model'
import { sendProActivatedEmail } from '../lib/mailer'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

type InvoiceLike = {
  customer: string | null
}

export async function createCheckout(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { plan } = req.body as {
      plan: 'pro_monthly' | 'pro_yearly'
    }

    const user = await User.findById(req.user?._id)

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Account not found.',
      })
      return
    }

    const priceId =
      plan === 'pro_yearly'
        ? process.env.STRIPE_PRICE_PRO_YEARLY
        : process.env.STRIPE_PRICE_PRO_MONTHLY

    if (!priceId) {
      res.status(500).json({
        success: false,
        error: 'PRICE_NOT_CONFIGURED',
        message: 'Payment plan is not configured.',
      })
      return
    }

    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.email,
        metadata: {
          userId: user._id.toString(),
        },
      })

      customerId = customer.id

      await User.findByIdAndUpdate(user._id, {
        stripeCustomerId: customerId,
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?upgrade=cancelled`,
      metadata: {
        userId: user._id.toString(),
        plan,
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
        },
      },
    })

    res.status(200).json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
      },
    })
  } catch (error) {
    throw error
  }
}

export async function handleWebhook(
  req: Request,
  res: Response
): Promise<void> {
  const sig = req.headers['stripe-signature'] as string
  const secret = process.env.STRIPE_WEBHOOK_SECRET as string

  let event: any

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      secret
    )
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: 'INVALID_SIGNATURE',
      message: err.message,
    })
    return
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any

        const userId = session.metadata?.userId
        const plan = session.metadata?.plan ?? 'pro_monthly'

        if (!userId) break

        const expiresAt = new Date(
          Date.now() +
            (plan === 'pro_yearly' ? 365 : 30) *
              24 *
              60 *
              60 *
              1000
        )

        const user = await User.findByIdAndUpdate(
          userId,
          {
            $set: {
              plan: 'pro',
              planExpiresAt: expiresAt,
              stripeCustomerId:
                session.customer,
            },
          },
          { new: true }
        )

        if (user) {
          await sendProActivatedEmail(
            user.email,
            user.name || 'Creator'
          )
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice =
          event.data.object as InvoiceLike

        const user = await User.findOne({
          stripeCustomerId: invoice.customer,
        })

        if (!user) break

        const expiresAt = new Date(
          Date.now() +
            30 * 24 * 60 * 60 * 1000
        )

        await User.findByIdAndUpdate(user._id, {
          $set: {
            plan: 'pro',
            planExpiresAt: expiresAt,
          },
        })

        break
      }

      case 'customer.subscription.deleted': {
        const subscription =
          event.data.object as any

        const user = await User.findOne({
          stripeCustomerId:
            subscription.customer,
        })

        if (!user) break

        await User.findByIdAndUpdate(user._id, {
          $set: {
            plan: 'free',
          },
          $unset: {
            planExpiresAt: '',
          },
        })

        break
      }

      case 'invoice.payment_failed': {
        const invoice =
          event.data.object as InvoiceLike

        const user = await User.findOne({
          stripeCustomerId: invoice.customer,
        })

        if (!user) break

        console.warn(
          `Payment failed for ${user.email}`
        )

        break
      }

      default:
        break
    }

    res.status(200).json({
      received: true,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'WEBHOOK_HANDLER_ERROR',
      message:
        'Failed to process webhook.',
    })
  }
}

export async function getPaymentStatus(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const user = await User.findById(
      req.user?._id
    ).select(
      'plan planExpiresAt stripeCustomerId'
    )

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Account not found.',
      })
      return
    }

    const isActive =
      user.plan === 'pro' &&
      (!user.planExpiresAt ||
        user.planExpiresAt > new Date())

    res.status(200).json({
      success: true,
      data: {
        plan: user.plan,
        isActive,
        planExpiresAt:
          user.planExpiresAt ?? null,
      },
    })
  } catch (error) {
    throw error
  }
}