const test = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/User')
const { startDB, clearDB, stopDB } = require('./helpers')

test.before(startDB)
test.beforeEach(clearDB)
test.after(stopDB)

const kittu = { name: 'Kittu', email: 'Kittu@Example.com', password: 'secret123' }

test('register returns token and user, password is hashed', async () => {
  const res = await request(app).post('/auth/register').send(kittu)
  assert.equal(res.status, 201)
  assert.ok(res.body.token)
  assert.deepEqual(Object.keys(res.body.user).sort(), ['email', 'id', 'name'])
  assert.equal(res.body.user.email, 'kittu@example.com')

  const saved = await User.findOne({ email: 'kittu@example.com' })
  assert.notEqual(saved.password, kittu.password)
})

test('duplicate email is blocked (case-insensitive)', async () => {
  await request(app).post('/auth/register').send(kittu)
  const res = await request(app).post('/auth/register').send({ ...kittu, email: 'KITTU@example.com' })
  assert.equal(res.status, 400)
  assert.match(res.body.detail, /already registered/)
})

test('bad register input gives 422', async () => {
  const res = await request(app).post('/auth/register').send({ name: 'A', email: 'not-an-email', password: 'x' })
  assert.equal(res.status, 422)
})

test('login works and wrong password fails with same message', async () => {
  await request(app).post('/auth/register').send(kittu)

  const ok = await request(app).post('/auth/login').send({ email: 'kittu@example.com', password: 'secret123' })
  assert.equal(ok.status, 200)
  assert.ok(ok.body.token)

  const bad = await request(app).post('/auth/login').send({ email: 'kittu@example.com', password: 'nope' })
  const ghost = await request(app).post('/auth/login').send({ email: 'ghost@example.com', password: 'nope' })
  assert.equal(bad.status, 401)
  assert.equal(ghost.status, 401)
  assert.equal(bad.body.detail, ghost.body.detail)
})
