import { LEVELS, WORLD_SIZE } from './levels.js'

// Long-term goals beyond the animal collection. Each badge has a target and a
// value function over the derived context; it's unlocked once value >= target.
export const ACHIEVEMENTS = [
  { id: 'firstFriend', icon: '🐾', title: 'First Friend', desc: 'Meet your first animal', target: 1, value: (c) => c.friends },
  { id: 'crew', icon: '🎊', title: 'Growing Crew', desc: 'Meet 5 animal friends', target: 5, value: (c) => c.friends },
  { id: 'zookeeper', icon: '🦁', title: 'Zookeeper', desc: `Meet all ${LEVELS.length} friends`, target: LEVELS.length, value: (c) => c.friends },
  { id: 'perfect1', icon: '⭐', title: 'Perfect!', desc: 'Get 3 stars on a level', target: 1, value: (c) => c.perfect },
  { id: 'perfect10', icon: '🌟', title: 'Perfect Ten', desc: 'Get 3 stars ten times', target: 10, value: (c) => c.perfect },
  { id: 'cruncher', icon: '🔢', title: 'Number Cruncher', desc: 'Answer 50 questions right', target: 50, value: (c) => c.correct },
  { id: 'mathstar', icon: '💯', title: 'Math Star', desc: 'Answer 200 questions right', target: 200, value: (c) => c.correct },
  { id: 'explorer', icon: '🗺️', title: 'Explorer', desc: 'Finish a whole world', target: 1, value: (c) => c.worlds },
  { id: 'champion', icon: '👑', title: 'Champion', desc: 'Finish every world', target: Math.ceil(LEVELS.length / WORLD_SIZE), value: (c) => c.worlds },
  { id: 'practicePro', icon: '🎲', title: 'Practice Pro', desc: 'Play 5 Surprise Rounds', target: 5, value: (c) => c.practiceRounds },
  { id: 'starCollector', icon: '✨', title: 'Star Collector', desc: 'Earn 30 stars', target: 30, value: (c) => c.stars },
]

// Derive the achievement context from persisted state.
export function achievementCtx({ progress = {}, collected = [], stats = {} }) {
  const stars = Object.values(progress).reduce((a, b) => a + b, 0)
  const worldCount = Math.ceil(LEVELS.length / WORLD_SIZE)
  let worlds = 0
  for (let w = 0; w < worldCount; w++) {
    const start = w * WORLD_SIZE
    const slice = LEVELS.slice(start, start + WORLD_SIZE)
    if (slice.length && slice.every((_, i) => progress[start + i + 1])) worlds++
  }
  return {
    stars,
    friends: collected.length,
    worlds,
    correct: stats.correct || 0,
    perfect: stats.perfect || 0,
    practiceRounds: stats.practiceRounds || 0,
  }
}

export const unlockedIds = (ctx) => ACHIEVEMENTS.filter((a) => a.value(ctx) >= a.target).map((a) => a.id)
