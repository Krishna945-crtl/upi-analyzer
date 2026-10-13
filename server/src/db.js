// 🔌 db.js — MongoDB connection, oka sari connect chesthe chalu
const mongoose = require('mongoose')

async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI missing — .env file lo pettu')
  await mongoose.connect(uri)
  console.log('✅ MongoDB connected')
}

module.exports = connectDB
