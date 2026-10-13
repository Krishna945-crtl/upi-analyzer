// 💸 Transaction model — prathi user statement rows ikkada save avutayi
const mongoose = require('mongoose')

const txnSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date:        { type: String, required: true },  // statement lo unna laage
    month:       { type: String, default: null },   // "2026-03" — monthly trend kosam
    description: { type: String, default: 'Unknown' },
    debit:       { type: Number, default: 0, min: 0 },
    credit:      { type: Number, default: 0, min: 0 },
    category:    { type: String, default: 'Others' },
    type:        { type: String, enum: ['Debit', 'Credit'], default: 'Debit' },
    source:      { type: String, default: '' },     // upload chesina file name
  },
  { timestamps: true }
)

// ⚡ user + month meeda queries ekkuva — index pettam
txnSchema.index({ user: 1, month: 1 })
txnSchema.index({ user: 1, category: 1 })

module.exports = mongoose.model('Transaction', txnSchema)
