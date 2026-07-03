import { useMemo } from 'react'
import { rand } from '../game'
import useFocusOnMount from '../useFocusOnMount'
import { themeForStars } from '../themes'

const cheersFor = (name) => ({
  3: [`${name}, that was a PERFECT 10! 🤸`, `Gold medal, ${name}! Flawless landing! 🥇`, `Wow ${name} — you stuck every landing! 🤸‍♀️`],
  2: [`Great tumbling, ${name}! 🌟`, 'So close to a perfect 10 — bravo! 🌟', 'Super work, superstar! ✨'],
  1: [`You did it, ${name}! 💪`, 'Nice work — keep it up! 🤸', 'Every champ practices — well done! 🌟'],
})

export default function RewardScreen({ cfg, levelNum, practice, challenge = null, name = 'Holly', totalStars = 0, newTheme = null, stars, justNew, worldComplete, worldAnimals, newBadges = [], hasNext, onNext, onContinue }) {
  const headingRef = useFocusOnMount()
  const theme = themeForStars(totalStars)
  const swaying = useMemo(() => rand(0, 1) === 1, [])
  // Pick cheer + confetti once per reward screen (not on every render).
  const cheer = useMemo(() => {
    const map = cheersFor(name)
    const arr = map[stars] || map[1]
    return arr[rand(0, arr.length - 1)]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelNum, stars, name])

  const confetti = useMemo(
    () =>
      Array.from({ length: 42 }, () => ({
        left: `${rand(0, 100)}%`,
        width: rand(8, 13),
        height: rand(12, 18),
        color: rand(0, 5), // maps to .confetti--0..5 (see tokens --joy-*)
        piece: theme.kind === 'emoji' ? theme.pieces[rand(0, theme.pieces.length - 1)] : null,
        borderRadius: rand(0, 1) ? '2px' : '50%',
        duration: rand(24, 40) / 10,
        delay: rand(0, 18) / 10,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [levelNum],
  )

  return (
    <div className="screen screen--reward" style={{ '--accent': cfg.accent, '--tint': cfg.tint }}>
      <div className="confetti-layer" aria-hidden="true">
        {confetti.map((c, i) =>
          c.piece ? (
            <span
              key={i}
              className="confetti confetti--emoji"
              style={{ left: c.left, fontSize: `${c.width + 10}px`, animation: `confettiFall ${c.duration}s linear ${c.delay}s 3` }}
            >
              {c.piece}
            </span>
          ) : (
            <div
              key={i}
              className={`confetti confetti--${c.color}`}
              style={{ left: c.left, width: c.width, height: c.height, borderRadius: c.borderRadius, animation: `confettiFall ${c.duration}s linear ${c.delay}s 3` }}
            />
          ),
        )}
      </div>

      <div className="reward__card">
        <p className="reward__label">{challenge != null ? `WORLD ${challenge + 1} CHALLENGE` : practice ? 'PRACTICE COMPLETE' : `LEVEL ${levelNum} COMPLETE`}</p>

        <div className="stars">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`star${i < stars ? '' : ' is-empty'}`} style={{ animationDelay: `${0.15 + i * 0.22}s` }} aria-hidden="true">⭐</span>
          ))}
        </div>

        {worldComplete && <div className="reward__world">🎉 World Complete! 🎉</div>}

        <div className={`reward__animal${swaying ? ' reward__animal--sway' : ''}`} aria-hidden="true">{cfg.unlock.emoji}</div>

        <h1 className="reward__title" ref={headingRef} tabIndex={-1}>
          {challenge != null ? 'Challenge complete! 🏆' : practice ? 'Great practice! 🎲' : justNew ? `You found ${cfg.unlock.name}! 🎉` : `${cfg.unlock.name} is so proud!`}
        </h1>
        {challenge != null ? (
          <p className="reward__sub">You beat the whole world!</p>
        ) : practice ? (
          <p className="reward__sub">You reviewed lots of skills</p>
        ) : justNew ? (
          <p className="reward__sub">A new friend joined your collection</p>
        ) : null}

        <div className="reward__cheer">{cheer}</div>

        {(worldComplete || challenge != null) && worldAnimals.length > 0 && (
          <div className="reward__world-animals" aria-hidden="true">
            {worldAnimals.map((e, i) => <span key={i}>{e}</span>)}
          </div>
        )}

        {newBadges.length > 0 && (
          <div className="reward__badges">
            {newBadges.map((b) => (
              <div key={b.id} className="reward__badge">
                <span className="reward__badge-icon" aria-hidden="true">{b.icon}</span>
                <span>New badge — {b.title}!</span>
              </div>
            ))}
          </div>
        )}

        {newTheme && (
          <div className="reward__badges">
            <div className="reward__badge">
              <span className="reward__badge-icon" aria-hidden="true">✨</span>
              <span>New celebration — {newTheme}!</span>
            </div>
          </div>
        )}

        <div className="reward__actions">
          {challenge != null ? (
            <>
              <button type="button" className="btn btn--primary btn--lg btn--block tap" onClick={onNext}>
                <span aria-hidden="true">🏆</span> Play again
              </button>
              <button type="button" className="btn btn--block tap" onClick={onContinue}>
                <span aria-hidden="true">🗺️</span> Back to map
              </button>
            </>
          ) : practice ? (
            <>
              <button type="button" className="btn btn--primary btn--lg btn--block tap" onClick={onNext}>
                <span aria-hidden="true">🎲</span> Play again
              </button>
              <button type="button" className="btn btn--block tap" onClick={onContinue}>
                <span aria-hidden="true">🏠</span> Back home
              </button>
            </>
          ) : hasNext ? (
            <>
              <button type="button" className="btn btn--primary btn--lg btn--block tap" onClick={onNext}>
                Next level <span aria-hidden="true">→</span>
              </button>
              <button type="button" className="btn btn--block tap" onClick={onContinue}>
                <span aria-hidden="true">🗺️</span> Back to map
              </button>
            </>
          ) : (
            <button type="button" className="btn btn--primary btn--lg btn--block tap" onClick={onContinue}>
              <span aria-hidden="true">🏆</span> You did it all — back to map
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
