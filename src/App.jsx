import { useEffect, useRef, useState } from 'react'
import { LEVELS } from './levels'
import { genQuestions } from './game'
import MapScreen from './screens/MapScreen'
import PlayScreen from './screens/PlayScreen'
import RewardScreen from './screens/RewardScreen'
import CollectionScreen from './screens/CollectionScreen'
import './App.css'

const STORAGE_KEY = 'holly-math-v1'

function loadSaved() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (s) return { progress: s.progress || {}, collected: s.collected || [] }
  } catch {
    /* ignore malformed / unavailable storage */
  }
  return { progress: {}, collected: [] }
}

function initialState() {
  const saved = loadSaved()
  return {
    screen: 'map',      // map | play | reward | collection
    level: 1,           // 1-based level number
    qIndex: 0,          // 0..4 within the current level
    questions: [],
    answered: null,     // { correct, value|side }
    wrongCount: 0,
    earnedStars: 0,
    justNew: false,     // did this run unlock a brand-new animal?
    progress: saved.progress,   // { [levelNum]: bestStars }
    collected: saved.collected, // [levelNum, ...]
  }
}

export default function App() {
  const [state, setStateRaw] = useState(initialState)

  // Keep a live ref so deferred callbacks (setTimeout) read fresh state.
  const stateRef = useRef(state)
  stateRef.current = state
  const timerRef = useRef(null)

  // Merge-style setState, mirroring the original class component.
  const setState = (patch) =>
    setStateRaw((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  const playable = (n) => n === 1 || !!state.progress[n - 1]

  const finishLevel = () => {
    const s = stateRef.current
    const stars = s.wrongCount === 0 ? 3 : s.wrongCount <= 2 ? 2 : 1
    const prev = s.progress[s.level] || 0
    const isNew = !s.collected.includes(s.level)
    const progress = { ...s.progress, [s.level]: Math.max(prev, stars) }
    const collected = isNew ? [...s.collected, s.level] : s.collected
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ progress, collected }))
    } catch {
      /* ignore */
    }
    setState({ screen: 'reward', earnedStars: stars, justNew: isNew, progress, collected })
  }

  const advance = () => {
    const s = stateRef.current
    if (s.qIndex < 4) setState({ qIndex: s.qIndex + 1, answered: null })
    else finishLevel()
  }

  const answer = (value) => {
    const s = stateRef.current
    if (s.answered && s.answered.correct) return
    const q = s.questions[s.qIndex]
    if (value === q.answer) {
      setState({ answered: { value, correct: true } })
      timerRef.current = setTimeout(advance, 1150)
    } else {
      setState((st) => ({ answered: { value, correct: false }, wrongCount: st.wrongCount + 1 }))
      timerRef.current = setTimeout(() => setState({ answered: null }), 800)
    }
  }

  const answerCompare = (side) => {
    const s = stateRef.current
    if (s.answered && s.answered.correct) return
    const q = s.questions[s.qIndex]
    if (side === q.answerSide) {
      setState({ answered: { side, correct: true } })
      timerRef.current = setTimeout(advance, 1150)
    } else {
      setState((st) => ({ answered: { side, correct: false }, wrongCount: st.wrongCount + 1 }))
      timerRef.current = setTimeout(() => setState({ answered: null }), 800)
    }
  }

  const startLevel = (n) => {
    if (!playable(n)) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setState({ screen: 'play', level: n, qIndex: 0, answered: null, wrongCount: 0, questions: genQuestions(LEVELS[n - 1]) })
  }

  const onContinue = () => setState({ screen: 'map' })
  const onBackToMap = () => { if (timerRef.current) clearTimeout(timerRef.current); setState({ screen: 'map' }) }
  const onOpenCollection = () => setState({ screen: 'collection' })

  const totalStars = Object.values(state.progress).reduce((a, b) => a + b, 0)
  const friendsCount = state.collected.length

  return (
    <div className="app-outer">
      <div className="app-frame">
        {state.screen === 'map' && (
          <MapScreen
            levels={LEVELS}
            progress={state.progress}
            playable={playable}
            totalStars={totalStars}
            friendsCount={friendsCount}
            onStart={startLevel}
            onOpenCollection={onOpenCollection}
          />
        )}

        {state.screen === 'play' && (
          <PlayScreen
            cfg={LEVELS[state.level - 1]}
            levelNum={state.level}
            question={state.questions[state.qIndex]}
            qIndex={state.qIndex}
            answered={state.answered}
            onBack={onBackToMap}
            onAnswer={answer}
            onAnswerCompare={answerCompare}
          />
        )}

        {state.screen === 'reward' && (
          <RewardScreen
            cfg={LEVELS[state.level - 1]}
            levelNum={state.level}
            stars={state.earnedStars}
            justNew={state.justNew}
            onContinue={onContinue}
          />
        )}

        {state.screen === 'collection' && (
          <CollectionScreen
            levels={LEVELS}
            collected={state.collected}
            friendsCount={friendsCount}
            onBack={onBackToMap}
          />
        )}
      </div>
    </div>
  )
}
