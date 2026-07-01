import { useEffect, useRef } from 'react'
import BottomNav from '../components/BottomNav'
import useFocusOnMount from '../useFocusOnMount'

// Horizontal position (percent) for each node, cycling down the trail.
const XS = [26, 50, 74, 50]

export default function MapScreen({ levels, progress, playable, totalStars, friendsCount, onStart, onNavigate }) {
  const scrollRef = useRef(null)
  const titleRef = useFocusOnMount()

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // Center on the first playable-but-uncompleted level.
    let cur = levels.length
    for (let n = 1; n <= levels.length; n++) {
      if ((n === 1 || progress[n - 1]) && !progress[n]) { cur = n; break }
    }
    const y = 70 + (cur - 1) * 135
    el.scrollTop = Math.max(0, y - 190)
    // Only auto-scroll on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mapHeight = 70 + (levels.length - 1) * 135 + 90

  return (
    <div className="screen screen--map">
      <header className="topbar topbar--glass">
        <div className="topbar__grow">
          <h1 className="topbar__title" ref={titleRef} tabIndex={-1}>Holly&apos;s Animal Math</h1>
          <div className="topbar__sub">Tap a spot to play!</div>
        </div>
        <div className="topbar__actions">
          <span className="pill pill--star" aria-label={`${totalStars} stars`}>
            <span aria-hidden="true">⭐</span> {totalStars}
          </span>
          <span className="pill pill--friends" aria-label={`${friendsCount} friends found`}>
            <span aria-hidden="true">🐾</span> {friendsCount}
          </span>
        </div>
      </header>

      <div ref={scrollRef} className="scroll">
        <div className="map-canvas" style={{ height: mapHeight }}>
          <div className="trail" aria-hidden="true" />
          {levels.map((cfg, i) => {
            const n = i + 1
            const completed = !!progress[n]
            const canPlay = playable(n)
            const isCurrent = canPlay && !completed
            const cls = [
              'node',
              completed ? 'node--done' : '',
              !canPlay ? 'node--locked' : '',
              isCurrent ? 'node--current' : '',
            ].filter(Boolean).join(' ')
            const label = canPlay ? `Level ${n}: ${cfg.name}${completed ? `, ${progress[n]} stars` : ''}` : `Level ${n} locked`
            return (
              <button
                key={n}
                type="button"
                className={cls}
                style={{ left: `${XS[i % 4]}%`, top: `${70 + i * 135}px` }}
                disabled={!canPlay}
                aria-label={label}
                onClick={canPlay ? () => onStart(n) : undefined}
              >
                <span className="node__emoji" aria-hidden="true">{canPlay ? cfg.unlock.emoji : '🔒'}</span>
                <span className="node__badge" aria-hidden="true">{n}</span>
                <span className="node__stars" aria-hidden="true">{completed ? '⭐'.repeat(progress[n]) : ''}</span>
              </button>
            )
          })}
        </div>
      </div>

      <BottomNav active="map" onNavigate={onNavigate} />
    </div>
  )
}
