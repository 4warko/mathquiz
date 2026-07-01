import { INK, emojiSize, choiceStyle, panelStyle } from '../game'

export default function PlayScreen({ cfg, levelNum, question, qIndex, answered, onBack, onAnswer, onAnswerCompare }) {
  const q = question || {}
  const a = answered

  // Visual state for a number choice button.
  const numState = (value) => {
    if (!a) return 'idle'
    if (a.correct) return value === q.answer ? 'correct' : 'dim'
    return value === a.value ? 'wrong' : 'idle'
  }
  // Visual state for a compare panel.
  const cmpState = (side) => {
    if (!a) return 'idle'
    if (a.correct) return side === q.answerSide ? 'correct' : 'dim'
    return side === a.side ? 'wrong' : 'idle'
  }

  const isNumberQ = q.kind === 'add' || q.kind === 'sub'

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', animation: 'fadeUp .3s ease', background: `linear-gradient(${cfg.tint}, #fffaf0)` }}>
      {/* header */}
      <div style={{ flex: '0 0 auto', padding: '14px 14px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} style={{ flex: '0 0 auto', width: 44, height: 44, borderRadius: '50%', border: `3px solid ${INK}`, background: '#fffaf0', fontSize: 20, cursor: 'pointer', boxShadow: `2px 3px 0 ${INK}`, color: INK }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 19, lineHeight: 1 }}>{cfg.name}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const done = i < qIndex
              const cur = i === qIndex
              return <div key={i} style={{ flex: 1, height: 9, borderRadius: 6, border: `2px solid ${INK}`, background: done ? '#7fb069' : cur ? '#ffd873' : '#fffaf0' }} />
            })}
          </div>
        </div>
        <div style={{ flex: '0 0 auto', fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 15, background: '#fffaf0', border: `2.5px solid ${INK}`, borderRadius: 14, padding: '4px 9px', boxShadow: `2px 3px 0 ${INK}` }}>Lvl {levelNum}</div>
      </div>

      {/* body */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px 18px 20px', gap: 16, textAlign: 'center' }}>
        <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 700, fontSize: 23, color: INK, textWrap: 'balance' }}>{q.prompt}</div>

        {isNumberQ && (
          <>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.66)', border: `3px solid ${INK}`, borderRadius: '26px 30px 24px 32px / 30px 24px 32px 26px', boxShadow: `3px 4px 0 ${INK}`, padding: '18px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              {q.kind === 'add' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, maxWidth: 150 }}>
                    {Array.from({ length: q.a }).map((_, k) => <span key={k} style={{ fontSize: emojiSize(q.a + q.b), lineHeight: 1.05 }}>{q.animal}</span>)}
                  </div>
                  <span style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 34, color: '#c0553f' }}>+</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, maxWidth: 150 }}>
                    {Array.from({ length: q.b }).map((_, k) => <span key={k} style={{ fontSize: emojiSize(q.a + q.b), lineHeight: 1.05 }}>{q.animal}</span>)}
                  </div>
                </div>
              )}

              {q.kind === 'sub' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, maxWidth: 280 }}>
                  {Array.from({ length: q.a }).map((_, k) => {
                    const gone = k >= q.a - q.b
                    return <span key={k} style={{ fontSize: emojiSize(q.a), lineHeight: 1.05, opacity: gone ? 0.28 : 1, filter: gone ? 'grayscale(1)' : 'none' }}>{q.animal}</span>
                  })}
                </div>
              )}

              <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 30, color: INK, letterSpacing: 1 }}>
                {q.kind === 'add' ? `${q.a} + ${q.b}` : `${q.a} − ${q.b}`} = <span style={{ color: '#c0553f' }}>?</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
              {(q.choices || []).map((v, idx) => (
                <button key={idx} onClick={() => onAnswer(v)} style={choiceStyle(numState(v))}>{v}</button>
              ))}
            </div>
          </>
        )}

        {q.kind === 'compare' && (
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            {[
              { side: 'A', count: q.countA, animal: q.animalA },
              { side: 'B', count: q.countB, animal: q.animalB },
            ].map((p) => (
              <button key={p.side} onClick={() => onAnswerCompare(p.side)} style={panelStyle(cmpState(p.side))}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: 2, minHeight: 120 }}>
                  {Array.from({ length: p.count }).map((_, k) => <span key={k} style={{ fontSize: emojiSize(p.count), lineHeight: 1.05 }}>{p.animal}</span>)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {a && (
        <div style={{ position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)', background: a.correct ? '#7fb069' : '#ef8354', color: '#fffaf0', fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 22, padding: '12px 28px', borderRadius: 22, border: `3px solid ${INK}`, boxShadow: `3px 4px 0 ${INK}`, animation: 'toastIn .25s ease', whiteSpace: 'nowrap', zIndex: 5 }}>
          {a.correct ? 'Yay! Correct! 🎉' : 'Oops — try again! 💪'}
        </div>
      )}
    </div>
  )
}
