import { useEffect, useRef } from 'react'
import { INK } from '../game'

// Horizontal position (percent) for each node, cycling down the trail.
const XS = [26, 50, 74, 50]

export default function MapScreen({ levels, progress, playable, totalStars, friendsCount, onStart, onOpenCollection }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // Find the first level you can play but haven't completed.
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
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', animation: 'fadeUp .35s ease', background: 'linear-gradient(#eaf4fb 0%, #f2f6e4 45%, #eef3d9 100%)' }}>
      <div style={{ flex: '0 0 auto', padding: '16px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'rgba(255,250,240,0.72)', backdropFilter: 'blur(3px)', borderBottom: `3px solid ${INK}` }}>
        <div style={{ lineHeight: 1 }}>
          <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 22, color: INK }}>Holly&apos;s Animal Math</div>
          <div style={{ fontSize: 15, color: '#7a6a58', marginTop: 2 }}>Tap a spot to play!</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff2c9', border: `2.5px solid ${INK}`, borderRadius: 16, padding: '5px 10px', fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 16, boxShadow: `2px 3px 0 ${INK}` }}>⭐ {totalStars}</div>
          <button onClick={onOpenCollection} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#d9edc7', border: `2.5px solid ${INK}`, borderRadius: 16, padding: '5px 10px', fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 16, boxShadow: `2px 3px 0 ${INK}`, cursor: 'pointer', color: INK }}>🐾 {friendsCount}</button>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ position: 'relative', width: '100%', height: mapHeight }}>
          <div style={{ position: 'absolute', top: 20, bottom: 20, left: '50%', width: 0, borderLeft: '5px dashed #cbb48a', transform: 'translateX(-50%)' }} />
          {levels.map((cfg, i) => {
            const n = i + 1
            const completed = !!progress[n]
            const canPlay = playable(n)
            const isCurrent = canPlay && !completed
            const x = XS[i % 4]
            const y = 70 + i * 135
            const nodeStyle = {
              position: 'absolute', left: `${x}%`, top: `${y}px`, transform: 'translate(-50%,-50%)',
              width: 82, height: 82, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              border: `4px solid ${INK}`, borderRadius: '42% 46% 40% 48% / 46% 40% 48% 42%',
              background: completed ? '#ffe6a3' : canPlay ? '#ffffff' : '#e7ddcb',
              boxShadow: `3px 5px 0 ${INK}`, cursor: canPlay ? 'pointer' : 'default', padding: 0,
              ...(isCurrent ? { animation: 'bob 1.3s ease-in-out infinite' } : {}),
            }
            return (
              <button key={n} onClick={canPlay ? () => onStart(n) : undefined} disabled={!canPlay} style={nodeStyle}>
                <div style={{ fontSize: 38, lineHeight: 1, filter: canPlay ? 'none' : 'grayscale(0.7)' }}>{canPlay ? cfg.unlock.emoji : '🔒'}</div>
                <div style={{ position: 'absolute', top: -8, right: -8, width: 26, height: 26, borderRadius: '50%', background: isCurrent ? '#ef8354' : '#fffaf0', color: isCurrent ? '#fffaf0' : INK, border: `2.5px solid ${INK}`, fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `1px 2px 0 ${INK}` }}>{n}</div>
                <div style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', fontSize: 13, letterSpacing: 1, whiteSpace: 'nowrap', textShadow: '0 1px 0 #fff' }}>{completed ? '⭐'.repeat(progress[n]) : ''}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
