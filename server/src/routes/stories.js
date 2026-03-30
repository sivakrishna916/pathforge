// server/src/routes/stories.js
import express from 'express'
import {
  submitStory,
  getFeed,
  getStoryById,
  upvoteStory,
  saveStory,
  getAdminStories,
  reviewStory,
} from '../controllers/storyController.js'
import { protect } from '../middleware/authMiddleware.js'
import { adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()
// Public
router.get('/feed', getFeed)

// Admin routes (must come before :id)
router.get('/admin/all', protect, adminOnly, getAdminStories)
router.patch('/admin/:id/review', protect, adminOnly, reviewStory)

// Dynamic route MUST be last
router.get('/:id', getStoryById)

// User actions
router.post('/', protect, submitStory)
router.patch('/:id/upvote', protect, upvoteStory)
router.patch('/:id/save', protect, saveStory)
export default router