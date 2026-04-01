import express from 'express'
import { submitQuiz, getQuestions, getMyResults } from '../controllers/quizController.js'
import { protect } from '../middleware/authMiddleware.js'
import QuizResult from '../models/QuizResult.js'

const router = express.Router()

router.get('/questions', getQuestions)
router.post('/submit', protect, submitQuiz)
router.get('/my-results', protect, getMyResults)
router.get('/history', protect, async (req, res) => {
  try {
    const results = await QuizResult.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch quiz history" });
  }
});

export default router