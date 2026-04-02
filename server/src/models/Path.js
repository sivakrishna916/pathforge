// server/src/models/Path.js
import mongoose from 'mongoose'
const pathSchema = new mongoose.Schema({
  title:       { type: String, required: true },   // "BSc Computer Science"
  cluster:     { type: String, required: true },   // "engineering"
  description: { type: String, required: true },
  eligibleSegments: [{
    type: String,
    enum: ['10th', 'inter_mpc', 'inter_bipc', 'degree', 'dropout', 'working']
  }],
  entryRequirements: String,   // "Needs BiPC with PCM bridge course"
  averageSalary:     String,
  timeToEntry:       String,   // "2-4 years"
  difficulty:        { type: String, enum: ['low', 'medium', 'high'] },
  image:             String,
  isActive:          { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Path', pathSchema)