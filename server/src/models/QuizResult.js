// server/src/models/QuizResult.js
import mongoose from "mongoose";
const quizResultSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Raw answers — always save this, you may want to retrain later
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: Number,  // 0-3 index
  }],

  // The scoring engine output (your algorithm)
  traitScores: {
    analytical: { type: Number, default: 0 },
    creative:   { type: Number, default: 0 },
    social:     { type: Number, default: 0 },
    practical:  { type: Number, default: 0 },
    academic:   { type: Number, default: 0 },
  },

  dominantTrait:  String,   // "analytical"
  careerCluster:  String,   // "engineering", "design", "healthcare"...
  recommendedPaths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Path' }],

  takenAt: { type: Date, default: Date.now }
}, { timestamps: true })

export default mongoose.model('QuizResult', quizResultSchema)