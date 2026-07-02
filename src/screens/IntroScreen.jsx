import { howToPlay } from '../game'
import useFocusOnMount from '../useFocusOnMount'
import Scenery from '../components/Scenery'

// Quick "here's what's next" step so young players are oriented before a level.
export default function IntroScreen({ cfg, levelNum, known, onStart, onBack }) {
  const titleRef = useFocusOnMount()
  return (
    <div className="screen screen--intro intro" style={{ '--accent': cfg.accent, '--tint': cfg.tint }}>
      <Scenery scene={cfg.scene} />
      <div className="intro__card">
        <div className="intro__label">LEVEL {levelNum}</div>
        <h1 className="intro__world" ref={titleRef} tabIndex={-1}>{cfg.name}</h1>
        <div className="intro__animal" aria-hidden="true">{known ? cfg.unlock.emoji : '❓'}</div>
        <p className="intro__how">{howToPlay(cfg)}</p>
        <p className="reward__sub">
          {known ? `${cfg.unlock.name} is cheering you on!` : 'Finish to unlock a surprise friend!'}
        </p>

        <div className="intro__actions">
          <button type="button" className="btn btn--primary btn--lg btn--block tap" onClick={onStart}>
            Let&apos;s go! <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="btn btn--block tap" onClick={onBack}>
            <span aria-hidden="true">←</span> Back to map
          </button>
        </div>
      </div>
    </div>
  )
}
