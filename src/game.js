// Pure game logic. Presentation now lives in CSS (see App.css / tokens.css).

export const rand = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo

export const shuffle = (arr) => {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build three answer choices: the real answer plus two nearby distractors.
const makeChoices = (answer) => {
  const set = new Set([answer])
  let guard = 0
  while (set.size < 3 && guard++ < 60) {
    let d = answer + rand(-3, 3)
    if (d < 0) d = answer + rand(1, 3)
    if (d !== answer) set.add(d)
  }
  return shuffle([...set])
}

// Generate a single question for a given level config.
const genOne = (cfg) => {
  if (cfg.type === 'add') {
    const max = cfg.sumMax
    let a = rand(1, max - 1)
    let b = rand(1, Math.max(1, max - a))
    if (a + b > max) b = max - a
    if (b < 1) b = 1
    const answer = a + b
    return { kind: 'add', a, b, animal: cfg.animals[0], answer, choices: makeChoices(answer), prompt: 'How many altogether?' }
  }

  if (cfg.type === 'sub') {
    const a = rand(2, cfg.minMax)
    const b = rand(1, a)
    const answer = a - b
    return {
      kind: 'sub', a, b, animal: cfg.animals[0], answer, choices: makeChoices(answer),
      prompt: b + (b === 1 ? ' hops away. How many are left?' : ' hop away. How many are left?'),
    }
  }

  // compare
  const { lo, hi } = cfg
  let ca = rand(lo, hi)
  let cb = rand(lo, hi)
  let guard = 0
  while (cb === ca && guard++ < 25) cb = rand(lo, hi)
  if (cb === ca) cb = ca > lo ? ca - 1 : ca + 1
  const want = cfg.wants[rand(0, cfg.wants.length - 1)]
  const answerSide = want === 'more' ? (ca > cb ? 'A' : 'B') : (ca < cb ? 'A' : 'B')
  return {
    kind: 'compare', countA: ca, countB: cb,
    animalA: cfg.animals[0], animalB: cfg.animals[1] || cfg.animals[0],
    want, answerSide,
    prompt: want === 'more' ? 'Tap the group with MORE' : 'Tap the group with FEWER',
  }
}

export const genQuestions = (cfg) => Array.from({ length: 5 }, () => genOne(cfg))

// A short "what you'll do" line for the level-intro screen.
export const howToPlay = (cfg) => {
  if (cfg.type === 'add') return 'Count all the animals and tap the total!'
  if (cfg.type === 'sub') return 'Some animals hop away — how many are left?'
  return 'Tap the group with more (or fewer)!'
}

// Scale emoji with the frame (container units) so big groups stay countable.
export const emojiSize = (count) =>
  count <= 6
    ? 'clamp(30px, 9cqi, 42px)'
    : count <= 12
      ? 'clamp(24px, 7cqi, 34px)'
      : 'clamp(20px, 5.5cqi, 28px)'
