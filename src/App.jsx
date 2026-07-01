import { useEffect, useReducer, useRef, useState } from 'react'
import { LEVELS } from './levels'
import { genQuestions } from './game'
import { playCorrect, playWrong, playFanfare, unlockAudio } from './sound'
import HomeScreen from './screens/HomeScreen'
import MapScreen from './screens/MapScreen'
import IntroScreen from './screens/IntroScreen'
import PlayScreen from './screens/PlayScreen'
import RewardScreen from './screens/RewardScreen'
import CollectionScreen from './screens/CollectionScreen'
import SettingsModal from './components/SettingsModal'
import './App.css'

const STORAGE_KEY = 'holly-math-v1'
const HINT_AFTER = 2 // reveal a hint once the child has missed this many times

function loadSaved() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (s) return { progress: s.progress || {}, collected: s.collected || [], muted: !!s.muted }
  } catch {
    /* ignore malformed / unavailable storage */
  }
  return { progress: {}, collected: [], muted: false }
}

function init() {
  const saved = loadSaved()
  return {
    screen: 'home',      // home | map | intro | play | reward | collection
    level: 1,            // 1-based level number being played
    pendingLevel: 1,     // level chosen on the intro step
    qIndex: 0,           // 0..4 within the current level
    questions: [],
    answered: null,      // { correct, value|side }
    wrongCount: 0,       // misses across the whole level (drives star score)
    attempts: 0,         // misses on the CURRENT question (drives the hint)
    earnedStars: 0,
    justNew: false,      // did this run unlock a brand-new animal?
    progress: saved.progress,   // { [levelNum]: bestStars }
    collected: saved.collected, // [levelNum, ...]
    muted: saved.muted,
  }
}

// Compute stars, persist the unlock, and move to the reward screen.
function finish(state) {
  const stars = state.wrongCount === 0 ? 3 : state.wrongCount <= 2 ? 2 : 1
  const prev = state.progress[state.level] || 0
  const isNew = !state.collected.includes(state.level)
  const progress = { ...state.progress, [state.level]: Math.max(prev, stars) }
  const collected = isNew ? [...state.collected, state.level] : state.collected
  return { ...state, screen: 'reward', earnedStars: stars, justNew: isNew, progress, collected }
}

function reducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, screen: action.screen, answered: null }
    case 'OPEN_INTRO':
      return { ...state, screen: 'intro', pendingLevel: action.n }
    case 'START_LEVEL': {
      const n = state.pendingLevel
      return {
        ...state,
        screen: 'play',
        level: n,
        qIndex: 0,
        answered: null,
        wrongCount: 0,
        attempts: 0,
        questions: genQuestions(LEVELS[n - 1]),
      }
    }
    case 'ANSWER_CORRECT':
      return { ...state, answered: { correct: true, value: action.value, side: action.side } }
    case 'ANSWER_WRONG':
      return {
        ...state,
        answered: { correct: false, value: action.value, side: action.side },
        wrongCount: state.wrongCount + 1,
        attempts: state.attempts + 1,
      }
    case 'CLEAR_ANSWER':
      return { ...state, answered: null }
    case 'ADVANCE':
      if (state.qIndex < 4) return { ...state, qIndex: state.qIndex + 1, answered: null, attempts: 0 }
      return finish(state)
    case 'TOGGLE_MUTE':
      return { ...state, muted: !state.muted }
    case 'RESET_PROGRESS':
      return { ...state, progress: {}, collected: [] }
    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // dispatch is stable, so deferred callbacks read fresh state without a ref hack.
  const timerRef = useRef(null)
  const clearTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null } }
  useEffect(() => clearTimer, [])

  // Prime Web Audio on the first touch so the first sound is reliable on iOS.
  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  // Persist progress, collection, and the sound preference whenever they change
  // (skip the first run — it would just rewrite what we loaded).
  const didPersist = useRef(false)
  useEffect(() => {
    if (!didPersist.current) { didPersist.current = true; return }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ progress: state.progress, collected: state.collected, muted: state.muted }),
      )
    } catch {
      /* ignore */
    }
  }, [state.progress, state.collected, state.muted])

  // Tint the mobile status bar to match the current screen's top color.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return
    const cfg = LEVELS[(state.screen === 'intro' ? state.pendingLevel : state.level) - 1]
    const byScreen = { home: '#f6ece0', map: '#e0ebf2', collection: '#fbf3e2' }
    const color = ['intro', 'play', 'reward'].includes(state.screen) ? cfg.tint : byScreen[state.screen] || '#e7dcc4'
    meta.setAttribute('content', color)
  }, [state.screen, state.level, state.pendingLevel])

  // Little fanfare when the reward screen appears.
  useEffect(() => {
    if (state.screen === 'reward' && !state.muted) playFanfare()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.screen])

  const playable = (n) => n === 1 || !!state.progress[n - 1]
  const navigate = (screen) => { clearTimer(); dispatch({ type: 'NAVIGATE', screen }) }
  const openIntro = (n) => { if (playable(n)) dispatch({ type: 'OPEN_INTRO', n }) }
  const startLevel = () => { clearTimer(); dispatch({ type: 'START_LEVEL' }) }

  // Sound + haptics; sound respects the mute toggle, haptics are always subtle.
  const feedback = (correct) => {
    if (!state.muted) (correct ? playCorrect : playWrong)()
    if (navigator.vibrate) navigator.vibrate(correct ? 28 : [18, 36, 18])
  }

  const resolve = (isCorrect, payload) => {
    clearTimer()
    if (isCorrect) {
      dispatch({ type: 'ANSWER_CORRECT', ...payload })
      feedback(true)
      timerRef.current = setTimeout(() => dispatch({ type: 'ADVANCE' }), 1150)
    } else {
      dispatch({ type: 'ANSWER_WRONG', ...payload })
      feedback(false)
      timerRef.current = setTimeout(() => dispatch({ type: 'CLEAR_ANSWER' }), 800)
    }
  }

  const answer = (value) => {
    const q = state.questions[state.qIndex]
    if (!q || state.answered?.correct) return
    resolve(value === q.answer, { value })
  }

  const answerCompare = (side) => {
    const q = state.questions[state.qIndex]
    if (!q || state.answered?.correct) return
    resolve(side === q.answerSide, { side })
  }

  const totalStars = Object.values(state.progress).reduce((a, b) => a + b, 0)
  const friendsCount = state.collected.length
  const activeCfg = LEVELS[(state.screen === 'intro' ? state.pendingLevel : state.level) - 1]

  return (
    <div className="app-outer">
      <div className="app-frame">
        {state.screen === 'home' && (
          <HomeScreen
            totalStars={totalStars}
            friendsCount={friendsCount}
            onPlay={() => navigate('map')}
            onFriends={() => navigate('collection')}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}

        {state.screen === 'map' && (
          <MapScreen
            levels={LEVELS}
            progress={state.progress}
            playable={playable}
            totalStars={totalStars}
            friendsCount={friendsCount}
            onStart={openIntro}
            onNavigate={navigate}
          />
        )}

        {state.screen === 'intro' && (
          <IntroScreen
            cfg={activeCfg}
            levelNum={state.pendingLevel}
            known={state.collected.includes(state.pendingLevel)}
            onStart={startLevel}
            onBack={() => navigate('map')}
          />
        )}

        {state.screen === 'play' && (
          <PlayScreen
            cfg={activeCfg}
            levelNum={state.level}
            question={state.questions[state.qIndex]}
            qIndex={state.qIndex}
            answered={state.answered}
            hint={state.attempts >= HINT_AFTER}
            onBack={() => navigate('map')}
            onAnswer={answer}
            onAnswerCompare={answerCompare}
          />
        )}

        {state.screen === 'reward' && (
          <RewardScreen
            cfg={activeCfg}
            levelNum={state.level}
            stars={state.earnedStars}
            justNew={state.justNew}
            onContinue={() => navigate('map')}
          />
        )}

        {state.screen === 'collection' && (
          <CollectionScreen
            levels={LEVELS}
            collected={state.collected}
            friendsCount={friendsCount}
            muted={state.muted}
            onNavigate={navigate}
          />
        )}
      </div>

      {settingsOpen && (
        <SettingsModal
          muted={state.muted}
          onToggleMute={() => dispatch({ type: 'TOGGLE_MUTE' })}
          onReset={() => dispatch({ type: 'RESET_PROGRESS' })}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
