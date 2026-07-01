export default function HomeScreen({ totalStars, friendsCount, onPlay, onFriends }) {
  return (
    <div className="screen screen--home home">
      <div className="home__top">
        <div className="home__hero" aria-hidden="true">🐰</div>
        <h1 className="home__title">Holly&apos;s Animal Math</h1>
        <p className="home__sub">Let&apos;s practice counting and meet new animal friends!</p>
        <div className="topbar__actions" style={{ marginTop: 'var(--s-2)' }}>
          <span className="pill pill--star"><span aria-hidden="true">⭐</span> {totalStars}</span>
          <span className="pill pill--friends"><span aria-hidden="true">🐾</span> {friendsCount}</span>
        </div>
      </div>

      <div className="home__actions">
        <button type="button" className="btn btn--primary btn--lg btn--block tap" onClick={onPlay}>
          <span aria-hidden="true">▶</span> Play
        </button>
        <button type="button" className="btn btn--block tap" onClick={onFriends}>
          <span aria-hidden="true">🐾</span> My Friends
        </button>
      </div>
    </div>
  )
}
