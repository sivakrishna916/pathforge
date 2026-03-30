// server/src/controllers/storyController.js
import Story from '../models/Story.js'
import User from '../models/User.js'
import { getRankedStoriesPipeline } from '../utils/aggregations.js'

// Submit a new story (goes to pending first)
export const submitStory = async (req, res) => {
  try {
    const { title, background, decision, outcome, regrets, segment, tags } = req.body

    const story = await Story.create({
      author: req.user._id,
      title,
      background,
      decision,
      outcome,
      regrets,
      segment,
      tags,
      status: 'pending',
    })

    res.status(201).json(story)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Ranked feed — this uses your aggregation pipeline
export const getFeed = async (req, res) => {
  try {
    const { segment, page = 1 } = req.query
    const limit = 10
    const skip = (page - 1) * limit

    const stories = await Story.aggregate(
      getRankedStoriesPipeline(segment, skip, limit)
    )

    // Total count for pagination (separate query, no skip/limit)
    const total = await Story.countDocuments({
      status: 'approved',
      ...(segment && segment !== 'all' ? { segment } : {})
    })

    res.json({
      stories,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate('author', 'name avatar segment')
    if (!story) return res.status(404).json({ message: 'Story not found' })
    res.json(story)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Toggle upvote — one user, one upvote
export const upvoteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
    if (!story) return res.status(404).json({ message: 'Story not found' })

    const userId = req.user._id
    const alreadyUpvoted = req.user.upvotedStories.includes(story._id)

    if (alreadyUpvoted) {
      // Remove upvote
      await Story.findByIdAndUpdate(story._id, { $inc: { upvotes: -1 } })
      await User.findByIdAndUpdate(userId, { $pull: { upvotedStories: story._id } })
      return res.json({ upvoted: false, upvotes: story.upvotes - 1 })
    }

    // Add upvote
    await Story.findByIdAndUpdate(story._id, { $inc: { upvotes: 1 } })
    await User.findByIdAndUpdate(userId, { $addToSet: { upvotedStories: story._id } })
    res.json({ upvoted: true, upvotes: story.upvotes + 1 })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Toggle save
export const saveStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
    if (!story) return res.status(404).json({ message: 'Story not found' })

    const userId = req.user._id
    const alreadySaved = req.user.savedStories.includes(story._id)

    if (alreadySaved) {
      await Story.findByIdAndUpdate(story._id, { $inc: { saves: -1 } })
      await User.findByIdAndUpdate(userId, { $pull: { savedStories: story._id } })
      return res.json({ saved: false })
    }

    await Story.findByIdAndUpdate(story._id, { $inc: { saves: 1 } })
    await User.findByIdAndUpdate(userId, { $addToSet: { savedStories: story._id } })
    res.json({ saved: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Admin — see all pending stories
export const getAdminStories = async (req, res) => {
  try {
    const { status = 'pending' } = req.query
    const stories = await Story
      .find({ status })
      .populate('author', 'name email segment')
      .sort({ createdAt: -1 })
    res.json(stories)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Admin — approve or reject
export const reviewStory = async (req, res) => {
  try {
    const { status } = req.body  // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Invalid status' })

    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!story) return res.status(404).json({ message: 'Story not found' })

    res.json(story)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}