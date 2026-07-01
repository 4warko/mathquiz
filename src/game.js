// Pure game logic + shared style helpers. No React in here.

export const INK = '#41332a'

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

// Scale emoji down as the group grows so it still fits.
export const emojiSize = (count) => (count <= 6 ? '32px' : count <= 12 ? '25px' : '20px')

// Style for the number-answer buttons, reacting to answer state.
export const choiceStyle = (state) => {
  const base = {
    minWidth: '90px', padding: '16px 12px',
    fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: '42px', lineHeight: 1, color: INK,
    background: '#fffaf0', border: `3px solid ${INK}`,
    borderRadius: '20px 24px 18px 26px / 24px 18px 26px 20px',
    boxShadow: `3px 4px 0 ${INK}`, cursor: 'pointer', transition: 'transform .12s ease',
  }
  if (state === 'correct') return { ...base, background: '#b6e29a', transform: 'scale(1.07)' }
  if (state === 'wrong') return { ...base, background: '#f2ab9d', animation: 'shake .4s ease' }
  if (state === 'dim') return { ...base, opacity: 0.4 }
  return base
}

// Style for the two "compare" group panels.
export const panelStyle = (state) => {
  const base = {
    flex: 1, padding: '16px 8px', background: 'rgba(255,255,255,0.7)', border: `3px solid ${INK}`,
    borderRadius: '24px 28px 22px 30px / 28px 22px 30px 24px',
    boxShadow: `3px 4px 0 ${INK}`, cursor: 'pointer', transition: 'transform .12s ease',
  }
  if (state === 'correct') return { ...base, background: '#b6e29a', transform: 'scale(1.04)' }
  if (state === 'wrong') return { ...base, background: '#f2ab9d', animation: 'shake .4s ease' }
  if (state === 'dim') return { ...base, opacity: 0.4 }
  return base
}
