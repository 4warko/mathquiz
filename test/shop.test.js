import test from 'node:test'
import assert from 'node:assert/strict'
import { HATS, hatEmoji } from '../src/shop.js'

test('hats are well-formed and uniquely identified', () => {
  assert.ok(HATS.length >= 4, 'shop should offer several hats')
  const ids = new Set()
  for (const h of HATS) {
    assert.equal(typeof h.id, 'string')
    assert.ok(h.id.length > 0)
    assert.equal(typeof h.emoji, 'string')
    assert.ok(h.emoji.length > 0)
    assert.equal(typeof h.name, 'string')
    assert.ok(h.name.length > 0)
    assert.ok(Number.isInteger(h.cost) && h.cost > 0, `bad cost for ${h.id}`)
    assert.ok(!ids.has(h.id), `duplicate id ${h.id}`)
    ids.add(h.id)
  }
})

test('costs ascend so the shop reads as a progression', () => {
  for (let i = 1; i < HATS.length; i++) {
    assert.ok(HATS[i].cost >= HATS[i - 1].cost, 'costs should not decrease')
  }
})

test('the full set stays attainable within a perfect playthrough', () => {
  const sum = HATS.reduce((a, h) => a + h.cost, 0)
  assert.ok(sum <= 120, `total cost ${sum} exceeds max earnable stars`)
})

test('hatEmoji resolves known ids and is null otherwise', () => {
  assert.equal(hatEmoji(HATS[0].id), HATS[0].emoji)
  assert.equal(hatEmoji('nope'), null)
  assert.equal(hatEmoji(null), null)
})
