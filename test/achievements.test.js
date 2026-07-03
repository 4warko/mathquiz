import test from 'node:test'
import assert from 'node:assert/strict'
import { ACHIEVEMENTS, achievementCtx, unlockedIds } from '../src/achievements.js'
import { LEVELS, WORLD_SIZE } from '../src/levels.js'

test('empty state unlocks nothing', () => {
  const ctx = achievementCtx({ progress: {}, collected: [], stats: {} })
  assert.equal(ctx.friends, 0)
  assert.equal(ctx.worlds, 0)
  assert.deepEqual(unlockedIds(ctx), [])
})

test('finishing the first world counts one world and unlocks Explorer', () => {
  const progress = {}
  const collected = []
  for (let i = 1; i <= WORLD_SIZE; i++) { progress[i] = 3; collected.push(i) }
  const ctx = achievementCtx({ progress, collected, stats: {} })
  assert.equal(ctx.worlds, 1)
  assert.ok(unlockedIds(ctx).includes('explorer'))
})

test('a fully completed state unlocks every badge', () => {
  const progress = {}
  const collected = []
  for (let i = 1; i <= LEVELS.length; i++) { progress[i] = 3; collected.push(i) }
  const challenges = {}
  for (let w = 0; w < Math.ceil(LEVELS.length / WORLD_SIZE); w++) challenges[w] = 3
  const ctx = achievementCtx({ progress, collected, stats: { correct: 500, perfect: 20, practiceRounds: 10 }, challenges })
  assert.equal(unlockedIds(ctx).length, ACHIEVEMENTS.length)
})

test('every achievement has the required fields', () => {
  const ids = new Set()
  for (const a of ACHIEVEMENTS) {
    assert.ok(a.id && a.title && a.desc && a.icon, `missing field on ${a.id}`)
    assert.ok(Number.isFinite(a.target) && a.target > 0, `bad target on ${a.id}`)
    assert.equal(typeof a.value, 'function')
    assert.ok(!ids.has(a.id), `duplicate id ${a.id}`)
    ids.add(a.id)
  }
})
