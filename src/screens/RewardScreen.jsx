import { useMemo } from 'react'
import { INK, rand } from '../game'

const CHEERS = {
  3: ['Holly, that was a PERFECT 10! 🤸', 'Gold medal, Holly! Flawless landing! 🥇', 'Wow — you stuck every landing! 🤸‍♀️'],
  2: ['Great tumbling, Holly! 🌟', 'So close to a perfect 10 — bravo! 🌟', 'Super work, superstar! ✨'],
  1: ['You did it, Holly! 💪', 'Nice work — keep on tumbling! 🤸', 'Every champ practices — well done! 🌟'],
}

const CONFETTI_COLORS = ['#ef8354', '#7fb069', '#5aa9d6', '#f2c14e', '#d0587e', '#9b6bce']

export default function RewardScreen({ cfg, levelNum, stars, justNew, onContinue }) {
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
        background: CONFETTI_COLORS[rand(0, CONFETTI_COLORS.length - 1)],
        borderRadius: rand(0, 1) ? '2px' : '50%',
        duration: rand(24, 40) / 10,
        delay: rand(0, 18) / 10,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [levelNum],
  )

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '28px 24px', background: `radial-gradient(circle at 50% 28%, #fff8ee, ${cfg.tint})` }}>
      {confetti.map((c, i) => (
        <div key={i} style={{ position: 'absolute', top: '-6%', left: c.left, width: c.width, height: c.height, background: c.background, borderRadius: c.borderRadius, animation: `confettiFall ${c.duration}s linear ${c.delay}s infinite`, zIndex: 1 }} />
      ))}

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 15, letterSpacing: 2, color: '#7a6a58' }}>LEVEL {levelNum} COMPLETE</div>

        <div style={{ display: 'flex', gap: 6, margin: '2px 0 8px' }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ fontSize: 40, filter: i < stars ? 'none' : 'grayscale(1)', opacity: i < stars ? 1 : 0.35, animation: 'popIn .5s ease both', animationDelay: `${0.15 + i * 0.22}s` }}>⭐</span>
          ))}
        </div>

        <div style={{ fontSize: 104, lineHeight: 1, animation: 'cheerBounce 1.1s ease-in-out infinite' }}>{cfg.unlock.emoji}</div>

        {justNew ? (
          <>
            <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 26, color: INK }}>You found {cfg.unlock.name}! 🎉</div>
            <div style={{ fontSize: 18, color: '#7a6a58' }}>A new friend joined your collection</div>
          </>
        ) : (
          <div style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 26, color: INK }}>{cfg.unlock.name} is so proud!</div>
        )}

        <div style={{ fontSize: 20, color: INK, marginTop: 6, maxWidth: 280, textWrap: 'balance' }}>{cheer}</div>

        <button onClick={onContinue} style={{ marginTop: 22, fontFamily: "'Baloo 2', cursive", fontWeight: 800, fontSize: 22, color: '#fffaf0', background: '#ef8354', border: `3px solid ${INK}`, borderRadius: '20px 24px 18px 26px / 24px 18px 26px 20px', padding: '14px 34px', boxShadow: `3px 5px 0 ${INK}`, cursor: 'pointer' }}>Keep going →</button>
      </div>
    </div>
  )
}
