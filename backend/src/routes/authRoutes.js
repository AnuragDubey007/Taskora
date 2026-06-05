import express from 'express'

import {
  signup,
  login,
  me
} from '../controllers/authController.js'

import auth from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/signup', signup)

router.post('/login', login)

router.get('/me', auth, me)

export default router