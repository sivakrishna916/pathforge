// server/src/routes/quiz.js
import express from 'express'
import { submitQuiz, getQuestions, getMyResults } from '../controllers/quizController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/questions', getQuestions)           // public — no auth needed
router.post('/submit', protect, submitQuiz)      // must be logged in
router.get('/my-results', protect, getMyResults) // quiz history

export default router