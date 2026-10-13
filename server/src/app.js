// 🏗️ app.js — Express app, middlewares + routes anni ikkade connect avutayi
const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/auth')
const txnRoutes = require('./routes/transactions')

const origins = (process.env.CORS_ORIGINS || 'http://localhost:5173,https://upi-analyzer.vercel.app')
  .split(',')
  .map(o => o.trim())

const app = express()
app.use(cors({ origin: origins }))
app.use(express.json({ limit: '2mb' }))

// 🏠 health check
app.get('/', (req, res) => {
  res.json({ message: 'UPI Analyzer API running! 💸', status: 'ok' })
})

app.use('/auth', authRoutes)
app.use('/transactions', txnRoutes)

// ❓ route ledu
app.use((req, res) => res.status(404).json({ detail: 'Route not found' }))

// 💥 errors anni ikkade catch — FastAPI laage { detail } shape lo pampistam
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ detail: 'Statement too big. Max 2 MB.' })
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ detail: 'Invalid JSON body.' })
  }
  console.error(err)
  res.status(500).json({ detail: 'Something went wrong on the server.' })
})

module.exports = app
