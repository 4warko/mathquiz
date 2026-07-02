import { emojiSize } from '../game'
import useFocusOnMount from '../useFocusOnMount'
import Scenery from '../components/Scenery'

export default function PlayScreen({ cfg, levelNum, practice, question, qIndex, answered, hint, muted, onToggleMute, onBack, onAnswer, onAnswerCompare }) {
  const titleRef = useFocusOnMount()
  const q = question || {}
  const a = answered

  // Visual state for a number choice button. After a couple of misses the
  // correct answer pulses ("hint") and the distractors dim to guide the child.
  const numState = (value) => {
    if (!a) {
      if (hint) return value === q.answer ? 'hint' : 'dim'
      return 'idle'
    }
    if (a.correct) return value === q.answer ? 'correct' : 'dim'
    return value === a.value ? 'wrong' : 'idle'
  }
  // Visual state for a compare panel (same hint scaffolding).
  const cmpState = (side) => {
    if (!a) {
      if (hint) return side === q.answerSide ? 'hint' : 'dim'
      return 'idle'
    }
    if (a.correct) return side === q.answerSide ? 'correct' : 'dim'
    return side === a.side ? 'wrong' : 'idle'
  }

  const isNumberQ = q.kind === 'add' || q.kind === 'sub' || q.kind === 'seq' || q.kind === 'bond' || q.kind === 'pattern' || q.kind === 'numline' || q.kind === 'tenframe'

  return (
    <div className="screen screen--play" style={{ '--accent': cfg.accent, '--tint': cfg.tint }}>
      <Scenery scene={cfg.scene} />
      <header className="topbar">
        <button type="button" className="icon-btn tap" aria-label="Back to map" onClick={onBack}>
          <span aria-hidden="true">←</span>
        </button>
        <div className="topbar__grow">
          <h1 className="topbar__title" style={{ fontSize: 'var(--fs-lg)' }} ref={titleRef} tabIndex={-1}>{cfg.name}</h1>
          <div className="progress" aria-label={`Question ${qIndex + 1} of 5`}>
            {[0, 1, 2, 3, 4].map((i) => {
              const cls = i < qIndex ? 'dot dot--done' : i === qIndex ? 'dot dot--cur' : 'dot'
              return <span key={i} className={cls} />
            })}
          </div>
        </div>
        <div className="topbar__actions">
          <button
            type="button"
            className="icon-btn tap"
            aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
            aria-pressed={!muted}
            onClick={onToggleMute}
          >
            <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
          </button>
          <span className="lvl-badge">{practice ? '🎲 Practice' : `Lvl ${levelNum}`}</span>
        </div>
      </header>

      <div className="play__stage">
        <div className="buddy-wrap" aria-hidden="true">
          <div className={`buddy${a?.correct ? ' buddy--cheer' : a ? ' buddy--oops' : ''}`}>{cfg.unlock.emoji}</div>
          <div className="buddy__ground" />
        </div>

        {/* Persistent live region — reliably announces the result to screen readers. */}
        <div className="sr-only" aria-live="assertive">
          {a ? (a.correct ? 'Correct!' : 'Not quite, try again.') : ''}
        </div>

        {a && (
          <div className={`toast ${a.correct ? 'toast--ok' : 'toast--no'}`} aria-hidden="true">
            {a.correct ? 'Yay! Correct! 🎉' : 'Oops — try again! 💪'}
          </div>
        )}

        <p className="prompt">{q.prompt}</p>

        {hint && !a && <p className="hint-tip" role="status">Tap the glowing one! ✨</p>}

        {(isNumberQ || q.kind === 'clock') && (
          <div className="qcard">
            {q.kind === 'add' && (
              <>
                <div className="eq-row">
                  <div className="eq-group" style={{ fontSize: emojiSize(q.a + q.b) }}>
                    {Array.from({ length: q.a }).map((_, k) => <span key={k} className="emoji" aria-hidden="true">{q.animal}</span>)}
                  </div>
                  <span className="eq-plus" aria-hidden="true">+</span>
                  <div className="eq-group" style={{ fontSize: emojiSize(q.a + q.b) }}>
                    {Array.from({ length: q.b }).map((_, k) => <span key={k} className="emoji" aria-hidden="true">{q.animal}</span>)}
                  </div>
                </div>
                <div className="eq-line">{q.a} + {q.b} = <span className="eq-q">?</span></div>
              </>
            )}

            {q.kind === 'sub' && (
              <>
                <div className="sub-grid" style={{ fontSize: emojiSize(q.a) }}>
                  {Array.from({ length: q.a }).map((_, k) => (
                    <span key={k} className={`emoji${k >= q.a - q.b ? ' is-gone' : ''}`} aria-hidden="true">{q.animal}</span>
                  ))}
                </div>
                <div className="eq-line">{q.a} − {q.b} = <span className="eq-q">?</span></div>
              </>
            )}

            {q.kind === 'bond' && (
              <>
                <div className="eq-group" style={{ fontSize: emojiSize(q.a) }}>
                  {Array.from({ length: q.a }).map((_, k) => <span key={k} className="emoji" aria-hidden="true">{q.animal}</span>)}
                </div>
                <div className="eq-line">{q.a} + <span className="eq-q">?</span> = {q.total}</div>
              </>
            )}

            {q.kind === 'seq' && (
              <div className="seq-row">
                {q.seq.map((n, k) => <span key={k} className="seq-box">{n}</span>)}
                <span className="seq-box seq-box--q" aria-hidden="true">?</span>
              </div>
            )}

            {q.kind === 'pattern' && (
              <div className="pattern-row" aria-hidden="true">
                {q.seq.map((s, k) => <span key={k} className="pattern-tile">{s}</span>)}
                <span className="pattern-tile pattern-tile--q">?</span>
              </div>
            )}

            {q.kind === 'tenframe' && (
              <div className="tenframe" role="img" aria-label="A ten-frame">
                {Array.from({ length: 10 }).map((_, k) => (
                  <span key={k} className={`tenframe__cell${k < q.filled ? ' tenframe__cell--on' : ''}`}>
                    {k < q.filled ? q.animal : ''}
                  </span>
                ))}
              </div>
            )}

            {q.kind === 'numline' && (
              <div className="numline" role="img" aria-label="A number line with a pin on a tick">
                <div className="numline__inner">
                  <div className="numline__track" />
                  {Array.from({ length: q.max + 1 }).map((_, k) => (
                    <span key={k} className={`numline__tick${k % 5 === 0 ? ' numline__tick--major' : ''}`} style={{ left: `${(k / q.max) * 100}%` }} />
                  ))}
                  <span className="numline__pin" style={{ left: `${(q.target / q.max) * 100}%` }} />
                  <span className="numline__end" style={{ left: '0%' }}>0</span>
                  <span className="numline__end" style={{ left: '100%' }}>{q.max}</span>
                </div>
              </div>
            )}

            {q.kind === 'clock' && (
              <div className="clock" role="img" aria-label="A clock face — read the time">
                <span className="clock__num clock__num--t">12</span>
                <span className="clock__num clock__num--r">3</span>
                <span className="clock__num clock__num--b">6</span>
                <span className="clock__num clock__num--l">9</span>
                <span className="clock__hand clock__hand--hour" style={{ transform: `translateX(-50%) rotate(${q.hourAngle}deg)` }} />
                <span className="clock__hand clock__hand--min" style={{ transform: `translateX(-50%) rotate(${q.minAngle}deg)` }} />
                <span className="clock__center" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="play__actions">
        {(isNumberQ || q.kind === 'shape') && (
          <div className="choices">
            {(q.choices || []).map((v) => (
              <button key={v} type="button" className="choice tap" data-state={numState(v)} onClick={() => onAnswer(v)}>
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

        {q.kind === 'ncompare' && (
          <div className="compare">
            {[
              { side: 'A', n: q.numA },
              { side: 'B', n: q.numB },
            ].map((p) => (
              <button
                key={p.side}
                type="button"
                className="panel panel--num tap"
                data-state={cmpState(p.side)}
                aria-label={`Number ${p.n}`}
                onClick={() => onAnswerCompare(p.side)}
              >
                <span className="num-big">{p.n}</span>
              </button>
            ))}
          </div>
        )}

        {q.kind === 'clock' && (
          <div className="time-choices">
            {(q.choices || []).map((v) => (
              <button key={v} type="button" className="time-choice tap" data-state={numState(v)} onClick={() => onAnswer(v)}>
                {v}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
