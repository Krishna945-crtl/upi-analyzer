// 🧾 statement.js — CSV rows ni transactions ga marchadam (Dashboard nunchi bayataki teesam, test cheyyadaniki easy)

// 🏷️ Keywords tho auto-category detect cheyyadam
export const CATEGORIES = {
  Food:          ['swiggy', 'zomato', 'hotel', 'restaurant', 'cafe', 'food', 'eat', 'pizza', 'burger', 'biryani'],
  Transport:     ['uber', 'ola', 'rapido', 'petrol', 'fuel', 'irctc', 'railway', 'bus', 'auto'],
  Shopping:      ['amazon', 'flipkart', 'myntra', 'meesho', 'shop', 'store', 'mart'],
  Recharge:      ['airtel', 'jio', 'vodafone', 'recharge', 'mobile', 'broadband'],
  Entertainment: ['netflix', 'hotstar', 'spotify', 'youtube', 'prime', 'zee5', 'cinema'],
  Health:        ['pharmacy', 'hospital', 'clinic', 'doctor', 'medicine', 'apollo', 'medplus'],
  Utilities:     ['electricity', 'water', 'gas', 'bill', 'bescom', 'tpcc'],
  Transfer:      ['upi', 'neft', 'imps', 'transfer', 'sent', 'paid'],
}

export function detectCategory(description) {
  const lower = (description || '').toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(k => lower.includes(k))) return cat
  }
  return 'Others'
}

export function parseAmount(val) {
  if (!val) return 0
  return parseFloat(String(val).replace(/,/g, '')) || 0
}

// 🔄 Papa.parse rows → { transactions } or { error }
export function toTransactions(rows) {
  if (!rows?.length) return { error: 'CSV file is empty!' }

  // headers lo spaces unte (" Date ") match avvadu — keys trim cheyyadam
  const clean = rows.map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k.trim(), v])))
  const cols      = Object.keys(clean[0])
  const dateCol   = cols.find(c => /date/i.test(c))
  const descCol   = cols.find(c => /desc|narration|particular|details|remarks/i.test(c))
  const debitCol  = cols.find(c => /^debit$/i.test(c) || /withdrawal/i.test(c))
  const creditCol = cols.find(c => /^credit$/i.test(c) || /deposit/i.test(c))
  const amountCol = cols.find(c => /^amount$/i.test(c))

  if (!dateCol) return { error: 'CSV format not recognized! Date column is required.' }

  const transactions = clean.map((row, i) => {
    let debit = 0, credit = 0

    if (amountCol && !debitCol) {
      // Union Bank style: "1,250.00 (Dr)" / "500.00 (Cr)"
      const match = String(row[amountCol] || '').trim().match(/([\d,]+\.?\d*)\s*\((Dr|Cr)\)/i)
      if (match) {
        const amt = parseFloat(match[1].replace(/,/g, ''))
        if (match[2].toLowerCase() === 'dr') debit = amt
        else credit = amt
      }
    } else {
      debit  = parseAmount(row[debitCol])
      credit = parseAmount(row[creditCol])
    }

    return {
      id: i,
      date:        String(row[dateCol] || '').trim(),
      description: String(row[descCol] || 'Unknown').trim(),
      debit, credit,
      category: detectCategory(row[descCol]),
      type:     debit > 0 ? 'Debit' : 'Credit',
    }
  }).filter(t => t.date)

  if (!transactions.length) return { error: 'No valid transactions found in CSV!' }
  return { transactions }
}
