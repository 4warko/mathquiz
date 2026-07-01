import { INK } from '../game'

export default function CollectionScreen({ levels, collected, friendsCount, onBack }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', animation: 'fadeUp .3s ease', background: 'linear-gradient(#fbf3e2, #f3ead4)' }}>
      <div style={{ flex: '0 0 auto', padding: '16px 16px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `3px solid ${INK}` }}>
        <button onClick={onBack} style={{ width: 44, height: 44, borderRadius: '50%', border: `3px solid ${INK}`, background: '#fffaf0', fontSize: 20, cursor: 'pointer', boxShadow: `2px 3px 0 ${INK}`, color: INK }}>←</button>
        <div>
          <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 22 }}>My Animal Friends</div>
          <div style={{ fontSize: 15, color: '#7a6a58' }}>{friendsCount} of {levels.length} found</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {levels.map((cfg, i) => {
          const unlocked = collected.includes(i + 1)
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 6px', background: unlocked ? '#fffaf0' : '#efe6d3', border: `3px solid ${INK}`, borderRadius: '20px 24px 18px 26px / 24px 18px 26px 20px', boxShadow: `2px 3px 0 ${INK}`, minHeight: 104 }}>
              <div style={{ fontSize: 44, lineHeight: 1, filter: unlocked ? 'none' : 'grayscale(1) opacity(0.5)' }}>{unlocked ? cfg.unlock.emoji : '❓'}</div>
              <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 700, fontSize: 15, color: unlocked ? INK : '#b3a48c', marginTop: 6 }}>{unlocked ? cfg.unlock.name : '???'}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
