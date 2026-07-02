// Reward celebration themes, unlocked as the player earns total stars. The
// highest unlocked theme applies automatically on the reward screen.
export const REWARD_THEMES = [
  { id: 'confetti', at: 0, kind: 'rect', label: 'Confetti' },
  { id: 'starfall', at: 25, kind: 'emoji', pieces: ['⭐', '✨', '🌟'], label: 'Starfall' },
  { id: 'blossom', at: 60, kind: 'emoji', pieces: ['🌸', '🌼', '💮', '🌷'], label: 'Blossoms' },
  { id: 'party', at: 110, kind: 'emoji', pieces: ['🎈', '🎊', '🎉', '⭐'], label: 'Party Time' },
]

// The highest theme whose star threshold has been reached.
export const themeForStars = (stars = 0) =>
  REWARD_THEMES.filter((t) => stars >= t.at).at(-1) || REWARD_THEMES[0]
