// Star Shop: cosmetic hats the child buys with earned stars and wears on their
// buddy. Costs ascend so it reads as a progression; the full set (sum 118) is
// attainable near a flawless playthrough (40 levels x 3 stars = 120).
export const HATS = [
  { id: 'bow', emoji: '🎀', name: 'Bow', cost: 5 },
  { id: 'cap', emoji: '🧢', name: 'Cap', cost: 8 },
  { id: 'flower', emoji: '🌸', name: 'Flower', cost: 10 },
  { id: 'sunhat', emoji: '👒', name: 'Sun Hat', cost: 12 },
  { id: 'grad', emoji: '🎓', name: 'Grad Cap', cost: 16 },
  { id: 'tophat', emoji: '🎩', name: 'Top Hat', cost: 20 },
  { id: 'wings', emoji: '🦋', name: 'Butterfly', cost: 22 },
  { id: 'crown', emoji: '👑', name: 'Crown', cost: 25 },
]

// The emoji for an equipped hat id (null if none / unknown).
export const hatEmoji = (id) => HATS.find((h) => h.id === id)?.emoji || null
