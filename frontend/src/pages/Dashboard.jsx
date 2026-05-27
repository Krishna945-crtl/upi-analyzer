import { useState, useMemo } from 'react'
import Papa from 'papaparse'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import useWindowSize from '../hooks/useWindowSize'

// 🏷️ Keywords tో auto-category detect cheyyadam
const CATEGORIES = {
  Food:          ['swiggy', 'zomato', 'hotel', 'restaurant', 'cafe', 'food', 'eat', 'pizza', 'burger', 'biryani'],
  Transport:     ['uber', 'ola', 'rapido', 'petrol', 'fuel', 'irctc', 'railway', 'bus', 'auto'],
  Shopping:      ['amazon', 'flipkart', 'myntra', 'meesho', 'shop', 'store', 'mart'],
  Recharge:      ['airtel', 'jio', 'vodafone', 'recharge', 'mobile', 'broadband'],
  Entertainment: ['netflix', 'hotstar', 'spotify', 'youtube', 'prime', 'zee5', 'cinema'],
  Health:        ['pharmacy', 'hospital', 'clinic', 'doctor', 'medicine', 'apollo', 'medplus'],
  Utilities:     ['electricity', 'water', 'gas', 'bill', 'bescom', 'tpcc'],
  Transfer:      ['upi', 'neft', 'imps', 'transfer', 'sent', 'paid'],
}

// 🎨 Pie chart colors
const PIE_COLORS = ['#22c55e','#16a34a','#4ade80','#86efac','#bbf7d0','#059669','#10b981','#34d399']

// 🔍 Category detect cheyyadam
function detectCategory(description) {
  const lower = (description || '').toLowerCase()
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(k => lower.includes(k))) return cat
  }
  return 'Others'
}

// 💰 Amount parse cheyyadam
function parseAmount(val) {
  if (!val) return 0
  return parseFloat(String(val).replace(/,/g, '')) || 0
}

