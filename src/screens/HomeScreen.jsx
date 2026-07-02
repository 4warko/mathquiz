import useFocusOnMount from '../useFocusOnMount'
import Scenery from '../components/Scenery'

export default function HomeScreen({ totalStars, friendsCount, collectedAnimals = [], name = 'Holly', avatar = '🐰', onPlay, onFriends, onPractice, onOpenSettings }) {
  const titleRef = useFocusOnMount()
  return (
    <div className="screen screen--home home">
      <Scenery scene="sky" />
      <button type="button" className="home__settings icon-btn tap" aria-label="Grown-up settings" onClick={onOpenSettings}>
        <span aria-hidden="true">⚙️</span>
      </button>

      <div className="home__top">
        <div className="home__hero" aria-hidden="true">{avatar}</div>
        <h1 className="home__title" ref={titleRef} tabIndex={-1}>{`${name}'s Animal Math`}</h1>
        <p className="home__sub">Let&apos;s practice counting and meet new animal friends!</p>
        <div className="topbar__actions" style={{ marginTop: 'var(--s-2)' }}>
          <span className="pill pill--star"><span aria-hidden="true">⭐</span> {totalStars}</span>
          <span className="pill pill--friends"><span aria-hidden="true">🐾</span> {friendsCount}</span>
        </div>
      </div>

      {collectedAnimals.length > 0 && (
        <div className="home__menagerie" aria-label={`${collectedAnimals.length} animal friends collected`}>
          {collectedAnimals.map((e, i) => <span key={i} aria-hidden="true">{e}</span>)}
        </div>
      )}

      <div className="home__actions">
        <button type="button" className="btn btn--primary btn--lg btn--block tap" onClick={onPlay}>
          <span aria-hidden="true">▶</span> Play
        </button>
        <button type="button" className="btn btn--block tap" onClick={onFriends}>
          <span aria-hidden="true">🐾</span> My Friends
        </button>
        <button type="button" className="btn btn--block tap" onClick={onPractice}>
          <span aria-hidden="true">🎲</span> Surprise Round
        </button>
      </div>
    </div>
  )
}
