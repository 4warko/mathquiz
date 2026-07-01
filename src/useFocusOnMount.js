import { useEffect, useRef } from 'react'

// Move focus to a screen's heading when it mounts so screen readers
// (VoiceOver) announce the new context on navigation. Pair with tabIndex={-1}.
// Programmatic focus doesn't trigger :focus-visible, so no ring is shown.
export default function useFocusOnMount() {
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return ref
}
