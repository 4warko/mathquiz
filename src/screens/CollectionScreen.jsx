import { useEffect, useRef, useState } from 'react'
import BottomNav from '../components/BottomNav'
import Scenery from '../components/Scenery'
import useFocusOnMount from '../useFocusOnMount'
import { playPop } from '../sound'
import { FACTS } from '../facts'

export default function CollectionScreen({ levels, collected, friendsCount, muted, onNavigate }) {
  const titleRef = useFocusOnMount()
  const [view, setView] = useState('grid')
  const [popping, setPopping] = useState(null)
  const [fact, setFact] = useState(null)
  const timerRef = useRef(null)
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  // Tap a friend to learn a fun fact and make it wiggle.
  const sayHi = (cfg) => {
    const name = cfg.unlock.name
    const text = FACTS[name] || ''
    setFact({ name, emoji: cfg.unlock.emoji, text })
    setPopping(name)
    if (!muted) playPop()
    if (navigator.vibrate) navigator.vibrate(18)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setPopping(null), 700)
  }

  const collectedCfgs = levels.filter((_, i) => collected.includes(i + 1))

  return (
    <div className="screen screen--collection">
      <header className="topbar topbar--glass">
        <button type="button" className="icon-btn tap" aria-label="Back to map" onClick={() => onNavigate('map')}>
          <span aria-hidden="true">←</span>
        </button>
        <div className="topbar__grow">
          <h1 className="topbar__title" ref={titleRef} tabIndex={-1}>My Animal Friends</h1>
          <div className="topbar__sub">{friendsCount} of {levels.length} found</div>
        </div>
      </header>

      <div className="coll-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={view === 'grid'} className={`coll-tab tap${view === 'grid' ? ' is-active' : ''}`} onClick={() => setView('grid')}>
          Collection
        </button>
        <button type="button" role="tab" aria-selected={view === 'home'} className={`coll-tab tap${view === 'home' ? ' is-active' : ''}`} onClick={() => setView('home')}>
          <span aria-hidden="true">🏡</span> Their Home
        </button>
      </div>

      <div className="coll-fact" role="status">
        {fact ? (
          <>
            <span className="coll-fact__emoji" aria-hidden="true">{fact.emoji}</span>
            <span><strong>{fact.name}:</strong> {fact.text}</span>
          </>
        ) : (
          <span className="coll-fact__hint">Tap a friend to learn about them!</span>
        )}
      </div>

      {view === 'grid' ? (
        <div className="coll-grid">
          {levels.map((cfg, i) => {
            const unlocked = collected.includes(i + 1)
            if (!unlocked) {
              return (
                <div key={i} className="friend friend--locked">
                  <div className="friend__emoji" aria-hidden="true">❓</div>
                  <div className="friend__name">???</div>
                </div>
              )
            }
            return (
              <button
                key={i}
                type="button"
                className={`friend tap${popping === cfg.unlock.name ? ' friend--pop' : ''}`}
                aria-label={`${cfg.unlock.name}, tap to learn a fact`}
                onClick={() => sayHi(cfg)}
              >
                <div className="friend__emoji" aria-hidden="true">{cfg.unlock.emoji}</div>
                <div className="friend__name">{cfg.unlock.name}</div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="clubhouse">
          <Scenery scene="meadow" />
          <div className="clubhouse__yard">
            {collectedCfgs.length === 0 ? (
              <p className="clubhouse__empty">Play levels to meet friends — they’ll gather here!</p>
            ) : (
              collectedCfgs.map((cfg, i) => (
                <button
                  key={cfg.unlock.name}
                  type="button"
                  className={`clubhouse__pal tap${popping === cfg.unlock.name ? ' is-pop' : ''}`}
                  style={{ animationDelay: `${(i % 6) * 0.25}s` }}
                  aria-label={`${cfg.unlock.name}, tap to learn a fact`}
                  onClick={() => sayHi(cfg)}
                >
                  <span aria-hidden="true">{cfg.unlock.emoji}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <BottomNav active="collection" onNavigate={onNavigate} />
    </div>
  )
}
