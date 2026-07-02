// Level definitions for Holly's Animal Math.
// Each level has a math `type` (add | sub | compare | seq | bond | ncompare),
// difficulty config, a `scene` (drives the background scenery), and the animal
// friend you unlock by completing it.

// Levels are grouped into "worlds" of this size; finishing the last level of a
// world triggers a milestone celebration.
export const WORLD_SIZE = 4

export const LEVELS = [
  { name: 'Sunny Meadow',     type: 'add',     sumMax: 8,  scene: 'meadow', animals: ['🐰'], unlock: { emoji: '🐰', name: 'Bun-Bun' }, accent: '#7fb069', tint: '#eef3d9' },
  { name: 'Barnyard',         type: 'add',     sumMax: 12, scene: 'sky',    animals: ['🐔'], unlock: { emoji: '🐔', name: 'Cluck' },   accent: '#e6a93a', tint: '#fbeecf' },
  { name: 'Backyard',         type: 'compare', lo: 3, hi: 11, wants: ['more'],          scene: 'meadow', animals: ['🐶', '🐱'], unlock: { emoji: '🐶', name: 'Pip' },     accent: '#e0985a', tint: '#f6ead6' },
  { name: 'Frog Pond',        type: 'sub',     minMax: 10, scene: 'water',  animals: ['🐸'], unlock: { emoji: '🐸', name: 'Hoppy' },   accent: '#5fb59a', tint: '#dff0ea' },
  { name: 'Lily Pond',        type: 'add',     sumMax: 14, scene: 'water',  animals: ['🐢'], unlock: { emoji: '🐢', name: 'Shelly' },  accent: '#6aa96b', tint: '#e2f0dd' },
  { name: 'Blue Ocean',       type: 'sub',     minMax: 12, scene: 'water',  animals: ['🐠'], unlock: { emoji: '🐠', name: 'Bubbles' }, accent: '#5aa9d6', tint: '#dcecf7' },
  { name: 'Deep Sea',         type: 'compare', lo: 4, hi: 13, wants: ['more', 'fewer'], scene: 'water',  animals: ['🐙', '🦀'], unlock: { emoji: '🐙', name: 'Ollie' },   accent: '#4d86c4', tint: '#d6e3f2' },
  { name: 'Icy Shore',        type: 'add',     sumMax: 18, scene: 'water',  animals: ['🐧'], unlock: { emoji: '🐧', name: 'Waddle' },  accent: '#68a6c9', tint: '#e6f0f5' },
  { name: 'Whispering Woods', type: 'sub',     minMax: 15, scene: 'meadow', animals: ['🦊'], unlock: { emoji: '🦊', name: 'Rusty' },   accent: '#c07b3a', tint: '#eceace' },
  { name: 'Wild Jungle',      type: 'add',     sumMax: 20, scene: 'meadow', animals: ['🐵'], unlock: { emoji: '🐵', name: 'Coco' },    accent: '#6fa03e', tint: '#e5efce' },
  { name: 'Golden Savanna',   type: 'compare', lo: 6, hi: 18, wants: ['more', 'fewer'], scene: 'sky',    animals: ['🐘', '🦁'], unlock: { emoji: '🐘', name: 'Tembo' },   accent: '#d8a24a', tint: '#f5e9c8' },
  { name: 'Rainbow Peak',     type: 'add',     sumMax: 20, scene: 'sky',    animals: ['🦄'], unlock: { emoji: '🦄', name: 'Sparkle' }, accent: '#c46aa0', tint: '#f6e4ef' },
  { name: 'Buzzy Garden',     type: 'seq',     step: 1, startMax: 6,  scene: 'meadow', animals: ['🐝'], unlock: { emoji: '🐝', name: 'Buzz' },    accent: '#d99a2b', tint: '#f7edcb' },
  { name: 'Clover Field',     type: 'bond',    sumMax: 10, scene: 'meadow', animals: ['🐴'], unlock: { emoji: '🐴', name: 'Clover' },  accent: '#6fa93f', tint: '#e6f0d6' },
  { name: 'Starry Night',     type: 'seq',     step: 2, startMax: 4,  scene: 'night',  animals: ['🦉'], unlock: { emoji: '🦉', name: 'Hoot' },    accent: '#5a6bb0', tint: '#e2e4f2' },
  { name: 'Splashy Cove',     type: 'bond',    sumMax: 15, scene: 'water',  animals: ['🐬'], unlock: { emoji: '🐬', name: 'Splash' },  accent: '#3f97b3', tint: '#d9eef4' },
  { name: 'Panda Grove',      type: 'ncompare', lo: 2, hi: 20, wants: ['more'],          scene: 'meadow', animals: ['🐼'], unlock: { emoji: '🐼', name: 'Bamboo' },  accent: '#5b7a8a', tint: '#e7eef1' },
  { name: 'Giraffe Plains',   type: 'seq',     step: 5, multiples: true, scene: 'sky',    animals: ['🦒'], unlock: { emoji: '🦒', name: 'Stretch' }, accent: '#c79a34', tint: '#f6edcf' },
  { name: 'Koala Gum',        type: 'ncompare', lo: 5, hi: 50, wants: ['more', 'fewer'], scene: 'meadow', animals: ['🐨'], unlock: { emoji: '🐨', name: 'Gumnut' },  accent: '#6f8379', tint: '#e7ece8' },
  { name: 'Flamingo Lagoon',  type: 'seq',     step: 10, multiples: true, scene: 'water',  animals: ['🦩'], unlock: { emoji: '🦩', name: 'Rosie' },   accent: '#d96a92', tint: '#f7e2ea' },
  { name: 'Parrot Cove',      type: 'pattern', colors: 3, unit: 2, scene: 'water',  animals: ['🦜'], unlock: { emoji: '🦜', name: 'Rio' },     accent: '#3fa79a', tint: '#dcefec' },
  { name: 'Mossy Hollow',     type: 'pattern', colors: 3, unit: 3, scene: 'meadow', animals: ['🦥'], unlock: { emoji: '🦥', name: 'Mossy' },   accent: '#7d9a52', tint: '#e9efd6' },
  { name: 'Otter Creek',      type: 'add',     sumMax: 20, scene: 'water',  animals: ['🦦'], unlock: { emoji: '🦦', name: 'Otto' },    accent: '#5b8fa8', tint: '#dde9ef' },
  { name: 'Prickle Patch',    type: 'bond',    sumMax: 15, scene: 'meadow', animals: ['🦔'], unlock: { emoji: '🦔', name: 'Prickle' }, accent: '#b07a4a', tint: '#efe4d2' },
  { name: 'Tick-Tock Town',   type: 'clock',   scene: 'sky',    animals: ['🐹'], unlock: { emoji: '🐹', name: 'Nibbles' }, accent: '#c98a3c', tint: '#f6ebd2' },
  { name: 'Clockwork Cove',   type: 'clock',   half: true, scene: 'meadow', animals: ['🦝'], unlock: { emoji: '🦝', name: 'Bandit' },  accent: '#7a8a7f', tint: '#e7ece8' },
  { name: 'Sundial Hill',     type: 'add',     sumMax: 20, scene: 'meadow', animals: ['🐿️'], unlock: { emoji: '🐿️', name: 'Nutty' },   accent: '#a9803f', tint: '#efe6cf' },
  { name: 'Moonlit Glade',    type: 'pattern', colors: 4, unit: 2, scene: 'night',  animals: ['🦇'], unlock: { emoji: '🦇', name: 'Echo' },    accent: '#6a6b9c', tint: '#e4e3f0' },
  { name: 'Shape Studio',     type: 'shape',   scene: 'meadow', animals: ['🦋'], unlock: { emoji: '🦋', name: 'Flutter' }, accent: '#6a8fbf', tint: '#e4ecf5' },
  { name: 'Puzzle Park',      type: 'shape',   scene: 'sky',    animals: ['🐞'], unlock: { emoji: '🐞', name: 'Dot' },     accent: '#c9503f', tint: '#f6e0da' },
  { name: 'Building Blocks',  type: 'bond',    sumMax: 15, scene: 'meadow', animals: ['🐌'], unlock: { emoji: '🐌', name: 'Gary' },    accent: '#8a8a4a', tint: '#eeeed6' },
  { name: 'Art Corner',       type: 'pattern', colors: 4, unit: 3, scene: 'sky',    animals: ['🦎'], unlock: { emoji: '🦎', name: 'Gecko' },   accent: '#5fa36a', tint: '#dff0e1' },
]
