import { emojiSize } from '../game'

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
    <div className="screen screen--play" style={{ '--accent': cfg.accent, '--tint': cfg.tint }}>
      <header className="topbar">
        <button type="button" className="icon-btn tap" aria-label="Back to map" onClick={onBack}>
          <span aria-hidden="true">←</span>
        </button>
        <div className="topbar__grow">
          <div className="topbar__title" style={{ fontSize: 'var(--fs-lg)' }}>{cfg.name}</div>
          <div className="progress" aria-label={`Question ${qIndex + 1} of 5`}>
            {[0, 1, 2, 3, 4].map((i) => {
              const cls = i < qIndex ? 'dot dot--done' : i === qIndex ? 'dot dot--cur' : 'dot'
              return <span key={i} className={cls} />
            })}
          </div>
        </div>
        <span className="lvl-badge">Lvl {levelNum}</span>
      </header>

      <div className="play__stage">
        {a && (
          <div className={`toast ${a.correct ? 'toast--ok' : 'toast--no'}`} role="status">
            {a.correct ? 'Yay! Correct! 🎉' : 'Oops — try again! 💪'}
          </div>
        )}

        <p className="prompt">{q.prompt}</p>

        {isNumberQ && (
          <div className="qcard">
            {q.kind === 'add' && (
              <div className="eq-row">
                <div className="eq-group" style={{ fontSize: emojiSize(q.a + q.b) }}>
                  {Array.from({ length: q.a }).map((_, k) => <span key={k} className="emoji" aria-hidden="true">{q.animal}</span>)}
                </div>
                <span className="eq-plus" aria-hidden="true">+</span>
                <div className="eq-group" style={{ fontSize: emojiSize(q.a + q.b) }}>
                  {Array.from({ length: q.b }).map((_, k) => <span key={k} className="emoji" aria-hidden="true">{q.animal}</span>)}
                </div>
              </div>
            )}

            {q.kind === 'sub' && (
              <div className="sub-grid" style={{ fontSize: emojiSize(q.a) }}>
                {Array.from({ length: q.a }).map((_, k) => (
                  <span key={k} className={`emoji${k >= q.a - q.b ? ' is-gone' : ''}`} aria-hidden="true">{q.animal}</span>
                ))}
              </div>
            )}

            <div className="eq-line">
              {q.kind === 'add' ? `${q.a} + ${q.b}` : `${q.a} − ${q.b}`} = <span className="eq-q">?</span>
            </div>
          </div>
        )}
      </div>

      <div className="play__actions">
        {isNumberQ && (
          <div className="choices">
            {(q.choices || []).map((v, idx) => (
              <button key={idx} type="button" className="choice tap" data-state={numState(v)} onClick={() => onAnswer(v)}>
                {v}
              </button>
            ))}
          </div>
        )}

        {q.kind === 'compare' && (
          <div className="compare">
            {[
              { side: 'A', count: q.countA, animal: q.animalA },
              { side: 'B', count: q.countB, animal: q.animalB },
            ].map((p) => (
              <button
                key={p.side}
                type="button"
                className="panel tap"
                data-state={cmpState(p.side)}
                aria-label={`Group with ${p.count}`}
                onClick={() => onAnswerCompare(p.side)}
              >
                <div className="panel__items" style={{ fontSize: emojiSize(p.count) }}>
                  {Array.from({ length: p.count }).map((_, k) => <span key={k} className="emoji" aria-hidden="true">{p.animal}</span>)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
