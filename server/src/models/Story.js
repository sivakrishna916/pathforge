// server/src/models/Story.js
import mongoose from 'mongoose';
const storySchema = new mongoose.Schema({
  author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:   { type: String, required: true, maxlength: 120 },

  // The actual journey data
  background:  { type: String, required: true },  // "I was BiPC student..."
  decision:    { type: String, required: true },  // "I switched to BSc CS..."
  outcome:     { type: String, required: true },  // "Now at X company..."
  regrets:     { type: String },                  // optional — adds authenticity

  // This is what the aggregation pipeline reads
  upvotes:  { type: Number, default: 0 },
  saves:    { type: Number, default: 0 },

  // Filtering
  segment:  {
    type: String,
    enum: ['10th', 'inter_mpc', 'inter_bipc', 'degree', 'dropout', 'working'],
    required: true
  },
  relatedPaths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Path' }],
  tags: [String],  // e.g. ["career_switch", "no_jee", "self_taught"]

  // Admin workflow
  status:   { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  image:    { type: String },  // Cloudinary URL
}, { timestamps: true })

// Index for aggregation pipeline performance — add this
storySchema.index({ segment: 1, status: 1, createdAt: -1 })

export default mongoose.model('Story', storySchema)