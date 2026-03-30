// server/src/models/Question.js
import mongoose from "mongoose";
const questionSchema = new mongoose.Schema({
  text:    { type: String, required: true },
  context: String,  // Optional situation framing

  options: [{
    text: String,
    // This is your scoring engine — each option contributes to traits
    scores: {
      analytical: { type: Number, default: 0 },
      creative:   { type: Number, default: 0 },
      social:     { type: Number, default: 0 },
      practical:  { type: Number, default: 0 },
      academic:   { type: Number, default: 0 },
    }
  }],

  order:      Number,    // Display order
  isActive:   { type: Boolean, default: true },
  segment:    String,   // null = show to all, else filter
}, { timestamps: true })

export default mongoose.model('Question', questionSchema)