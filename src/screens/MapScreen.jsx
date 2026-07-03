import { useEffect, useRef } from 'react'
import { WORLD_SIZE } from '../levels'
import { isWorldDone } from '../progress'
import BottomNav from '../components/BottomNav'
import useFocusOnMount from '../useFocusOnMount'

// Trail geometry — the single source for both the layout math and each node's
// inline size (NODE), so the two can't drift apart.
const NODE = 82    // node diameter in px (applied inline below)
const STEP = 135   // vertical distance between node centers
const TOP = 70     // y of the first node's center
const PAD = 90     // breathing room below the last node
const CENTER = 190 // distance from the top to park the current node on scroll
// Horizontal position (percent) for each slot, cycling down the trail.
const XS = [26, 50, 74, 50]
const SLOTS_PER_WORLD = WORLD_SIZE + 1 // 4 levels + 1 challenge

// Build the ordered trail: each world's levels, then that world's challenge.
function buildItems(levels) {
  const items = []
  const worlds = Math.ceil(levels.length / WORLD_SIZE)
  for (let w = 0; w < worlds; w++) {
    for (let i = 0; i < WORLD_SIZE; i++) {
      const n = w * WORLD_SIZE + i + 1
      if (n <= levels.length) items.push({ kind: 'level', n })
    }
    items.push({ kind: 'challenge', w })
  }
  return items
}

export default function MapScreen({ levels, progress, challenges = {}, playable, totalStars, friendsCount, name = 'Holly', onStart, onChallenge, onNavigate, onOpenSettings }) {
  const scrollRef = useRef(null)
  const titleRef = useFocusOnMount()

  const items = buildItems(levels)
  const isOpen = (it) =>
    it.kind === 'level'
      ? playable(it.n) && !progress[it.n]
      : isWorldDone(progress, it.w) && !(challenges[it.w] > 0)
  // Pulse only the first open item as a gentle "start here"; the rest stay calm.
  const firstOpen = items.findIndex(isOpen)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const y = TOP + (firstOpen === -1 ? items.length - 1 : firstOpen) * STEP
    el.scrollTop = Math.max(0, y - CENTER)
    // Only auto-scroll on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mapHeight = TOP + (items.length - 1) * STEP + PAD

  return (
    <div className="screen screen--map">
      <header className="topbar topbar--glass">
        <button type="button" className="icon-btn tap" aria-label="Grown-up settings" onClick={onOpenSettings}>
          <span aria-hidden="true">⚙️</span>
        </button>
        <div className="topbar__grow">
          <h1 className="topbar__title" ref={titleRef} tabIndex={-1}>{`${name}'s Animal Math`}</h1>
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
          {Array.from({ length: Math.ceil(levels.length / WORLD_SIZE) }, (_, w) => {
            const first = levels[w * WORLD_SIZE]
            const side = w % 2 === 0 ? { right: '6%' } : { left: '6%' }
            return (
              <div
                key={w}
                className="map-band"
                style={{ top: TOP + w * SLOTS_PER_WORLD * STEP - STEP * 0.6, height: SLOTS_PER_WORLD * STEP, '--band': first.tint }}
              >
                <span className="map-band__emoji" style={side} aria-hidden="true">{first.unlock.emoji}</span>
              </div>
            )
          })}
          <div className="trail" aria-hidden="true" />
          {items.map((it, slot) => {
            const pos = { left: `${XS[slot % 4]}%`, top: `${TOP + slot * STEP}px`, width: NODE, height: NODE }
            const current = slot === firstOpen

            if (it.kind === 'challenge') {
              const done = (challenges[it.w] || 0) > 0
              const canPlay = isWorldDone(progress, it.w)
              const cls = ['node', 'node--challenge', done ? 'node--done' : '', !canPlay ? 'node--locked' : '', canPlay && !done ? 'node--open' : '', current ? 'node--current' : ''].filter(Boolean).join(' ')
              const label = canPlay ? `World ${it.w + 1} Challenge${done ? `, ${challenges[it.w]} stars` : ''}` : `World ${it.w + 1} Challenge locked`
              return (
                <button
                  key={`c${it.w}`}
                  type="button"
                  className={cls}
                  style={{ ...pos, '--node-accent': '#e6a93a' }}
                  disabled={!canPlay}
                  aria-label={label}
                  onClick={canPlay ? () => onChallenge(it.w) : undefined}
                >
                  <span className="node__emoji" aria-hidden="true">{canPlay ? '🏆' : '🔒'}</span>
                  <span className="node__stars" aria-hidden="true">{done ? '⭐'.repeat(challenges[it.w]) : ''}</span>
                </button>
              )
            }

            const { n } = it
            const cfg = levels[n - 1]
            const completed = !!progress[n]
            const canPlay = playable(n)
            const cls = ['node', completed ? 'node--done' : '', !canPlay ? 'node--locked' : '', canPlay && !completed ? 'node--open' : '', current ? 'node--current' : ''].filter(Boolean).join(' ')
            const label = canPlay ? `Level ${n}: ${cfg.name}${completed ? `, ${progress[n]} stars` : ''}` : `Level ${n} locked`
            return (
              <button
                key={n}
                type="button"
                className={cls}
                style={{ ...pos, '--node-accent': cfg.accent }}
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
