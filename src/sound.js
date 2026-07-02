// Tiny Web Audio sound effects — no asset files, generated on the fly.
// The AudioContext is created lazily on first play (after a user gesture),
// which browsers require. When the game is muted, nothing is ever created.
let ctx = null

function getCtx() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  // Resume from any non-running, non-closed state — iOS uses 'interrupted'
  // (after a call/Siri) as well as 'suspended', and never auto-recovers.
  if (ctx.state !== 'running' && ctx.state !== 'closed') ctx.resume().catch(() => {})
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

// Prime the audio engine inside a user gesture. iOS keeps the AudioContext
// suspended until a gesture plays something, so a silent buffer here makes the
// first real sound reliable. (Note: audio can still be muted by the iPhone's
// hardware ring/silent switch — that's outside a web page's control.)
export function unlockAudio() {
  const c = getCtx()
  if (!c) return
  try {
    const src = c.createBufferSource()
    src.buffer = c.createBuffer(1, 1, 22050)
    src.connect(c.destination)
    src.start(0)
  } catch {
    /* ignore */
  }
}

// A quick, cute chirp — used when a collected animal is tapped.
export function playPop() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  blip(c, 880, t, 0.09)
  blip(c, 1320, t + 0.06, 0.12)
}

// Happy little rising run for a correct answer, with a sparkle on top.
export function playCorrect() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  blip(c, 660, t, 0.12)
  blip(c, 988, t + 0.1, 0.16)
  blip(c, 1319, t + 0.2, 0.14, 'sine', 0.12)
}

// Gentle, non-punitive "not quite" — a soft descending pair, never harsh.
export function playWrong() {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  blip(c, 340, t, 0.14, 'sine', 0.14)
  blip(c, 254, t + 0.12, 0.18, 'sine', 0.14)
}

// A cheerful arpeggio when a level is complete — scaled to the stars earned so
// a flawless run sounds bigger (3★ gets a sparkle tail, 1★ a gentle two-note).
export function playFanfare(stars = 3) {
  const c = getCtx()
  if (!c) return
  const t = c.currentTime
  const runs = { 1: [392, 523], 2: [392, 523, 659], 3: [523, 659, 784, 1047] }
  const notes = runs[stars] || runs[3]
  notes.forEach((f, i) => blip(c, f, t + i * 0.12, 0.22))
  if (stars >= 3) {
    ;[1319, 1568, 2093].forEach((f, i) => blip(c, f, t + 0.52 + i * 0.08, 0.14, 'sine', 0.1))
  }
}

/* ---- Gentle looping background music (generated, no asset files) ----
   A slow, quiet wander over a C-major pentatonic scale, so any notes that
   overlap still sound consonant. A soft sine "pad" underpins every few beats.
   Notes are only emitted while the AudioContext is actually running, so a
   suspended (pre-gesture / backgrounded) context never queues a pile-up. */
const MELODY = [261.63, 293.66, 329.63, 392.0, 440.0] // C4 D4 E4 G4 A4
const PAD = [130.81, 146.83, 164.81, 196.0] // C3 D3 E3 G3
let musicTimer = null
let musicGain = null
let beat = 0

function musicNote(c, freq, dur, peak, type) {
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime)
  const t = c.currentTime
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + 0.06)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(musicGain)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

export function startMusic() {
  const c = getCtx()
  if (!c || musicTimer) return
  musicGain = c.createGain()
  musicGain.gain.value = 0.6
  musicGain.connect(c.destination)
  beat = 0
  musicTimer = setInterval(() => {
    const cc = getCtx()
    if (!cc || cc.state !== 'running' || !musicGain) return
    // Melody: most beats play a note, with the odd octave lift for sparkle.
    if (beat % 2 === 0 || Math.random() > 0.4) {
      const hi = Math.random() > 0.85 ? 2 : 1
      musicNote(cc, MELODY[Math.floor(Math.random() * MELODY.length)] * hi, 0.5, 0.05, 'triangle')
    }
    // Soft pad every four beats.
    if (beat % 4 === 0) musicNote(cc, PAD[(beat / 4) % PAD.length], 1.7, 0.05, 'sine')
    beat++
  }, 480)
}

export function stopMusic() {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null }
  const g = musicGain
  musicGain = null
  if (g) {
    try { const c = getCtx(); if (c) g.gain.setTargetAtTime(0.0001, c.currentTime, 0.12) } catch { /* ignore */ }
    setTimeout(() => { try { g.disconnect() } catch { /* ignore */ } }, 500)
  }
}
