// 📅 month.js — bank date ni "YYYY-MM" ga marchadam (monthly chart kosam)
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

function toMonth(raw) {
  const s = String(raw || '').trim()
  let m

  // 2026-03-14
  if ((m = s.match(/^(\d{4})[-/](\d{1,2})[-/]\d{1,2}/))) return pack(m[1], m[2])

  // 14-03-2026 / 14/03/2026 (Indian banks DD-MM-YYYY vadataru)
  if ((m = s.match(/^\d{1,2}[-/.](\d{1,2})[-/.](\d{4})/))) return pack(m[2], m[1])

  // 14-Mar-2026 / 14 Mar 2026
  if ((m = s.match(/^\d{1,2}[-\s]([A-Za-z]{3})[A-Za-z]*[-\s,]+(\d{4})/))) {
    const idx = MONTHS.indexOf(m[1].toLowerCase())
    if (idx >= 0) return pack(m[2], idx + 1)
  }
  return null
}

function pack(year, month) {
  const mm = Number(month)
  if (mm < 1 || mm > 12) return null
  return `${year}-${String(mm).padStart(2, '0')}`
}

module.exports = toMonth
