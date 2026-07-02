import test from 'node:test'
import assert from 'node:assert/strict'
import { LEVELS, WORLD_SIZE } from '../src/levels.js'
import { HATS } from '../src/shop.js'
import {
  sumStars, starsForWrong, worldOf, isWorldDone, isPlayable,
  nextPlayableLevel, worldJustCompleted, walletOf, canBuyHat,
} from '../src/progress.js'

// Helper: mark every level of world w (0-based) complete with 3 stars.
const withWorld = (progress, w, stars = 3) => {
  const out = { ...progress }
  for (let i = 0; i < WORLD_SIZE; i++) out[w * WORLD_SIZE + i + 1] = stars
  return out
}
const allDone = () => { const p = {}; for (let n = 1; n <= LEVELS.length; n++) p[n] = 3; return p }

test('sumStars totals best-stars and tolerates junk', () => {
  assert.equal(sumStars({}), 0)
  assert.equal(sumStars({ 1: 3, 2: 2, 5: 1 }), 6)
  assert.equal(sumStars({ 1: 3, 2: undefined }), 3)
})

test('starsForWrong: 0 misses = 3, <=2 = 2, else 1', () => {
  assert.equal(starsForWrong(0), 3)
  assert.equal(starsForWrong(1), 2)
  assert.equal(starsForWrong(2), 2)
  assert.equal(starsForWrong(3), 1)
  assert.equal(starsForWrong(9), 1)
})

test('worldOf maps 1-based levels to 0-based worlds', () => {
  assert.equal(worldOf(1), 0)
  assert.equal(worldOf(WORLD_SIZE), 0)
  assert.equal(worldOf(WORLD_SIZE + 1), 1)
})

test('isWorldDone needs every level in the world, and false for empty worlds', () => {
  assert.equal(isWorldDone({}, 0), false)
  const partial = { 1: 3, 2: 3, 3: 3 } // world 0 needs level 4 too (WORLD_SIZE 4)
  assert.equal(isWorldDone(partial, 0), false)
  assert.equal(isWorldDone(withWorld({}, 0), 0), true)
  assert.equal(isWorldDone(allDone(), 9999), false) // no levels in a far world
})

test('isPlayable: first world always open, later worlds gate on the previous', () => {
  assert.equal(isPlayable({}, 1), true)
  assert.equal(isPlayable({}, WORLD_SIZE), true)
  assert.equal(isPlayable({}, WORLD_SIZE + 1), false) // world 1 locked until world 0 done
  assert.equal(isPlayable(withWorld({}, 0), WORLD_SIZE + 1), true)
})

test('nextPlayableLevel prefers forward, wraps to gaps, null when all done', () => {
  assert.equal(nextPlayableLevel({}, 1), 2) // fresh: next open unfinished after level 1
  const w0 = withWorld({}, 0)
  assert.equal(nextPlayableLevel(w0, WORLD_SIZE), WORLD_SIZE + 1) // finishing world 0 opens world 1
  // A gap earlier in an open world is found by wrapping.
  const gap = { 1: 3, 3: 3, 4: 3 } // level 2 missing, all in open world 0
  assert.equal(nextPlayableLevel(gap, 4), 2)
  assert.equal(nextPlayableLevel(allDone(), 1), null)
})

test('worldJustCompleted fires only on the completing clear', () => {
  const prev = { 1: 3, 2: 3, 3: 3 }
  const done = { ...prev, 4: 3 }
  assert.equal(worldJustCompleted(prev, done, 4), true)
  assert.equal(worldJustCompleted(done, done, 4), false) // already was done
  assert.equal(worldJustCompleted({ 1: 3 }, { 1: 3, 2: 3 }, 2), false) // still not done
})

test('walletOf clamps at zero and subtracts spent', () => {
  assert.equal(walletOf({ 1: 3, 2: 3 }, 2), 4)
  assert.equal(walletOf({ 1: 3 }, 5), 0) // never negative
  assert.equal(walletOf({}, 0), 0)
})

test('canBuyHat guards affordability, ownership, and unknown ids', () => {
  const item = HATS[0]
  const rich = withWorld({}, 0) // 12 stars
  assert.equal(canBuyHat(rich, 0, [], item.id), true)
  assert.equal(canBuyHat(rich, 0, [item.id], item.id), false) // already owned
  assert.equal(canBuyHat(rich, 12, [], item.id), false) // wallet 0, can't afford
  assert.equal(canBuyHat(rich, 0, [], 'not-a-hat'), false)
})
