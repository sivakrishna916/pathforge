// server/src/index.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import quizRoutes from './routes/quiz.js'
import storyRoutes from './routes/stories.js'
dotenv.config()
connectDB()

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use('/api/quiz', quizRoutes)
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/stories', storyRoutes)

app.listen(process.env.PORT || 5000, () =>
  console.log('Server running'))