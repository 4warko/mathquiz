// Persistent thumb-zone navigation shared by the Map and Collection screens.
const ITEMS = [
  { key: 'home', icon: '🏠', label: 'Home' },
  { key: 'map', icon: '🗺️', label: 'Map' },
  { key: 'collection', icon: '🐾', label: 'Friends' },
  { key: 'awards', icon: '🏆', label: 'Awards' },
]

export default function BottomNav({ active, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {ITEMS.map((it) => (
        <button
          key={it.key}
          type="button"
          className={`nav-btn tap${active === it.key ? ' is-active' : ''}`}
          aria-current={active === it.key ? 'page' : undefined}
          onClick={() => onNavigate(it.key)}
        >
          <span className="nav-btn__icon" aria-hidden="true">{it.icon}</span>
          <span className="nav-btn__label">{it.label}</span>
        </button>
      ))}
    </nav>
  )
}
