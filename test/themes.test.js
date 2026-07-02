import test from 'node:test'
import assert from 'node:assert/strict'
import { REWARD_THEMES, themeForStars } from '../src/themes.js'

test('themeForStars returns the highest unlocked theme', () => {
  assert.equal(themeForStars(0).id, 'confetti')
  assert.equal(themeForStars(24).id, 'confetti')
  assert.equal(themeForStars(25).id, 'starfall')
  assert.equal(themeForStars(60).id, 'blossom')
  assert.equal(themeForStars(9999).id, 'party')
  assert.equal(themeForStars(undefined).id, 'confetti')
})

test('reward themes ascend by threshold and are well-formed', () => {
  let prev = -1
  for (const t of REWARD_THEMES) {
    assert.ok(t.id && t.label && typeof t.at === 'number')
    assert.ok(t.at > prev, 'thresholds must ascend')
    prev = t.at
    if (t.kind === 'emoji') assert.ok(Array.isArray(t.pieces) && t.pieces.length > 0)
  }
})
