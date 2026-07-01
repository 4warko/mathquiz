// Level definitions for Holly's Animal Math.
// Each level has a math `type` (add | sub | compare | seq | bond), difficulty
// config, and the animal friend you unlock by completing it.

// Levels are grouped into "worlds" of this size; finishing the last level of a
// world triggers a milestone celebration.
export const WORLD_SIZE = 4

export const LEVELS = [
  { name: 'Sunny Meadow',     type: 'add',     sumMax: 8,  animals: ['🐰'],       unlock: { emoji: '🐰', name: 'Bun-Bun' }, accent: '#7fb069', tint: '#eef3d9' },
  { name: 'Barnyard',         type: 'add',     sumMax: 12, animals: ['🐔'],       unlock: { emoji: '🐔', name: 'Cluck' },   accent: '#e6a93a', tint: '#fbeecf' },
  { name: 'Backyard',         type: 'compare', lo: 3, hi: 11, wants: ['more'],          animals: ['🐶', '🐱'], unlock: { emoji: '🐶', name: 'Pip' },     accent: '#e0985a', tint: '#f6ead6' },
  { name: 'Frog Pond',        type: 'sub',     minMax: 10, animals: ['🐸'],       unlock: { emoji: '🐸', name: 'Hoppy' },   accent: '#5fb59a', tint: '#dff0ea' },
  { name: 'Lily Pond',        type: 'add',     sumMax: 14, animals: ['🐢'],       unlock: { emoji: '🐢', name: 'Shelly' },  accent: '#6aa96b', tint: '#e2f0dd' },
  { name: 'Blue Ocean',       type: 'sub',     minMax: 12, animals: ['🐠'],       unlock: { emoji: '🐠', name: 'Bubbles' }, accent: '#5aa9d6', tint: '#dcecf7' },
  { name: 'Deep Sea',         type: 'compare', lo: 4, hi: 13, wants: ['more', 'fewer'], animals: ['🐙', '🦀'], unlock: { emoji: '🐙', name: 'Ollie' },   accent: '#4d86c4', tint: '#d6e3f2' },
  { name: 'Icy Shore',        type: 'add',     sumMax: 18, animals: ['🐧'],       unlock: { emoji: '🐧', name: 'Waddle' },  accent: '#68a6c9', tint: '#e6f0f5' },
  { name: 'Whispering Woods', type: 'sub',     minMax: 15, animals: ['🦊'],       unlock: { emoji: '🦊', name: 'Rusty' },   accent: '#c07b3a', tint: '#eceace' },
  { name: 'Wild Jungle',      type: 'add',     sumMax: 20, animals: ['🐵'],       unlock: { emoji: '🐵', name: 'Coco' },    accent: '#6fa03e', tint: '#e5efce' },
  { name: 'Golden Savanna',   type: 'compare', lo: 6, hi: 18, wants: ['more', 'fewer'], animals: ['🐘', '🦁'], unlock: { emoji: '🐘', name: 'Tembo' },   accent: '#d8a24a', tint: '#f5e9c8' },
  { name: 'Rainbow Peak',     type: 'add',     sumMax: 20, animals: ['🦄'],       unlock: { emoji: '🦄', name: 'Sparkle' }, accent: '#c46aa0', tint: '#f6e4ef' },
  { name: 'Buzzy Garden',     type: 'seq',     step: 1, startMax: 6,  animals: ['🐝'], unlock: { emoji: '🐝', name: 'Buzz' },    accent: '#d99a2b', tint: '#f7edcb' },
  { name: 'Clover Field',     type: 'bond',    sumMax: 10, animals: ['🐴'],       unlock: { emoji: '🐴', name: 'Clover' },  accent: '#6fa93f', tint: '#e6f0d6' },
  { name: 'Starry Night',     type: 'seq',     step: 2, startMax: 4,  animals: ['🦉'], unlock: { emoji: '🦉', name: 'Hoot' },    accent: '#5a6bb0', tint: '#e2e4f2' },
  { name: 'Splashy Cove',     type: 'bond',    sumMax: 15, animals: ['🐬'],       unlock: { emoji: '🐬', name: 'Splash' },  accent: '#3f97b3', tint: '#d9eef4' },
]
