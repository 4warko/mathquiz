// Pure progression logic — extracted from the reducer so it can be unit-tested
// without React. All functions take plain state (no closures over component
// state) and never mutate their inputs.
import { LEVELS, WORLD_SIZE } from './levels.js'
import { HATS } from './shop.js'

// Total stars earned (sum of best-stars per level). The single source for this
// value everywhere — no more copy-pasted reduces.
export const sumStars = (progress) => Object.values(progress).reduce((a, b) => a + Number(b || 0), 0)

// Stars for a level run: flawless = 3, up to two misses = 2, otherwise 1.
export const starsForWrong = (wrongCount) => (wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1)

// 0-based world index for a 1-based level number.
export const worldOf = (n) => Math.floor((n - 1) / WORLD_SIZE)

// The level numbers that make up world w (clamped to the real level count).
export const worldLevelNums = (w) =>
  Array.from({ length: WORLD_SIZE }, (_, i) => w * WORLD_SIZE + i + 1).filter((n) => n <= LEVELS.length)

// A world counts as done only if it has levels AND every one has progress.
export const isWorldDone = (progress, w) => {
  const nums = worldLevelNums(w)
  return nums.length > 0 && nums.every((n) => progress[n])
}

// Levels unlock a world at a time: the first world is always open, later worlds
// open once the previous world is fully complete.
export const isPlayable = (progress, n) => {
  const w = worldOf(n)
  return w === 0 || isWorldDone(progress, w - 1)
}

// The next level to nudge toward on the reward screen: prefer the next
// higher-numbered open+unfinished level, then wrap back to earlier gaps.
export const nextPlayableLevel = (progress, fromLevel) => {
  const order = []
  for (let n = fromLevel + 1; n <= LEVELS.length; n++) order.push(n)
  for (let n = 1; n <= fromLevel; n++) order.push(n)
  return order.find((n) => isPlayable(progress, n) && !progress[n]) ?? null
}

// Did finishing `level` flip its world from "not done" to "done"?
export const worldJustCompleted = (prevProgress, newProgress, level) => {
  const w = worldOf(level)
  return !isWorldDone(prevProgress, w) && isWorldDone(newProgress, w)
}

// Star Shop: spendable balance (earned never drops — the pill stays lifetime).
export const walletOf = (progress, spent) => Math.max(0, sumStars(progress) - (spent || 0))

// Whether a hat purchase is allowed: real hat, not already owned, affordable.
export const canBuyHat = (progress, spent, owned, id) => {
  const item = HATS.find((h) => h.id === id)
  if (!item || owned.includes(id)) return false
  return walletOf(progress, spent) >= item.cost
}
