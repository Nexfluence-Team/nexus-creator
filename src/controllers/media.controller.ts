import { Response } from 'express'
import { AuthRequest } from '../types'
import Video from '../models/Video.model'
import {
  uploadProfilePic as uploadProfilePicToCloud,
  uploadThumbnail as uploadThumbnailToCloud,
} from '../lib/cloudinary'
import User from '../models/User.model'

// ── POST /media/upload — profile pic or thumbnail ─────────────────
export async function uploadFile(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error:   'NO_FILE',
        message: 'No file was uploaded.',
      })
      return
    }

    const userId = req.user?._id as string
    const type   = req.body.type as string

    let url: string

    if (type === 'thumbnail') {
      const videoId = req.body.videoId ?? Date.now().toString()
      url = await uploadThumbnailToCloud(req.file.buffer, userId, videoId)
    } else {
      // Default — profile picture
      url = await uploadProfilePicToCloud(req.file.buffer, userId)

      // Update user profilePicUrl automatically
      await User.findByIdAndUpdate(userId, { profilePicUrl: url })
    }

    res.status(200).json({
      success: true,
      data:    { url },
    })
  } catch (error) {
    throw error
  }
}

// ── GET /media/videos ─────────────────────────────────────────────
export async function getVideos(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const videos = await Video.find({ userId: req.user?._id }).sort({
      createdAt: -1,
    })

    res.status(200).json({
      success: true,
      data:    { videos },
    })
  } catch (error) {
    throw error
  }
}

// ── POST /media/videos ────────────────────────────────────────────
export async function createVideo(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { title, url, platform, category, views, thumbnailUrl } = req.body

    const video = await Video.create({
      userId: req.user?._id,
      title,
      url,
      platform,
      category,
      views,
      thumbnailUrl,
    })

    res.status(201).json({
      success: true,
      data:    { video },
    })
  } catch (error) {
    throw error
  }
}

// ── PUT /media/videos/:id ─────────────────────────────────────────
export async function updateVideo(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const video = await Video.findOneAndUpdate(
      {
        _id:    req.params.id,
        userId: req.user?._id,
      },
      { $set: req.body },
      { new: true }
    )

    if (!video) {
      res.status(404).json({
        success: false,
        error:   'VIDEO_NOT_FOUND',
        message: 'Video not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      data:    { video },
    })
  } catch (error) {
    throw error
  }
}

// ── DELETE /media/videos/:id ──────────────────────────────────────
export async function deleteVideo(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const video = await Video.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user?._id,
    })

    if (!video) {
      res.status(404).json({
        success: false,
        error:   'VIDEO_NOT_FOUND',
        message: 'Video not found.',
      })
      return
    }

    res.status(200).json({
      success: true,
      data:    { message: 'Video deleted.' },
    })
  } catch (error) {
    throw error
  }
}