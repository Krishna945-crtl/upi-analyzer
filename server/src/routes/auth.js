// 🔐 auth routes — register + login (FastAPI version laage same response shape)
const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { signToken } = require('../middleware/auth')
const wrap = require('../utils/asyncHandler')

const router = express.Router()
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const publicUser = u => ({ id: String(u._id), name: u.name, email: u.email })

router.post('/register', wrap(async (req, res) => {
  const { name, email, password } = req.body || {}

  if (!name?.trim() || !email || !password) {
    return res.status(422).json({ detail: 'Name, email and password are required.' })
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(422).json({ detail: 'Please enter a valid email.' })
  }

  const exists = await User.exists({ email: email.toLowerCase().trim() })
  if (exists) {
    return res.status(400).json({ detail: 'Email already registered. Please login.' })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, password: hashed })

  res.status(201).json({
    message: 'Account created successfully!',
    token: signToken(user),
    user: publicUser(user),
  })
}))

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body || {}
  const user = email && await User.findOne({ email: String(email).toLowerCase().trim() })

  // 🤐 email unda leda cheppakudadu — same message rendu cases ki
  if (!user || !password || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ detail: 'Invalid email or password.' })
  }

  res.json({
    message: 'Login successful!',
    token: signToken(user),
    user: publicUser(user),
  })
}))

module.exports = router
