import { useEffect, useRef, useState } from 'react'
import BottomNav from '../components/BottomNav'
import useFocusOnMount from '../useFocusOnMount'
import { playPop } from '../sound'

export default function CollectionScreen({ levels, collected, friendsCount, muted, onNavigate }) {
  const titleRef = useFocusOnMount()
  const [popping, setPopping] = useState(null)
  const timerRef = useRef(null)
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  // Tap a collected friend to make it wiggle and chirp — the page is a toy.
  const sayHi = (i) => {
    if (!muted) playPop()
    if (navigator.vibrate) navigator.vibrate(18)
    setPopping(i)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setPopping(null), 600)
  }

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
              className={`friend tap${popping === i ? ' friend--pop' : ''}`}
              aria-label={`${cfg.unlock.name}, tap to say hi`}
              onClick={() => sayHi(i)}
            >
              <div className="friend__emoji" aria-hidden="true">{cfg.unlock.emoji}</div>
              <div className="friend__name">{cfg.unlock.name}</div>
            </button>
          )
        })}
      </div>

      <BottomNav active="collection" onNavigate={onNavigate} />
    </div>
  )
}
