import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    if (!req.headers.authorization?.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' })

    const token = req.headers.authorization.split(' ')[1]

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    req.user = user

    next()
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' })
  }
}

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Admin access only' })
  next()
}