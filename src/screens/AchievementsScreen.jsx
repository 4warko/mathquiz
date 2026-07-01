import BottomNav from '../components/BottomNav'
import useFocusOnMount from '../useFocusOnMount'
import { ACHIEVEMENTS } from '../achievements'

export default function AchievementsScreen({ ctx, onNavigate }) {
  const titleRef = useFocusOnMount()
  const earned = ACHIEVEMENTS.filter((a) => a.value(ctx) >= a.target).length

  return (
    <div className="screen screen--awards">
      <header className="topbar topbar--glass">
        <button type="button" className="icon-btn tap" aria-label="Back to map" onClick={() => onNavigate('map')}>
          <span aria-hidden="true">←</span>
        </button>
        <div className="topbar__grow">
          <h1 className="topbar__title" ref={titleRef} tabIndex={-1}>Awards</h1>
          <div className="topbar__sub">{earned} of {ACHIEVEMENTS.length} earned</div>
        </div>
      </header>

      <div className="awards-list">
        {ACHIEVEMENTS.map((a) => {
          const raw = a.value(ctx)
          const unlocked = raw >= a.target
          const shown = Math.min(raw, a.target)
          const pct = Math.round((shown / a.target) * 100)
          return (
            <div key={a.id} className={`award${unlocked ? ' award--done' : ''}`}>
              <div className="award__icon" aria-hidden="true">{unlocked ? a.icon : '🔒'}</div>
              <div className="award__body">
                <div className="award__title">{a.title}{unlocked ? ' ✓' : ''}</div>
                <div className="award__desc">{a.desc}</div>
                {!unlocked && (
                  <div className="award__progress">
                    <div className="award__bar"><div className="award__bar-fill" style={{ width: `${pct}%` }} /></div>
                    <span className="award__count">{shown}/{a.target}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <BottomNav active="awards" onNavigate={onNavigate} />
    </div>
  )
}
