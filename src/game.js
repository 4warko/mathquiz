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

// Shapes used by pattern-matching levels.
const SHAPES = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠']

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

// Choices for a sequence: the answer plus one step on either side (e.g. 50/60/70).
const seqChoices = (answer, step) => {
  const set = new Set([answer, answer + step, Math.max(0, answer - step)])
  let k = 2
  while (set.size < 3) { set.add(answer + step * k); k++ }
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

  if (cfg.type === 'seq') {
    const step = cfg.step || 1
    const start = cfg.multiples ? step * rand(1, 3) : rand(1, cfg.startMax || 5)
    const seq = [start, start + step, start + 2 * step]
    const answer = start + 3 * step
    const prompt = step >= 3 ? `Count by ${step}s — what comes next?` : 'What comes next?'
    return { kind: 'seq', seq, answer, choices: seqChoices(answer, step), prompt }
  }

  if (cfg.type === 'pattern') {
    const alpha = shuffle(SHAPES).slice(0, cfg.colors || 3)
    const unit = alpha.slice(0, cfg.unit || 2)
    const show = cfg.show || 4
    const seq = Array.from({ length: show }, (_, i) => unit[i % unit.length])
    const answer = unit[show % unit.length]
    const distractors = shuffle(alpha.filter((s) => s !== answer)).slice(0, 2)
    return { kind: 'pattern', seq, answer, choices: shuffle([answer, ...distractors]), prompt: 'What comes next?' }
  }

  if (cfg.type === 'clock') {
    const timeLabel = (h, m) => (m === 30 ? `half past ${h}` : `${h} o'clock`)
    const hour = rand(1, 12)
    const minute = cfg.half && rand(0, 1) === 1 ? 30 : 0
    const answer = timeLabel(hour, minute)
    const set = new Set([answer])
    let guard = 0
    while (set.size < 3 && guard++ < 40) {
      const h = rand(1, 12)
      const m = cfg.half && rand(0, 1) === 1 ? 30 : 0
      set.add(timeLabel(h, m))
    }
    return {
      kind: 'clock', hour, minute, answer, choices: shuffle([...set]),
      hourAngle: (hour % 12) * 30 + (minute / 60) * 30,
      minAngle: minute * 6,
      prompt: 'What time is it?',
    }
  }

  if (cfg.type === 'ncompare') {
    const { lo, hi } = cfg
    let na = rand(lo, hi)
    let nb = rand(lo, hi)
    let guard = 0
    while (nb === na && guard++ < 25) nb = rand(lo, hi)
    if (nb === na) nb = na > lo ? na - 1 : na + 1
    const want = cfg.wants[rand(0, cfg.wants.length - 1)]
    const answerSide = want === 'more' ? (na > nb ? 'A' : 'B') : (na < nb ? 'A' : 'B')
    return {
      kind: 'ncompare', numA: na, numB: nb, want, answerSide,
      prompt: want === 'more' ? 'Tap the BIGGER number' : 'Tap the SMALLER number',
    }
  }

  if (cfg.type === 'bond') {
    const total = rand(3, cfg.sumMax)
    const a = rand(1, total - 1)
    const answer = total - a
    return {
      kind: 'bond', a, total, animal: cfg.animals[0], answer, choices: makeChoices(answer),
      prompt: `How many more make ${total}?`,
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

// Adaptive difficulty: nudge a level's number ranges by the child's skill
// (persisted, clamped to [-2, 3]) so it grows with them but never runs away.
const withSkill = (cfg, skill) => {
  const s = Math.max(-2, Math.min(3, skill || 0))
  if (!s) return cfg
  const bump = (v) => Math.max(4, Math.min(v + 4, v + s))
  switch (cfg.type) {
    case 'add':
    case 'bond':
      return { ...cfg, sumMax: bump(cfg.sumMax) }
    case 'sub':
      return { ...cfg, minMax: bump(cfg.minMax) }
    case 'compare':
    case 'ncompare':
      return { ...cfg, hi: bump(cfg.hi) }
    default: // sequences stay fixed so the step stays learnable
      return cfg
  }
}

export const genQuestions = (cfg, skill = 0) => {
  const adjusted = withSkill(cfg, skill)
  return Array.from({ length: 5 }, () => genOne(adjusted))
}

// Mixed practice: 5 questions, each drawn from a random config in the pool.
export const genMixed = (configs, skill = 0) =>
  Array.from({ length: 5 }, () => genOne(withSkill(configs[rand(0, configs.length - 1)], skill)))

// A short "what you'll do" line for the level-intro screen.
export const howToPlay = (cfg) => {
  if (cfg.type === 'add') return 'Count all the animals and tap the total!'
  if (cfg.type === 'sub') return 'Some animals hop away — how many are left?'
  if (cfg.type === 'seq') return 'Look at the numbers — what comes next?'
  if (cfg.type === 'bond') return 'How many more do you need to reach the number?'
  if (cfg.type === 'ncompare') return 'Which number is bigger (or smaller)? Tap it!'
  if (cfg.type === 'pattern') return 'Spot the pattern — what comes next?'
  if (cfg.type === 'clock') return 'Look at the clock — what time is it?'
  return 'Tap the group with more (or fewer)!'
}

// Scale emoji with the frame (container units) so big groups stay countable.
export const emojiSize = (count) =>
  count <= 6
    ? 'clamp(30px, 9cqi, 42px)'
    : count <= 12
      ? 'clamp(24px, 7cqi, 34px)'
      : 'clamp(20px, 5.5cqi, 28px)'
