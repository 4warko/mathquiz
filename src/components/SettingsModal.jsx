import { useEffect, useRef, useState } from 'react'

// Accessible modal dialog: focus is trapped while open and restored to the
// trigger on close (WAI-ARIA dialog pattern + WCAG 2.4.3).
export default function SettingsModal({ muted, music, onToggleMute, onToggleMusic, onReset, onChangeName, onClose }) {
  const dialogRef = useRef(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const dialog = dialogRef.current
    dialog?.querySelector('h2')?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const items = Array.from(
        dialog?.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])') || [],
      ).filter((el) => !el.disabled && el.offsetParent !== null)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="settings-title" className="modal__title" tabIndex={-1}>
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
            <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span> Sound effects
          </span>
          <span className={`toggle${muted ? '' : ' toggle--on'}`} aria-hidden="true">
            <span className="toggle__knob" />
          </span>
        </button>

        <button
          type="button"
          className="setting-row tap"
          role="switch"
          aria-checked={music}
          onClick={onToggleMusic}
        >
          <span className="setting-row__label">
            <span aria-hidden="true">🎵</span> Music
          </span>
          <span className={`toggle${music ? ' toggle--on' : ''}`} aria-hidden="true">
            <span className="toggle__knob" />
          </span>
        </button>

        <button type="button" className="setting-row tap" onClick={onChangeName}>
          <span className="setting-row__label"><span aria-hidden="true">✏️</span> Change name</span>
          <span className="setting-row__hint" aria-hidden="true">›</span>
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
