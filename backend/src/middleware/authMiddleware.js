import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export default async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      })
    }

    req.user = user
    return next() // Hand off cleanly to your route controller

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      debug: error.message
    })
  }
} 
