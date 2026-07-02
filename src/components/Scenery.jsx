// Decorative, per-world background scenery. Pure CSS shapes (see App.css) plus
// two big faded drifting emoji. Sits behind the content and is inert to a11y.
const DECOR = {
  meadow: ['🌼', '🌿'],
  water: ['🫧', '🐚'],
  night: ['⭐', '🌙'],
  sky: ['☁️', '☀️'],
}

export default function Scenery({ scene = 'sky' }) {
  const decor = DECOR[scene] || DECOR.sky
  return (
    <div className={`scenery scenery--${scene}`} aria-hidden="true">
      <span className="scenery__decor scenery__decor--a">{decor[0]}</span>
      <span className="scenery__decor scenery__decor--b">{decor[1]}</span>
    </div>
  )
}
