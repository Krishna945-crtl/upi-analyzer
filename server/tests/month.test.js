const test = require('node:test')
const assert = require('node:assert')
const toMonth = require('../src/utils/month')

test('reads common Indian bank date formats', () => {
  assert.equal(toMonth('14-03-2026'), '2026-03')
  assert.equal(toMonth('05/11/2025'), '2025-11')
  assert.equal(toMonth('2026-01-31'), '2026-01')
  assert.equal(toMonth('07-Feb-2026'), '2026-02')
  assert.equal(toMonth('7 September 2025'), '2025-09')
  assert.equal(toMonth('14-03-2026 10:22:05'), '2026-03')
})

test('returns null for junk dates', () => {
  assert.equal(toMonth(''), null)
  assert.equal(toMonth('yesterday'), null)
  assert.equal(toMonth('14-13-2026'), null)
  assert.equal(toMonth('10-Xyz-2026'), null)
})
