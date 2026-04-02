// server/src/routes/stories.js
import express from 'express'
import User from '../models/User.js'
import Story from '../models/Story.js'
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

router.get('/saved', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('savedStories');
  res.json({ stories: user.savedStories });
});
router.get('/pending', protect, adminOnly, async (req, res) => {
  const stories = await Story.find({ status: 'pending' })
    .populate('author', 'name email')
    .sort({ createdAt: -1 });

  res.json({ stories });
});
// Dynamic route MUST be last
router.get('/:id', getStoryById)

// User actions
router.post('/', protect, submitStory)
router.patch('/:id/upvote', protect, upvoteStory)
router.patch('/:id/save', protect, saveStory)
export default router