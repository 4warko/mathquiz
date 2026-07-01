import BottomNav from '../components/BottomNav'

export default function CollectionScreen({ levels, collected, friendsCount, onNavigate }) {
  return (
    <div className="screen screen--collection">
      <header className="topbar topbar--glass">
        <button type="button" className="icon-btn tap" aria-label="Back to map" onClick={() => onNavigate('map')}>
          <span aria-hidden="true">←</span>
        </button>
        <div className="topbar__grow">
          <div className="topbar__title">My Animal Friends</div>
          <div className="topbar__sub">{friendsCount} of {levels.length} found</div>
        </div>
      </header>

      <div className="coll-grid">
        {levels.map((cfg, i) => {
          const unlocked = collected.includes(i + 1)
          return (
            <div key={i} className={`friend${unlocked ? '' : ' friend--locked'}`}>
              <div className="friend__emoji" aria-hidden="true">{unlocked ? cfg.unlock.emoji : '❓'}</div>
              <div className="friend__name">{unlocked ? cfg.unlock.name : '???'}</div>
            </div>
          )
        })}
      </div>

      <BottomNav active="collection" onNavigate={onNavigate} />
    </div>
  )
}
