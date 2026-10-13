// 🚀 server.js — .env load chesi, DB connect chesi, server start cheyyadam
require('dotenv').config()
const app = require('./app')
const connectDB = require('./db')

const PORT = process.env.PORT || 8000

connectDB(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`🚀 UPI Analyzer API on port ${PORT}`)))
  .catch(err => {
    console.error('❌ DB connect failed:', err.message)
    process.exit(1)
  })
