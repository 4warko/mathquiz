import { useEffect, useState } from 'react'
import useFocusOnMount from '../useFocusOnMount'

// A small "grown-up" area: toggle sound and (with a confirm step) reset progress.
// Rendered as an accessible dialog overlay so it works from any screen.
export default function SettingsModal({ muted, onToggleMute, onReset, onClose }) {
  const titleRef = useFocusOnMount()
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="settings-title" className="modal__title" ref={titleRef} tabIndex={-1}>
          Grown-Up Zone
        </h2>

        <button
          type="button"
          className="setting-row tap"
          role="switch"
          aria-checked={!muted}
          onClick={onToggleMute}
        >
          <span className="setting-row__label">
            <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span> Sound
          </span>
          <span className={`toggle${muted ? '' : ' toggle--on'}`} aria-hidden="true">
            <span className="toggle__knob" />
          </span>
        </button>

        {confirming ? (
          <div className="setting-confirm">
            <p className="setting-confirm__q">Erase all stars and animal friends?</p>
            <div className="setting-confirm__actions">
              <button type="button" className="btn btn--block tap" onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--danger btn--block tap"
                onClick={() => { onReset(); setConfirming(false) }}
              >
                Erase
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="setting-row setting-row--reset tap" onClick={() => setConfirming(true)}>
            <span className="setting-row__label"><span aria-hidden="true">🗑️</span> Reset progress</span>
            <span className="setting-row__hint" aria-hidden="true">›</span>
          </button>
        )}

        <button
          type="button"
          className="btn btn--primary btn--block tap"
          style={{ marginTop: 'var(--s-4)' }}
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  )
}
