const test = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const app = require('../src/app')
const { startDB, clearDB, stopDB } = require('./helpers')

test.before(startDB)
test.beforeEach(clearDB)
test.after(stopDB)

async function tokenFor(email) {
  const res = await request(app).post('/auth/register').send({ name: 'U', email, password: 'pass1234' })
  return res.body.token
}

const statement = [
  { date: '02-03-2026', description: 'UPI/SWIGGY/food', debit: 450, credit: 0, category: 'Food' },
  { date: '05-03-2026', description: 'UPI/ZOMATO/dinner', debit: 300.5, credit: 0, category: 'Food' },
  { date: '09-03-2026', description: 'UPI/UBER/ride', debit: 220, credit: 0, category: 'Travel' },
  { date: '01-04-2026', description: 'NEFT/SALARY', debit: 0, credit: 25000, category: 'Income' },
  { date: '03-04-2026', description: 'UPI/AMAZON/order', debit: 1299, credit: 0, category: 'Shopping' },
  { date: '', description: 'junk row without date', debit: 10, credit: 0 },
]

test('routes need a valid token', async () => {
  assert.equal((await request(app).get('/transactions')).status, 401)
  const res = await request(app).get('/transactions').set('Authorization', 'Bearer fake.token.here')
  assert.equal(res.status, 401)
})

test('save skips rows without date and list returns them in order', async () => {
  const token = await tokenFor('a@x.com')
  const save = await request(app).post('/transactions').set('Authorization', `Bearer ${token}`)
    .send({ fileName: 'march.csv', transactions: statement })
  assert.equal(save.status, 201)
  assert.equal(save.body.saved, 5)

  const list = await request(app).get('/transactions').set('Authorization', `Bearer ${token}`)
  assert.equal(list.body.fileName, 'march.csv')
  assert.equal(list.body.transactions.length, 5)
  assert.equal(list.body.transactions[0].description, 'UPI/SWIGGY/food')
  assert.equal(list.body.transactions[3].type, 'Credit')
})

test('filters by category, type and search text', async () => {
  const token = await tokenFor('b@x.com')
  const auth = { Authorization: `Bearer ${token}` }
  await request(app).post('/transactions').set(auth).send({ transactions: statement })

  const food = await request(app).get('/transactions?category=Food').set(auth)
  assert.equal(food.body.transactions.length, 2)

  const credit = await request(app).get('/transactions?type=Credit').set(auth)
  assert.equal(credit.body.transactions.length, 1)

  const search = await request(app).get('/transactions?q=uber').set(auth)
  assert.equal(search.body.transactions.length, 1)

  const regexTrick = await request(app).get('/transactions?q=.*').set(auth)
  assert.equal(regexTrick.body.transactions.length, 0) // .* literal ga treat avvali
})

test('summary uses aggregation for totals, categories and months', async () => {
  const token = await tokenFor('c@x.com')
  const auth = { Authorization: `Bearer ${token}` }
  await request(app).post('/transactions').set(auth).send({ transactions: statement })

  const { body } = await request(app).get('/transactions/summary').set(auth)
  assert.equal(body.totalSpent, 2269.5)
  assert.equal(body.totalReceived, 25000)
  assert.equal(body.txnCount, 5)
  assert.equal(body.avgSpend, 453.9)

  assert.deepEqual(body.byCategory, [
    { category: 'Shopping', spent: 1299, count: 1 },
    { category: 'Food', spent: 750.5, count: 2 },
    { category: 'Travel', spent: 220, count: 1 },
  ])
  assert.deepEqual(body.byMonth, [
    { month: '2026-03', spent: 970.5, received: 0 },
    { month: '2026-04', spent: 1299, received: 25000 },
  ])
})

test('users never see each other data, new upload replaces old', async () => {
  const t1 = await tokenFor('d@x.com')
  const t2 = await tokenFor('e@x.com')
  await request(app).post('/transactions').set('Authorization', `Bearer ${t1}`).send({ transactions: statement })

  const other = await request(app).get('/transactions').set('Authorization', `Bearer ${t2}`)
  assert.equal(other.body.transactions.length, 0)

  await request(app).post('/transactions').set('Authorization', `Bearer ${t1}`)
    .send({ transactions: [statement[0]] })
  const mine = await request(app).get('/transactions').set('Authorization', `Bearer ${t1}`)
  assert.equal(mine.body.transactions.length, 1)

  const del = await request(app).delete('/transactions').set('Authorization', `Bearer ${t1}`)
  assert.equal(del.body.deleted, 1)
})

test('empty or oversized uploads are rejected', async () => {
  const token = await tokenFor('f@x.com')
  const auth = { Authorization: `Bearer ${token}` }

  assert.equal((await request(app).post('/transactions').set(auth).send({ transactions: [] })).status, 422)
  const big = Array.from({ length: 5001 }, () => statement[0])
  assert.equal((await request(app).post('/transactions').set(auth).send({ transactions: big })).status, 413)
})