function Dashboard() {
  const { theme, switchTheme, currentTheme } = useTheme()
  const { user, logout } = useAuth()
  const { isMobile } = useWindowSize() // 📱 mobile check

  const [transactions, setTransactions] = useState([])
  const [fileName, setFileName]         = useState('')
  const [error, setError]               = useState('')
  const [filterCat, setFilterCat]       = useState('All')
  const [filterType, setFilterType]     = useState('All')
  const [searchText, setSearchText]     = useState('')

  const isDark = theme.name === 'greenDark' || theme.name === 'blueDark'

  // 📂 CSV upload handle cheyyadam
  function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    setError('')

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data
        if (!rows.length) { setError('CSV file is empty!'); return }

        const cols      = Object.keys(rows[0]).map(c => c.trim())
        const dateCol   = cols.find(c => /date/i.test(c))
        const descCol   = cols.find(c => /desc|narration|particular|details|remarks/i.test(c))
        const debitCol  = cols.find(c => /^debit$/i.test(c) || /withdrawal/i.test(c))
        const creditCol = cols.find(c => /^credit$/i.test(c) || /deposit/i.test(c))
        const amountCol = cols.find(c => /^amount$/i.test(c))

        if (!dateCol) { setError('CSV format not recognized! Date column is required.'); return }

        const parsed = rows.map((row, i) => {
          let debit = 0, credit = 0

          if (amountCol && !debitCol) {
            const raw   = String(row[amountCol] || '').trim()
            const match = raw.match(/([\d,]+\.?\d*)\s*\((Dr|Cr)\)/i)
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
            date:        (row[dateCol] || '').trim(),
            description: (row[descCol] || 'Unknown').trim(),
            debit, credit,
            category: detectCategory(row[descCol]),
            type:     debit > 0 ? 'Debit' : 'Credit',
          }
        }).filter(t => t.date)

        if (!parsed.length) { setError('No valid transactions found in CSV!'); return }
        setTransactions(parsed)
      },
      error: () => setError('File parse failed. Please try again!'),
    })
  }

  // 📊 Summary data
  const summary = useMemo(() => {
    const totalSpent    = transactions.reduce((s, t) => s + t.debit, 0)
    const totalReceived = transactions.reduce((s, t) => s + t.credit, 0)
    const txnCount      = transactions.length
    const avgSpend      = txnCount > 0 ? totalSpent / txnCount : 0
    return { totalSpent, totalReceived, txnCount, avgSpend }
  }, [transactions])

  const categoryData = useMemo(() => {
    const map = {}
    transactions.filter(t => t.debit > 0).forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.debit
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
  }, [transactions])

  const monthlyData = useMemo(() => {
    const map = {}
    transactions.forEach(t => {
      const month = t.date.slice(0, 7)
      if (!map[month]) map[month] = { month, spent: 0, received: 0 }
      map[month].spent    += t.debit
      map[month].received += t.credit
    })
    return Object.values(map)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(m => ({ ...m, spent: Math.round(m.spent), received: Math.round(m.received) }))
  }, [transactions])

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const catOk    = filterCat  === 'All' || t.category === filterCat
      const typeOk   = filterType === 'All' || t.type === filterType
      const searchOk = t.description.toLowerCase().includes(searchText.toLowerCase())
      return catOk && typeOk && searchOk
    })
  }, [transactions, filterCat, filterType, searchText])

  const allCategories = ['All', ...Object.keys(CATEGORIES), 'Others']

  // 🎨 Styles — mobile responsive
  const S = {
    page: {
      minHeight: '100vh',
      backgroundColor: theme.bg,
      backgroundImage: `radial-gradient(ellipse 800px 500px at 50% 0%, ${theme.accent}10 0%, transparent 60%)`,
      padding: isMobile ? '1rem' : '1.5rem',
      color: theme.text,
    },

    // 🔝 Navbar — mobile lo stack cheyyadam
    nav: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      marginBottom: '1.5rem',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '10px' : '0',
    },

    navTitle: {
      fontSize: isMobile ? '1rem' : '1.25rem',
      fontWeight: '700',
      color: theme.text,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
    },

    // 🎨 Nav right side — mobile lo wrap cheyyadam
    navRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
    },

    logoutBtn: {
      padding: isMobile ? '5px 12px' : '6px 16px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '500',
      border: `0.5px solid ${theme.border}`,
      backgroundColor: 'transparent',
      color: theme.subtext,
      cursor: 'pointer',
    },

    uploadBox: {
      border: `1.5px dashed ${theme.accent}60`,
      borderRadius: '16px',
      padding: isMobile ? '1.5rem 1rem' : '2.5rem',
      textAlign: 'center',
      backgroundColor: `${theme.accent}08`,
      marginBottom: '1.5rem',
      cursor: 'pointer',
      width: '100%',
      boxSizing: 'border-box',
      display: 'block',
    },

    uploadIcon:  { fontSize: isMobile ? '2rem' : '2.5rem', marginBottom: '0.75rem' },

    uploadTitle: {
      fontSize: isMobile ? '0.9rem' : '1rem',
      fontWeight: '600',
      color: theme.text,
      margin: '0 0 6px',
    },

    uploadSub: {
      fontSize: '0.75rem',
      color: theme.subtext,
      margin: '0 0 1rem',
    },

    uploadBtn: {
      display: 'inline-block',
      padding: '8px 20px',
      borderRadius: '8px',
      fontSize: '0.85rem',
      fontWeight: '600',
      background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}bb)`,
      color: '#fff',
      cursor: 'pointer',
      border: 'none',
    },

    // 📊 Cards — mobile lo 2 columns
    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: isMobile ? '0.75rem' : '1rem',
      marginBottom: '1.5rem',
    },

    card: {
      backgroundColor: theme.cardBg,
      border: `0.5px solid ${theme.border}`,
      borderRadius: '14px',
      padding: isMobile ? '1rem' : '1.25rem',
    },

    cardLabel: {
      fontSize: '10px',
      fontWeight: '500',
      color: theme.subtext,
      textTransform: 'uppercase',
      letterSpacing: '0.4px',
      marginBottom: '6px',
    },

    cardValue: {
      fontSize: isMobile ? '1.2rem' : '1.5rem',
      fontWeight: '700',
      color: theme.text,
    },

    cardSub: {
      fontSize: '10px',
      color: theme.subtext,
      marginTop: '4px',
    },

    // 📈 Charts — mobile lo single column
    chartsGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem',
    },

    chartCard: {
      backgroundColor: theme.cardBg,
      border: `0.5px solid ${theme.border}`,
      borderRadius: '14px',
      padding: isMobile ? '1rem' : '1.25rem',
    },

    chartTitle: {
      fontSize: '12px',
      fontWeight: '600',
      color: theme.text,
      marginBottom: '1rem',
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
    },

    // 🔍 Filters — mobile lo vertical stack
    filtersRow: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginBottom: '1rem',
      alignItems: 'center',
      flexDirection: isMobile ? 'column' : 'row',
    },

    select: {
      padding: '7px 12px',
      borderRadius: '8px',
      fontSize: '13px',
      backgroundColor: theme.inputBg,
      color: theme.text,
      border: `0.5px solid ${theme.border}`,
      outline: 'none',
      cursor: 'pointer',
      width: isMobile ? '100%' : 'auto',
    },

    searchInput: {
      padding: '7px 12px',
      borderRadius: '8px',
      fontSize: isMobile ? '16px' : '13px',
      backgroundColor: theme.inputBg,
      color: theme.text,
      border: `0.5px solid ${theme.border}`,
      outline: 'none',
      width: isMobile ? '100%' : 'auto',
      flex: isMobile ? 'none' : 1,
      minWidth: isMobile ? 'none' : '180px',
      boxSizing: 'border-box',
    },

    tableWrap: {
      backgroundColor: theme.cardBg,
      border: `0.5px solid ${theme.border}`,
      borderRadius: '14px',
      overflow: isMobile ? 'auto' : 'hidden',
    },

    // 📋 Table — mobile lo scroll cheyyadam
    tableHeader: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '2fr 1fr 1fr' : '1.5fr 1fr 1fr 1fr 1fr',
      padding: '10px 12px',
      fontSize: '10px',
      fontWeight: '500',
      color: theme.subtext,
      textTransform: 'uppercase',
      letterSpacing: '0.4px',
      borderBottom: `0.5px solid ${theme.border}`,
      backgroundColor: `${theme.accent}08`,
      minWidth: isMobile ? '400px' : 'auto',
    },

    tableRow: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '2fr 1fr 1fr' : '1.5fr 1fr 1fr 1fr 1fr',
      padding: '10px 12px',
      fontSize: '12px',
      borderBottom: `0.5px solid ${theme.border}`,
      alignItems: 'center',
      minWidth: isMobile ? '400px' : 'auto',
    },

    catBadge: () => ({
      display: 'inline-block',
      padding: '2px 6px',
      borderRadius: '20px',
      fontSize: '10px',
      fontWeight: '500',
      background: `${theme.accent}20`,
      color: theme.accent,
    }),

    errorBox: {
      padding: '0.75rem 1rem',
      borderRadius: '10px',
      fontSize: '0.8rem',
      color: '#f87171',
      backgroundColor: isDark ? '#1a0505' : '#fff0f0',
      border: '0.5px solid #7f1d1d',
      marginBottom: '1rem',
    },

    emptyState: {
      textAlign: 'center',
      padding: '2rem',
      color: theme.subtext,
      fontSize: '0.875rem',
    },
  }

  return (
    <div style={S.page}>

      {/* 🔝 Navbar */}
      <div style={S.nav}>
        <div style={S.navTitle}>
          💸 UPI Analyzer
          {fileName && (
            <span style={{ fontSize: '11px', color: theme.subtext, fontWeight: '400' }}>
              — {fileName}
            </span>
          )}
        </div>

        <div style={S.navRight}>
          <span style={{ fontSize: '12px', color: theme.subtext }}>
            👤 {user?.name || 'User'}
          </span>
          <button
            onClick={() => switchTheme('light')}
            style={{
              ...S.logoutBtn,
              backgroundColor: currentTheme === 'light' ? theme.accent : 'transparent',
              color: currentTheme === 'light' ? '#fff' : theme.subtext,
              border: `0.5px solid ${theme.accent}`,
            }}
          >
            🍦 Light
          </button>
          <button
            onClick={() => switchTheme('greenDark')}
            style={{
              ...S.logoutBtn,
              backgroundColor: currentTheme === 'greenDark' ? theme.accent : 'transparent',
              color: currentTheme === 'greenDark' ? '#fff' : theme.subtext,
              border: `0.5px solid ${theme.accent}`,
            }}
          >
            🖤 Dark
          </button>
          <button style={S.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      {/* ❌ Error */}
      {error && <div style={S.errorBox}>{error}</div>}

      {/* 📂 Upload box */}
      {transactions.length === 0 && (
        <label style={S.uploadBox}>
          <div style={S.uploadIcon}>📂</div>
          <p style={S.uploadTitle}>Upload Your Bank Statement</p>
          <p style={S.uploadSub}>CSV format — SBI, HDFC, ICICI, Axis, Union Bank supported</p>
          <span style={S.uploadBtn}>Choose CSV File</span>
          <input type="file" accept=".csv" onChange={handleUpload} style={{ display: 'none' }} />
        </label>
      )}

      {/* 📊 Full dashboard */}
      {transactions.length > 0 && (
        <>
          {/* 🔄 Re-upload */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label style={{ ...S.uploadBtn, fontSize: '12px', padding: '6px 14px' }}>
              📂 Upload New File
              <input type="file" accept=".csv" onChange={handleUpload} style={{ display: 'none' }} />
            </label>
            <span style={{ fontSize: '12px', color: theme.subtext }}>
              {transactions.length} transactions loaded ✅
            </span>
          </div>

          {/* 📊 Summary cards */}
          <div style={S.cardsGrid}>
            <div style={S.card}>
              <div style={S.cardLabel}>💸 Total Spent</div>
              <div style={{ ...S.cardValue, color: '#f87171' }}>
                ₹{summary.totalSpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div style={S.cardSub}>All debit transactions</div>
            </div>
            <div style={S.card}>
              <div style={S.cardLabel}>💰 Total Received</div>
              <div style={{ ...S.cardValue, color: theme.accent }}>
                ₹{summary.totalReceived.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div style={S.cardSub}>All credit transactions</div>
            </div>
            <div style={S.card}>
              <div style={S.cardLabel}>🔢 Transactions</div>
              <div style={S.cardValue}>{summary.txnCount}</div>
              <div style={S.cardSub}>Total entries</div>
            </div>
            <div style={S.card}>
              <div style={S.cardLabel}>📈 Avg Spend</div>
              <div style={S.cardValue}>
                ₹{summary.avgSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div style={S.cardSub}>Per transaction</div>
            </div>
          </div>

          {/* 📈 Charts */}
          <div style={S.chartsGrid}>

            {/* 🥧 Pie chart */}
            <div style={S.chartCard}>
              <div style={S.chartTitle}>📊 Spending by Category</div>
              <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx={isMobile ? '50%' : '40%'}
                    cy="50%"
                    outerRadius={isMobile ? 70 : 90}
                    innerRadius={isMobile ? 35 : 50}
                    dataKey="value"
                    labelLine={false}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                    contentStyle={{
                      backgroundColor: theme.cardBg,
                      border: `0.5px solid ${theme.border}`,
                      borderRadius: '8px',
                      color: theme.text,
                    }}
                  />
                  {!isMobile && (
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      iconType="circle"
                      iconSize={8}
                      formatter={(value, entry) =>
                        `${value} — ₹${entry.payload.value.toLocaleString('en-IN')}`
                      }
                      wrapperStyle={{ fontSize: '11px', color: theme.text, lineHeight: '22px' }}
                    />
                  )}
                  {isMobile && <Legend wrapperStyle={{ fontSize: '10px', color: theme.text }} />}
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 📅 Line chart */}
            <div style={S.chartCard}>
              <div style={S.chartTitle}>📅 Monthly Trends</div>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: theme.subtext }} />
                  <YAxis tick={{ fontSize: 10, fill: theme.subtext }} width={50} />
                  <Tooltip
                    formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                    contentStyle={{
                      backgroundColor: theme.cardBg,
                      border: `0.5px solid ${theme.border}`,
                      borderRadius: '8px',
                      color: theme.text,
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="spent"    stroke="#f87171" strokeWidth={2} dot={false} name="Spent" />
                  <Line type="monotone" dataKey="received" stroke={theme.accent} strokeWidth={2} dot={false} name="Received" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 📊 Bar chart */}
            <div style={{ ...S.chartCard, gridColumn: isMobile ? '1' : '1 / -1' }}>
              <div style={S.chartTitle}>📊 Category Breakdown</div>
              <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: theme.subtext }} />
                  <YAxis tick={{ fontSize: 10, fill: theme.subtext }} width={50} />
                  <Tooltip
                    formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                    contentStyle={{
                      backgroundColor: theme.cardBg,
                      border: `0.5px solid ${theme.border}`,
                      borderRadius: '8px',
                      color: theme.text,
                    }}
                  />
                  <Bar dataKey="value" fill={theme.accent} radius={[6, 6, 0, 0]} name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* 🔍 Filters */}
          <div style={S.filtersRow}>
            <input
              type="text"
              placeholder="🔍 Search transactions..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={S.searchInput}
            />
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={S.select}>
              {allCategories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} style={S.select}>
              <option>All</option>
              <option>Debit</option>
              <option>Credit</option>
            </select>
          </div>

          {/* 📋 Table */}
          <div style={S.tableWrap}>
            <div style={{ overflowX: isMobile ? 'auto' : 'visible' }}>
              <div style={S.tableHeader}>
                <span>Description</span>
                <span>Date</span>
                {!isMobile && <span>Category</span>}
                <span>Debit</span>
                {!isMobile && <span>Credit</span>}
              </div>

              {filtered.length === 0 ? (
                <div style={S.emptyState}>No transactions found 🔍</div>
              ) : (
                filtered.slice(0, 100).map(t => (
                  <div key={t.id} style={S.tableRow}>
                    <span style={{ color: theme.text, fontSize: '11px' }} title={t.description}>
                      {t.description.slice(0, isMobile ? 20 : 35)}{t.description.length > (isMobile ? 20 : 35) ? '...' : ''}
                    </span>
                    <span style={{ color: theme.subtext, fontSize: '11px' }}>{t.date}</span>
                    {!isMobile && <span><span style={S.catBadge()}>{t.category}</span></span>}
                    <span style={{ color: t.debit > 0 ? '#f87171' : theme.subtext, fontSize: '12px', fontWeight: '500' }}>
                      {t.debit > 0 ? `₹${t.debit.toLocaleString('en-IN')}` : '—'}
                    </span>
                    {!isMobile && (
                      <span style={{ color: t.credit > 0 ? theme.accent : theme.subtext, fontSize: '12px', fontWeight: '500' }}>
                        {t.credit > 0 ? `₹${t.credit.toLocaleString('en-IN')}` : '—'}
                      </span>
                    )}
                  </div>
                ))
              )}

              {filtered.length > 100 && (
                <div style={{ ...S.emptyState, padding: '1rem' }}>
                  Showing 100 of {filtered.length} transactions
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  )
}

export default Dashboard