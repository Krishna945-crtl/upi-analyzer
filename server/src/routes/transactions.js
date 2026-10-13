// 💸 transaction routes — statement save, list, summary (MongoDB aggregation)
const express = require('express')
const mongoose = require('mongoose')
const Transaction = require('../models/Transaction')
const { requireAuth } = require('../middleware/auth')
const toMonth = require('../utils/month')
const wrap = require('../utils/asyncHandler')

const router = express.Router()
router.use(requireAuth) // 🛡️ anni routes login tho ne

const MAX_ROWS = 5000
const num = v => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : 0)

// 💾 POST /transactions — kotha statement upload chesthe paatha data replace
router.post('/', wrap(async (req, res) => {
  const { fileName = '', transactions } = req.body || {}

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.status(422).json({ detail: 'No transactions to save.' })
  }
  if (transactions.length > MAX_ROWS) {
    return res.status(413).json({ detail: `Max ${MAX_ROWS} transactions per statement.` })
  }

  const docs = transactions
    .filter(t => t && String(t.date || '').trim())
    .map(t => {
      const debit = num(t.debit)
      return {
        user: req.userId,
        date: String(t.date).trim(),
        month: toMonth(t.date),
        description: String(t.description || 'Unknown').trim().slice(0, 300),
        debit,
        credit: num(t.credit),
        category: String(t.category || 'Others').trim().slice(0, 40),
        type: debit > 0 ? 'Debit' : 'Credit',
        source: String(fileName).slice(0, 120),
      }
    })

  if (!docs.length) {
    return res.status(422).json({ detail: 'No valid rows — every row needs a date.' })
  }

  await Transaction.deleteMany({ user: req.userId })
  await Transaction.insertMany(docs)

  res.status(201).json({ message: `${docs.length} transactions saved!`, saved: docs.length })
}))

// 📋 GET /transactions?category=Food&type=Debit&q=swiggy
router.get('/', wrap(async (req, res) => {
  const filter = { user: req.userId }
  const { category, type, q } = req.query

  if (category && category !== 'All') filter.category = String(category)
  if (type === 'Debit' || type === 'Credit') filter.type = type
  if (q) {
    const safe = String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // regex injection block
    filter.description = { $regex: safe, $options: 'i' }
  }

  const rows = await Transaction.find(filter).sort({ _id: 1 }).lean()

  res.json({
    fileName: rows[0]?.source || '',
    transactions: rows.map((t, i) => ({
      id: i,
      date: t.date,
      description: t.description,
      debit: t.debit,
      credit: t.credit,
      category: t.category,
      type: t.type,
    })),
  })
}))

// 📊 GET /transactions/summary — heavy lifting MongoDB aggregation pipeline chestundi
router.get('/summary', wrap(async (req, res) => {
  const user = new mongoose.Types.ObjectId(String(req.userId))

  const [totals, byCategory, byMonth] = await Promise.all([
    Transaction.aggregate([
      { $match: { user } },
      { $group: { _id: null, spent: { $sum: '$debit' }, received: { $sum: '$credit' }, count: { $sum: 1 } } },
    ]),
    Transaction.aggregate([
      { $match: { user, debit: { $gt: 0 } } },
      { $group: { _id: '$category', spent: { $sum: '$debit' }, count: { $sum: 1 } } },
      { $sort: { spent: -1 } },
    ]),
    Transaction.aggregate([
      { $match: { user, month: { $ne: null } } },
      { $group: { _id: '$month', spent: { $sum: '$debit' }, received: { $sum: '$credit' } } },
      { $sort: { _id: 1 } },
    ]),
  ])

  const t = totals[0] || { spent: 0, received: 0, count: 0 }
  const round = n => Math.round(n * 100) / 100

  res.json({
    totalSpent: round(t.spent),
    totalReceived: round(t.received),
    txnCount: t.count,
    avgSpend: t.count ? round(t.spent / t.count) : 0,
    byCategory: byCategory.map(c => ({ category: c._id, spent: round(c.spent), count: c.count })),
    byMonth: byMonth.map(m => ({ month: m._id, spent: round(m.spent), received: round(m.received) })),
  })
}))

// 🗑️ DELETE /transactions — user data clear
router.delete('/', wrap(async (req, res) => {
  const { deletedCount } = await Transaction.deleteMany({ user: req.userId })
  res.json({ message: 'Statement data cleared.', deleted: deletedCount })
}))

module.exports = router
