import BottomNav from '../components/BottomNav'
import useFocusOnMount from '../useFocusOnMount'
import { HATS, hatEmoji } from '../shop'

export default function ShopScreen({ wallet = 0, avatar = '🐰', hat = null, owned = [], onBuy, onEquip, onNavigate }) {
  const titleRef = useFocusOnMount()

  return (
    <div className="screen screen--shop">
      <header className="topbar topbar--glass">
        <button type="button" className="icon-btn tap" aria-label="Back to home" onClick={() => onNavigate('home')}>
          <span aria-hidden="true">←</span>
        </button>
        <div className="topbar__grow">
          <h1 className="topbar__title" ref={titleRef} tabIndex={-1}>Star Shop</h1>
          <div className="topbar__sub">Spend your stars on hats!</div>
        </div>
        <span className="pill pill--star" aria-label={`${wallet} stars to spend`}>
          <span aria-hidden="true">⭐</span> {wallet}
        </span>
      </header>

      <div className="shop-preview">
        <div className="shop-preview__buddy" aria-hidden="true">
          <span className="avatar-emoji">{avatar}</span>
          {hat && <span className="avatar-hat">{hatEmoji(hat)}</span>}
        </div>
        <p className="shop-preview__label">{hat ? 'Looking good!' : 'Pick a hat for your buddy!'}</p>
        {hat && (
          <button type="button" className="btn btn--sm tap" onClick={() => onEquip(null)}>
            Take off hat
          </button>
        )}
      </div>

      <div className="shop-grid">
        {HATS.map((h) => {
          const isOwned = owned.includes(h.id)
          const isWorn = hat === h.id
          const afford = wallet >= h.cost
          return (
            <div key={h.id} className={`shop-item${isWorn ? ' shop-item--worn' : ''}`}>
              <div className="shop-item__emoji" aria-hidden="true">{h.emoji}</div>
              <div className="shop-item__name">{h.name}</div>
              {isOwned ? (
                <button
                  type="button"
                  className={`btn btn--sm btn--block tap${isWorn ? ' btn--primary' : ''}`}
                  aria-label={isWorn ? `Take off ${h.name}` : `Wear ${h.name}`}
                  onClick={() => onEquip(isWorn ? null : h.id)}
                >
                  {isWorn ? 'Wearing ✓' : 'Wear'}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--sm btn--block tap"
                  disabled={!afford}
                  aria-label={afford ? `Buy ${h.name} for ${h.cost} stars` : `${h.name} needs ${h.cost} stars`}
                  onClick={() => onBuy(h.id, h.cost)}
                >
                  <span aria-hidden="true">⭐</span> {h.cost}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <BottomNav active="" onNavigate={onNavigate} />
    </div>
  )
}
