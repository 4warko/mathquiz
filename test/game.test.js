import test from 'node:test'
import assert from 'node:assert/strict'
import { rand, shuffle, genQuestions, genMixed, howToPlay, emojiSize } from '../src/game.js'
import { LEVELS } from '../src/levels.js'

test('rand stays within the inclusive range', () => {
  for (let i = 0; i < 2000; i++) {
    const v = rand(2, 7)
    assert.ok(v >= 2 && v <= 7, `rand out of range: ${v}`)
    assert.ok(Number.isInteger(v))
  }
})

test('shuffle preserves the multiset and does not mutate input', () => {
  const input = [1, 2, 3, 4, 5]
  const out = shuffle(input)
  assert.equal(out.length, input.length)
  assert.deepEqual([...out].sort((a, b) => a - b), input)
  assert.deepEqual(input, [1, 2, 3, 4, 5])
})

function validateChoices(q) {
  assert.equal(q.choices.length, 3, `expected 3 choices, got ${q.choices.length}`)
  assert.ok(q.choices.includes(q.answer), 'choices must include the answer')
  assert.equal(new Set(q.choices).size, 3, 'choices must be distinct')
  for (const c of q.choices) assert.ok(c >= 0, `negative choice: ${c}`)
}

function validate(q) {
  switch (q.kind) {
    case 'add':
      assert.equal(q.answer, q.a + q.b)
      assert.ok(q.a >= 1 && q.b >= 1)
      validateChoices(q)
      break
    case 'sub':
      assert.equal(q.answer, q.a - q.b)
      assert.ok(q.answer >= 0 && q.b >= 1)
      validateChoices(q)
      break
    case 'bond':
      assert.equal(q.a + q.answer, q.total)
      assert.ok(q.a >= 1 && q.answer >= 1)
      validateChoices(q)
      break
    case 'seq': {
      assert.equal(q.seq.length, 3)
      const step = q.seq[1] - q.seq[0]
      assert.equal(q.seq[2] - q.seq[1], step, 'sequence must be arithmetic')
      assert.equal(q.answer, q.seq[2] + step)
      validateChoices(q)
      break
    }
    case 'compare': {
      assert.ok(['A', 'B'].includes(q.answerSide))
      assert.notEqual(q.countA, q.countB, 'compare counts must differ')
      const more = q.countA > q.countB ? 'A' : 'B'
      const expected = q.want === 'more' ? more : more === 'A' ? 'B' : 'A'
      assert.equal(q.answerSide, expected, 'answerSide must match want')
      break
    }
    case 'ncompare': {
      assert.ok(['A', 'B'].includes(q.answerSide))
      assert.notEqual(q.numA, q.numB, 'ncompare numbers must differ')
      const more = q.numA > q.numB ? 'A' : 'B'
      const expected = q.want === 'more' ? more : more === 'A' ? 'B' : 'A'
      assert.equal(q.answerSide, expected, 'answerSide must match want')
      break
    }
    default:
      assert.fail(`unknown question kind: ${q.kind}`)
  }
}

test('every level generates 5 valid questions across the skill range', () => {
  for (const cfg of LEVELS) {
    for (let skill = -2; skill <= 3; skill++) {
      for (let iter = 0; iter < 60; iter++) {
        const qs = genQuestions(cfg, skill)
        assert.equal(qs.length, 5, `${cfg.name}: expected 5 questions`)
        for (const q of qs) validate(q)
      }
    }
  }
})

test('genMixed produces 5 valid questions drawn from a pool', () => {
  for (let skill = -2; skill <= 3; skill++) {
    for (let iter = 0; iter < 100; iter++) {
      const qs = genMixed(LEVELS, skill)
      assert.equal(qs.length, 5)
      for (const q of qs) validate(q)
    }
  }
})

test('howToPlay and emojiSize return usable strings for every level', () => {
  for (const cfg of LEVELS) {
    assert.equal(typeof howToPlay(cfg), 'string')
    assert.ok(howToPlay(cfg).length > 0)
  }
  for (const n of [1, 6, 12, 20]) {
    assert.equal(typeof emojiSize(n), 'string')
    assert.ok(emojiSize(n).length > 0)
  }
})
