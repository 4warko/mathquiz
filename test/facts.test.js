import test from 'node:test'
import assert from 'node:assert/strict'
import { FACTS } from '../src/facts.js'
import { LEVELS } from '../src/levels.js'

test('every animal friend has a non-trivial fun fact', () => {
  for (const lvl of LEVELS) {
    const name = lvl.unlock.name
    assert.ok(FACTS[name], `missing fact for ${name}`)
    assert.ok(FACTS[name].length > 5, `fact too short for ${name}`)
  }
})
