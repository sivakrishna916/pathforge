// server/src/seeds/stories.js
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Story from '../models/Story.js'
import User from '../models/User.js'

dotenv.config()
await mongoose.connect(process.env.MONGO_URI)

// Use your existing test user's id
const user = await User.findOne({ email: 't@t.com' })
if (!user) {
  console.log('User not found. Run register via /api/auth/register first.')
  process.exit()
}

await Story.deleteMany({})
await Story.insertMany([
  {
    author: user._id,
    title: 'BiPC to Software Engineer — no JEE, no regrets',
    background: 'I was a BiPC student who hated Biology but loved computers.',
    decision: 'I discovered BSc Computer Science does not need PCM. Applied through state counselling.',
    outcome: 'Graduated, learned MERN on my own, got placed at a Hyderabad startup.',
    regrets: 'Wish I had started building projects in first year itself.',
    segment: 'inter_bipc',
    tags: ['career_switch', 'no_jee', 'self_taught'],
    status: 'approved',
    upvotes: 42,
    saves: 18,
  },
  {
    author: user._id,
    title: 'Dropped out of BTech, built a business instead',
    background: 'Failed two semesters, parents were devastated.',
    decision: 'Took a digital marketing freelancing course, started getting clients in month 2.',
    outcome: 'Now run a small agency with 3 employees. Earn more than most of my batchmates.',
    regrets: 'Should have been honest with myself about college earlier.',
    segment: 'dropout',
    tags: ['entrepreneurship', 'freelancing', 'dropout'],
    status: 'approved',
    upvotes: 89,
    saves: 34,
  },
  {
    author: user._id,
    title: 'Working at 27, finally figured out what I actually want',
    background: 'Was in a data entry job for 3 years. Felt completely stuck.',
    decision: 'Took a free Python course on NPTEL, built 2 projects, applied for data analyst roles.',
    outcome: 'Got a data analyst role. Salary doubled. Work feels meaningful now.',
    regrets: 'None. Starting late is better than not starting.',
    segment: 'working',
    tags: ['upskilling', 'career_change', 'data'],
    status: 'approved',
    upvotes: 61,
    saves: 27,
  },
])
if (!user) {
  console.log("User not found. Create user first.");
  process.exit();
}
console.log('3 stories seeded')
process.exit()