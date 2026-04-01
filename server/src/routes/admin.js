import express from 'express'
import { protect, adminOnly } from '../middleware/authMiddleware.js'
import User from '../models/User.js'
import Story from '../models/Story.js'
import QuizResult from '../models/QuizResult.js'

const router = express.Router()

router.get('/analytics', protect, adminOnly, async (req, res) => {
  const [totalUsers, totalApproved, totalPending, totalQuizAttempts] = await Promise.all([
    User.countDocuments(),
    Story.countDocuments({ status: 'approved' }),
    Story.countDocuments({ status: 'pending' }),
    QuizResult.countDocuments(),
  ])

  const bySegment = await Story.aggregate([
    { $match: { status: 'approved' } },
    { $group: { _id: '$segment', count: { $sum: 1 } } }
  ])

  const storiesBySegment = Object.fromEntries(
    bySegment.map(s => [s._id, s.count])
  )

  res.json({
    totalUsers,
    totalApproved,
    totalPending,
    totalQuizAttempts,
    storiesBySegment
  })
})

export default router