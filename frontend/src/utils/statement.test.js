import { describe, expect, it } from 'vitest'
import { detectCategory, parseAmount, toTransactions } from './statement'

describe('detectCategory', () => {
  it('matches merchant keywords regardless of case', () => {
    expect(detectCategory('UPI/SWIGGY/Order 123')).toBe('Food')
    expect(detectCategory('uber trip')).toBe('Transport')
    expect(detectCategory('NETFLIX.COM')).toBe('Entertainment')
  })

  it('falls back to Others for unknown or empty text', () => {
    expect(detectCategory('random shop name')).toBe('Shopping')
    expect(detectCategory('xyz traders')).toBe('Others')
    expect(detectCategory(undefined)).toBe('Others')
  })
})

describe('parseAmount', () => {
  it('reads Indian-format amounts with commas', () => {
    expect(parseAmount('1,25,000.50')).toBe(125000.5)
  })

  it('treats empty or junk cells as zero', () => {
    expect(parseAmount('')).toBe(0)
    expect(parseAmount(null)).toBe(0)
    expect(parseAmount('N/A')).toBe(0)
  })
})

describe('toTransactions', () => {
  it('reads separate Debit and Credit columns', () => {
    const { transactions } = toTransactions([
      { Date: '01-03-2026', Narration: 'UPI/ZOMATO', Debit: '450', Credit: '' },
      { Date: '02-03-2026', Narration: 'NEFT SALARY', Debit: '', Credit: '25,000' },
    ])
    expect(transactions).toEqual([
      { id: 0, date: '01-03-2026', description: 'UPI/ZOMATO', debit: 450, credit: 0, category: 'Food', type: 'Debit' },
      { id: 1, date: '02-03-2026', description: 'NEFT SALARY', debit: 0, credit: 25000, category: 'Transfer', type: 'Credit' },
    ])
  })

  it('reads a single Amount column with (Dr)/(Cr) markers, Union Bank style', () => {
    const { transactions } = toTransactions([
      { Date: '05-03-2026', Remarks: 'UPIAB/AIRTEL', Amount: '1,199.00 (Dr)' },
      { Date: '06-03-2026', Remarks: 'UPIAR/REFUND', Amount: '300.00 (Cr)' },
    ])
    expect(transactions.map(t => [t.debit, t.credit, t.category])).toEqual([[1199, 0, 'Recharge'], [0, 300, 'Transfer']])
  })

  it('handles headers with stray spaces (bug found by this test)', () => {
    const { transactions } = toTransactions([{ ' Date ': '07-03-2026', ' Description': 'Apollo Pharmacy', 'Withdrawal ': '820' }])
    expect(transactions[0]).toMatchObject({ date: '07-03-2026', debit: 820, category: 'Health' })
  })

  it('skips rows without a date, such as opening-balance lines', () => {
    const { transactions } = toTransactions([
      { Date: '', Narration: 'Opening balance', Debit: '', Credit: '' },
      { Date: '08-03-2026', Narration: 'Rapido', Debit: '90', Credit: '' },
    ])
    expect(transactions).toHaveLength(1)
  })

  it('explains what went wrong for unusable files', () => {
    expect(toTransactions([])).toEqual({ error: 'CSV file is empty!' })
    expect(toTransactions([{ Narration: 'x', Debit: '1' }]).error).toMatch(/Date column is required/)
    expect(toTransactions([{ Date: '', Debit: '1' }]).error).toMatch(/No valid transactions/)
  })
})
