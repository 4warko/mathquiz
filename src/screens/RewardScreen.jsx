import { useMemo } from 'react'
import { rand } from '../game'
import useFocusOnMount from '../useFocusOnMount'

const CHEERS = {
  3: ['Holly, that was a PERFECT 10! 🤸', 'Gold medal, Holly! Flawless landing! 🥇', 'Wow — you stuck every landing! 🤸‍♀️'],
  2: ['Great tumbling, Holly! 🌟', 'So close to a perfect 10 — bravo! 🌟', 'Super work, superstar! ✨'],
  1: ['You did it, Holly! 💪', 'Nice work — keep on tumbling! 🤸', 'Every champ practices — well done! 🌟'],
}

export default function RewardScreen({ cfg, levelNum, stars, justNew, onContinue }) {
  const labelRef = useFocusOnMount()
  // Pick cheer + confetti once per reward screen (not on every render).
  const cheer = useMemo(() => {
    const arr = CHEERS[stars] || CHEERS[1]
    return arr[rand(0, arr.length - 1)]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelNum, stars])

  const confetti = useMemo(
    () =>
      Array.from({ length: 42 }, () => ({
        left: `${rand(0, 100)}%`,
        width: rand(8, 13),
        height: rand(12, 18),
        color: rand(0, 5), // maps to .confetti--0..5 (see tokens --joy-*)
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
        {confetti.map((c, i) => (
          <div
            key={i}
            className={`confetti confetti--${c.color}`}
            style={{ left: c.left, width: c.width, height: c.height, borderRadius: c.borderRadius, animation: `confettiFall ${c.duration}s linear ${c.delay}s 3` }}
          />
        ))}
      </div>

      <div className="reward__card">
        <div className="reward__label" ref={labelRef} tabIndex={-1}>LEVEL {levelNum} COMPLETE</div>

        <div className="stars">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`star${i < stars ? '' : ' is-empty'}`} style={{ animationDelay: `${0.15 + i * 0.22}s` }} aria-hidden="true">⭐</span>
          ))}
        </div>

        <div className="reward__animal" aria-hidden="true">{cfg.unlock.emoji}</div>

        {justNew ? (
          <>
            <div className="reward__title">You found {cfg.unlock.name}! 🎉</div>
            <div className="reward__sub">A new friend joined your collection</div>
          </>
        ) : (
          <div className="reward__title">{cfg.unlock.name} is so proud!</div>
        )}

        <div className="reward__cheer">{cheer}</div>

        <button type="button" className="btn btn--primary btn--lg btn--block tap" style={{ marginTop: 'var(--s-4)' }} onClick={onContinue}>
          Keep going <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}
