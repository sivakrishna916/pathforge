// server/src/models/User.js
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },

  // Segment is the core filter — everything in the app pivots on this
  segment:  {
    type: String,
    enum: ['10th', 'inter_mpc', 'inter_bipc', 'degree', 'dropout', 'working'],
    required: true
  },

  savedStories:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
  savedPaths:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Path' }],
  upvotedStories:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],

  avatar:     { type: String },  // Cloudinary URL
  isVerified: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('User', userSchema)