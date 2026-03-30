// server/src/seeds/questions.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Question from '../models/Question.js'

dotenv.config()

const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
const questions = [
  {
    order: 1,
    text: "Your group project is due tomorrow. What do you naturally end up doing?",
    options: [
      { text: "Breaking tasks into a plan and tracking progress",
        scores: { analytical: 3, practical: 1 } },
      { text: "Designing the presentation and making it look great",
        scores: { creative: 3, academic: 1 } },
      { text: "Coordinating everyone and resolving conflicts",
        scores: { social: 3, practical: 1 } },
      { text: "Actually building or coding the deliverable",
        scores: { practical: 3, analytical: 1 } },
    ]
  },
  {
    order: 2,
    text: "You have a free weekend with no plans. What do you end up doing?",
    options: [
      { text: "Learning something new — a course, book, or topic",
        scores: { academic: 3, analytical: 1 } },
      { text: "Making something — art, music, writing, a side project",
        scores: { creative: 3, practical: 1 } },
      { text: "Hanging out with people or organizing something social",
        scores: { social: 3 } },
      { text: "Fixing, building, or improving something around you",
        scores: { practical: 3, analytical: 1 } },
    ]
  },
  {
    order: 3,
    text: "A friend is upset about a problem. What's your first response?",
    options: [
      { text: "Try to understand the root cause and suggest a solution",
        scores: { analytical: 3, academic: 1 } },
      { text: "Help them see the situation from a new angle",
        scores: { creative: 2, social: 2 } },
      { text: "Just listen and make them feel heard",
        scores: { social: 3 } },
      { text: "Help them take a concrete next step immediately",
        scores: { practical: 3, social: 1 } },
    ]
  },
  {
    order: 4,
    text: "You have to explain a complex topic to someone. How do you do it?",
    options: [
      { text: "Break it into logical steps and explain each one",
        scores: { analytical: 3, academic: 2 } },
      { text: "Draw it, use a metaphor, or tell a story",
        scores: { creative: 3, social: 1 } },
      { text: "Have a conversation and adjust based on their questions",
        scores: { social: 3, academic: 1 } },
      { text: "Show a working example first, explain theory later",
        scores: { practical: 3, analytical: 1 } },
    ]
  },
  {
    order: 5,
    text: "You discover a bug in something you built. What's your reaction?",
    options: [
      { text: "Dig into it systematically until you find the exact cause",
        scores: { analytical: 3, academic: 1 } },
      { text: "Try a completely different approach to solve it",
        scores: { creative: 3, practical: 1 } },
      { text: "Ask someone else or look for help from the community",
        scores: { social: 2, practical: 1 } },
      { text: "Try quick fixes until something works",
        scores: { practical: 3 } },
    ]
  },
  {
    order: 6,
    text: "Which school subject did you actually enjoy, not just score in?",
    options: [
      { text: "Maths or Physics — the logic felt satisfying",
        scores: { analytical: 3, academic: 2 } },
      { text: "Art, English, or anything with room to express",
        scores: { creative: 3, academic: 1 } },
      { text: "History, Civics, or group discussions",
        scores: { social: 2, academic: 2 } },
      { text: "Lab work, sports, or anything hands-on",
        scores: { practical: 3, analytical: 1 } },
    ]
  },
  {
    order: 7,
    text: "Someone gives you a task with zero instructions. What do you do?",
    options: [
      { text: "Research until you understand it fully before starting",
        scores: { academic: 3, analytical: 2 } },
      { text: "Interpret it your own way and start creating",
        scores: { creative: 3, practical: 1 } },
      { text: "Talk to people who've done it before",
        scores: { social: 3, analytical: 1 } },
      { text: "Just start doing something and figure it out along the way",
        scores: { practical: 3, creative: 1 } },
    ]
  },
  {
    order: 8,
    text: "What kind of achievement makes you feel most proud?",
    options: [
      { text: "Solving a hard problem nobody else could crack",
        scores: { analytical: 3, academic: 2 } },
      { text: "Creating something people genuinely like or use",
        scores: { creative: 3, practical: 2 } },
      { text: "Helping someone get through something difficult",
        scores: { social: 3, academic: 1 } },
      { text: "Finishing something and seeing it work in the real world",
        scores: { practical: 3, analytical: 1 } },
    ]
  },
  {
    order: 9,
    text: "You have to pick a project for a competition. Which do you choose?",
    options: [
      { text: "A research paper or data-driven analysis",
        scores: { academic: 3, analytical: 2 } },
      { text: "A creative campaign, short film, or design project",
        scores: { creative: 3, social: 1 } },
      { text: "An initiative that helps a community or social cause",
        scores: { social: 3, practical: 1 } },
      { text: "Building a working product or prototype",
        scores: { practical: 3, creative: 1 } },
    ]
  },
  {
    order: 10,
    text: "Ten years from now, what does your ideal workday look like?",
    options: [
      { text: "Deep focused work — research, analysis, problem solving",
        scores: { analytical: 3, academic: 2 } },
      { text: "Making things — designing, writing, building, directing",
        scores: { creative: 3, practical: 1 } },
      { text: "Working with people — meetings, mentoring, collaborating",
        scores: { social: 3, academic: 1 } },
      { text: "Running something — seeing my decisions create results",
        scores: { practical: 3, social: 1 } },
    ]
  },
]
await Question.deleteMany({})
    await Question.insertMany(
      questions.map(q => ({ ...q, isActive: true, segment: null }))
    )

    console.log('10 questions seeded')
    process.exit()
  } catch (error) {
    console.error('Seeding error:', error)
    process.exit(1)
  }
}

seedQuestions()