// 👤 User model — register ayina users ikkada store avutaru
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // 🔒 hashed only, plain text kaadu
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
