import jwt from 'jsonwebtoken'
import User from '../models/User.js'

function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body

    if (!fullName?.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' })
    }
    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' })
    }
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' })
    }

    const user = await User.create({
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password
    })

    const token = generateToken(user._id)
    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' })
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const token = generateToken(user._id)
    return res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const me = async (req, res) => {
  return res.json({
    success: true,
    user: req.user
  })
}
