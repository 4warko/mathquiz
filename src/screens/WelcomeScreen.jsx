import { useState } from 'react'
import useFocusOnMount from '../useFocusOnMount'

const AVATARS = ['🐰', '🐱', '🐶', '🦄', '🦊', '🐨']

// First-run (and re-editable) profile step: enter a name and pick a buddy so
// the game greets whoever is playing — Holly, or a friend's kid.
export default function WelcomeScreen({ initialName = '', initialAvatar = '🐰', onDone }) {
  const titleRef = useFocusOnMount()
  const [name, setName] = useState(initialName)
  const [avatar, setAvatar] = useState(initialAvatar)
  const trimmed = name.trim()

  return (
    <div className="screen screen--welcome welcome">
      <div className="welcome__card">
        <div className="welcome__hero" aria-hidden="true">{avatar}</div>
        <h1 className="welcome__title" ref={titleRef} tabIndex={-1}>Who&apos;s playing?</h1>
        <p className="welcome__sub">Type your name and pick a buddy!</p>

        <input
          className="welcome__input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 12))}
          placeholder="Your name"
          aria-label="Your name"
          autoComplete="off"
          autoCapitalize="words"
          maxLength={12}
        />

        <div className="welcome__avatars" role="radiogroup" aria-label="Pick a buddy">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              className={`welcome__avatar tap${avatar === a ? ' is-picked' : ''}`}
              role="radio"
              aria-checked={avatar === a}
              aria-label={`Buddy ${a}`}
              onClick={() => setAvatar(a)}
            >
              <span aria-hidden="true">{a}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn--primary btn--lg btn--block tap"
          disabled={!trimmed}
          onClick={() => onDone(trimmed, avatar)}
        >
          Let&apos;s play! <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}
