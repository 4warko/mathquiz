import { useEffect, useRef, useState } from 'react'
import BottomNav from '../components/BottomNav'
import Scenery from '../components/Scenery'
import useFocusOnMount from '../useFocusOnMount'
import { playPop } from '../sound'
import { FACTS } from '../facts'

// Decorations the child can place in their clubhouse (emoji — no assets).
const PROPS = ['🌳', '🌲', '🌸', '🌻', '🌷', '🍄', '🪨', '🌈', '🎈', '☁️', '⛲', '🏰']
const MAX_DECOR = 40
// Preset drop spots for the keyboard/AT "Place" path (cycled by count).
const SPOTS = [[30, 38], [58, 32], [45, 58], [72, 46], [26, 56], [62, 66], [40, 26], [78, 32], [52, 46], [34, 70]]

export default function CollectionScreen({ levels, collected, friendsCount, muted, decor = [], onSetDecor, onNavigate }) {
  const titleRef = useFocusOnMount()
  const [view, setView] = useState('grid')
  const [popping, setPopping] = useState(null)
  const [fact, setFact] = useState(null)
  const [decorating, setDecorating] = useState(false)
  const [armed, setArmed] = useState(null) // emoji currently picked up, ready to drop
  const [confirmClear, setConfirmClear] = useState(false)
  const timerRef = useRef(null)
  const sceneRef = useRef(null)
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

  // Drop the armed decoration where the yard was tapped (percent coordinates so
  // it stays put across screen sizes).
  const placeAt = (e) => {
    if (!armed || !sceneRef.current || decor.length >= MAX_DECOR) return
    const r = sceneRef.current.getBoundingClientRect()
    const x = Math.max(6, Math.min(94, ((e.clientX - r.left) / r.width) * 100))
    const y = Math.max(8, Math.min(92, ((e.clientY - r.top) / r.height) * 100))
    const id = `${Date.now()}-${decor.length}-${Math.round(x)}-${Math.round(y)}`
    if (!muted) playPop()
    onSetDecor([...decor, { id, emoji: armed, x, y }])
  }
  // Keyboard/AT-friendly placement: drop the armed prop at a preset spot.
  const placePreset = () => {
    if (!armed || decor.length >= MAX_DECOR) return
    const [x, y] = SPOTS[decor.length % SPOTS.length]
    if (!muted) playPop()
    onSetDecor([...decor, { id: `${Date.now()}-${decor.length}-${x}-${y}`, emoji: armed, x, y }])
  }
  const removeDecor = (id) => onSetDecor(decor.filter((d) => d.id !== id))
  const stopDecorating = () => { setDecorating(false); setArmed(null); setConfirmClear(false) }

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
        <button type="button" role="tab" aria-selected={view === 'grid'} className={`coll-tab tap${view === 'grid' ? ' is-active' : ''}`} onClick={() => { setView('grid'); stopDecorating() }}>
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
        <div className={`clubhouse${decorating ? ' clubhouse--edit' : ''}`}>
          <div
            className="clubhouse__scene"
            ref={sceneRef}
            role={decorating ? 'group' : undefined}
            aria-label={decorating ? 'Your yard — tap to place the picked decoration' : undefined}
            onClick={decorating ? placeAt : undefined}
          >
            <Scenery scene="meadow" />

            {decor.map((d) => (
              <button
                key={d.id}
                type="button"
                className="clubhouse__prop"
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
                aria-hidden={decorating ? undefined : true}
                aria-label={decorating ? `Remove ${d.emoji}` : undefined}
                tabIndex={decorating ? 0 : -1}
                onClick={decorating ? (e) => { e.stopPropagation(); removeDecor(d.id) } : undefined}
              >
                <span aria-hidden="true">{d.emoji}</span>
              </button>
            ))}

            <div className="clubhouse__yard">
              {collectedCfgs.length === 0 && !decorating ? (
                <p className="clubhouse__empty">Play levels to meet friends — they’ll gather here!</p>
              ) : (
                collectedCfgs.map((cfg, i) => (
                  <button
                    key={cfg.unlock.name}
                    type="button"
                    className={`clubhouse__pal tap${popping === cfg.unlock.name ? ' is-pop' : ''}`}
                    style={{ animationDelay: `${(i % 6) * 0.25}s` }}
                    aria-label={`${cfg.unlock.name}, tap to learn a fact`}
                    disabled={decorating}
                    onClick={() => sayHi(cfg)}
                  >
                    <span aria-hidden="true">{cfg.unlock.emoji}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {decorating ? (
            <div className="decor-tray">
              <p className="decor-tray__hint">
                {armed ? 'Tap your yard to place it (or use Place). Tap a decoration to remove it.' : 'Pick a decoration to add.'}
              </p>
              <div className="decor-tray__props">
                {PROPS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`decor-prop tap${armed === p ? ' is-armed' : ''}`}
                    aria-label={`Decoration ${p}`}
                    aria-pressed={armed === p}
                    onClick={() => setArmed(armed === p ? null : p)}
                  >
                    <span aria-hidden="true">{p}</span>
                  </button>
                ))}
              </div>
              {armed && (
                <button
                  type="button"
                  className="btn btn--sm btn--block tap"
                  aria-label="Place the picked decoration in your yard"
                  disabled={decor.length >= MAX_DECOR}
                  onClick={placePreset}
                >
                  <span aria-hidden="true">➕</span> Place {armed} in yard
                </button>
              )}
              {confirmClear ? (
                <div className="decor-tray__actions">
                  <button type="button" className="btn btn--block tap" onClick={() => setConfirmClear(false)}>
                    Keep them
                  </button>
                  <button type="button" className="btn btn--danger btn--block tap" onClick={() => { onSetDecor([]); setConfirmClear(false) }}>
                    Clear all
                  </button>
                </div>
              ) : (
                <div className="decor-tray__actions">
                  <button type="button" className="btn btn--block tap" disabled={decor.length === 0} onClick={() => setConfirmClear(true)}>
                    <span aria-hidden="true">🧹</span> Clear
                  </button>
                  <button type="button" className="btn btn--primary btn--block tap" onClick={stopDecorating}>
                    Done
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="decor-bar">
              <button type="button" className="btn btn--primary btn--block tap" onClick={() => setDecorating(true)}>
                <span aria-hidden="true">✎</span> Decorate your home
              </button>
            </div>
          )}
        </div>
      )}

      <BottomNav active="collection" onNavigate={onNavigate} />
    </div>
  )
}
