// Tiny Web Audio sound effects — no asset files, generated on the fly.
// The AudioContext is created lazily on first play (after a user gesture),
// which browsers require. When the game is muted, nothing is ever created.
let ctx = null

function getCtx() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// One short tone with a soft attack/decay envelope (no clicks).
function blip(c, freq, start, dur, type = 'triangle', peak = 0.18) {
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  osc.connect(gain).connect(c.destination)
  osc.start(start)
  osc.stop(start + dur + 0.03)
}

// Happy little rising two-note for a correct answer.
export function playCorrect() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  blip(c, 660, t, 0.12)
  blip(c, 988, t + 0.1, 0.18)
}

// Gentle, non-punitive "not quite" — a soft descending pair, never harsh.
export function playWrong() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  blip(c, 340, t, 0.14, 'sine', 0.14)
  blip(c, 254, t + 0.12, 0.18, 'sine', 0.14)
}

// A cheerful arpeggio when a level is complete.
export function playFanfare() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  ;[523, 659, 784, 1047].forEach((f, i) => blip(c, f, t + i * 0.12, 0.22))
}
