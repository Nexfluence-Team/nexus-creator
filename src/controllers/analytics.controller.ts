import { Response } from 'express'
import { AuthRequest } from '../types'
import ProfileView from '../models/ProfileView.model'
import InboxMessage from '../models/InboxMessage.model'
import Video from '../models/Video.model'

// ── GET /analytics/overview ───────────────────────────────────────
export async function getOverview(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.user?._id

    const now       = new Date()
    const last7days = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000)
    const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Run all queries in parallel
    const [
      totalViews,
      viewsLast7,
      viewsLast30,
      uniqueVisitors,
      totalMessages,
      totalInquiries,
      unreadMessages,
      videoCount,
    ] = await Promise.all([
      // Total profile views all time
      ProfileView.countDocuments({ profileUserId: userId }),

      // Views in last 7 days
      ProfileView.countDocuments({
        profileUserId: userId,
        viewedAt:      { $gte: last7days },
      }),

      // Views in last 30 days
      ProfileView.countDocuments({
        profileUserId: userId,
        viewedAt:      { $gte: last30days },
      }),

      // Unique visitors all time by distinct visitorIp
      ProfileView.distinct('visitorIp', { profileUserId: userId }).then(
        (ips) => ips.length
      ),

      // Total messages received
      InboxMessage.countDocuments({
        recipientUserId: userId,
        type:            'message',
      }),

      // Total inquiries received
      InboxMessage.countDocuments({
        recipientUserId: userId,
        type:            'inquiry',
      }),

      // Unread messages
      InboxMessage.countDocuments({
        recipientUserId: userId,
        read:            false,
      }),

      // Total videos
      Video.countDocuments({ userId }),
    ])

    // Top referrers
    const topReferrers = await ProfileView.aggregate([
      {
        $match: {
          profileUserId: userId,
          referrer:      { $ne: '' },
        },
      },
      {
        $group: {
          _id:   '$referrer',
          count: { $sum: 1 },
        },
      },
      { $sort:  { count: -1 } },
      { $limit: 5 },
      {
        $project: {
          referrer: '$_id',
          count:    1,
          _id:      0,
        },
      },
    ])

    res.status(200).json({
      success: true,
      data: {
        views: {
          total:   totalViews,
          last7:   viewsLast7,
          last30:  viewsLast30,
          unique:  uniqueVisitors,
        },
        inbox: {
          messages:  totalMessages,
          inquiries: totalInquiries,
          unread:    unreadMessages,
        },
        content: {
          videos: videoCount,
        },
        topReferrers,
      },
    })
  } catch (error) {
    throw error
  }
}

// ── GET /analytics/views — daily breakdown ────────────────────────
export async function getViewsChart(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.user?._id

    // Default to last 30 days if no range provided
    const days  = parseInt(req.query.days as string) || 30
    const from  = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const dailyViews = await ProfileView.aggregate([
      {
        $match: {
          profileUserId: userId,
          viewedAt:      { $gte: from },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year:        '$viewedAt' },
            month: { $month:       '$viewedAt' },
            day:   { $dayOfMonth:  '$viewedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      {
        $project: {
          date: {
            $dateFromParts: {
              year:  '$_id.year',
              month: '$_id.month',
              day:   '$_id.day',
            },
          },
          count: 1,
          _id:   0,
        },
      },
    ])

    res.status(200).json({
      success: true,
      data: {
        days,
        from,
        chart: dailyViews,
      },
    })
  } catch (error) {
    throw error
  }
}