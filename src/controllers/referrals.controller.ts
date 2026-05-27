import { Response } from 'express'
import { AuthRequest } from '../types'
import User from '../models/User.model'
import ReferralEvent from '../models/ReferralEvent.model'

// ── Reward definitions ────────────────────────────────────────────
const REWARDS: Record<
  string,
  { label: string; coinCost: number; action: string; value: number }
> = {
  pro_1month: {
    label: '1 Month Pro',
    coinCost: 50,
    action: 'pro',
    value: 30,
  },
  pro_3months: {
    label: '3 Months Pro',
    coinCost: 130,
    action: 'pro',
    value: 90,
  },
  pro_yearly: {
    label: '1 Year Pro',
    coinCost: 200,
    action: 'pro',
    value: 365,
  },
  pro_lifetime: {
    label: 'Lifetime Pro',
    coinCost: 500,
    action: 'pro_lifetime',
    value: 0,
  },
}

// ── GET /referrals/me ─────────────────────────────────────────────
export async function getMyReferrals(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const user = await User.findById(req.user?._id)

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Account not found.',
      })
      return
    }

    const [signupCount, upgradeCount, recentEvents] = await Promise.all([
      ReferralEvent.countDocuments({
        referralCode: user.referralCode,
        type: 'signup',
      }),
      ReferralEvent.countDocuments({
        referralCode: user.referralCode,
        type: 'upgrade',
      }),
      ReferralEvent.find({
        referrerId: user._id,
      })
        .sort({ createdAt: -1 })
        .limit(10),
    ])

    const coinsEarned = await ReferralEvent.aggregate([
      {
        $match: {
          referrerId: user._id,
          type: { $in: ['signup', 'upgrade'] },
        },
      },
      {
        $group: {
          _id: null,
          totalCoins: { $sum: '$coinsAwarded' },
        },
      },
    ])

    res.status(200).json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink: `${process.env.FRONTEND_URL}/r/${user.referralCode}`,
        coins: user.coins,
        coinsEarned: coinsEarned[0]?.totalCoins ?? 0,
        signupCount,
        upgradeCount,
        recentEvents,
        rewards: Object.entries(REWARDS).map(([id, r]) => ({
          id,
          label: r.label,
          coinCost: r.coinCost,
        })),
      },
    })
  } catch (error) {
    throw error
  }
}

// ── POST /referrals/redeem ────────────────────────────────────────
export async function redeemCoins(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { reward: rewardId } = req.body as { reward: string }

    const reward = REWARDS[rewardId]

    if (!reward) {
      res.status(400).json({
        success: false,
        error: 'INVALID_REWARD',
        message: 'Invalid reward selected.',
      })
      return
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

    if (user.coins < reward.coinCost) {
      res.status(400).json({
        success: false,
        error: 'INSUFFICIENT_COINS',
        message: `You need ${reward.coinCost} coins but only have ${user.coins}.`,
      })
      return
    }

    let planExpiresAt: Date

    if (reward.action === 'pro_lifetime') {
      planExpiresAt = new Date(
        Date.now() + 100 * 365 * 24 * 60 * 60 * 1000
      )
    } else {
      const base =
        user.planExpiresAt && user.planExpiresAt > new Date()
          ? user.planExpiresAt
          : new Date()

      planExpiresAt = new Date(
        base.getTime() + reward.value * 24 * 60 * 60 * 1000
      )
    }

    const updated = await User.findByIdAndUpdate(
      user._id,
      {
        $inc: { coins: -reward.coinCost },
        $set: {
          plan: 'pro',
          planExpiresAt,
        },
      },
      { new: true }
    )

    await ReferralEvent.create({
      referralCode: user.referralCode,
      referrerId: user._id,
      type: 'redemption',
      coinsAwarded: 0,
      reward: rewardId,
      coinsCost: reward.coinCost,
    })

    res.status(200).json({
      success: true,
      data: {
        coins: updated?.coins,
        plan: updated?.plan,
        planExpiresAt: updated?.planExpiresAt,
        message: `${reward.label} unlocked successfully.`,
      },
    })
  } catch (error) {
    throw error
  }
}