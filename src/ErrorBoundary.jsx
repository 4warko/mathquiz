import { Component } from 'react'

// Catches render/runtime errors so one bad state shows a friendly retry
// instead of a blank white screen — critical for a young audience.
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Game crashed:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-outer">
          <div className="crash" role="alert">
            <div className="crash__emoji" aria-hidden="true">🐾</div>
            <h1 className="crash__title">Oops! Something hiccuped.</h1>
            <button
              type="button"
              className="btn btn--primary btn--lg tap"
              onClick={() => window.location.reload()}
            >
              Tap to try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
