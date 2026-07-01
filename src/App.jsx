import { useEffect, useReducer, useRef, useState } from 'react'
import { LEVELS, WORLD_SIZE } from './levels'
import { genQuestions, genMixed } from './game'
import { ACHIEVEMENTS, achievementCtx, unlockedIds } from './achievements'
import { playCorrect, playWrong, playFanfare, unlockAudio } from './sound'
import HomeScreen from './screens/HomeScreen'
import MapScreen from './screens/MapScreen'
import IntroScreen from './screens/IntroScreen'
import PlayScreen from './screens/PlayScreen'
import RewardScreen from './screens/RewardScreen'
import CollectionScreen from './screens/CollectionScreen'
import AchievementsScreen from './screens/AchievementsScreen'
import SettingsModal from './components/SettingsModal'
import './App.css'

const STORAGE_KEY = 'holly-math-v1'
const HINT_AFTER = 2 // reveal a hint once the child has missed this many times
// Synthetic config for the mixed "Surprise Round" (no real level / animal).
const PRACTICE_CFG = { name: 'Surprise Round', accent: '#d9663d', tint: '#f3ece0', unlock: { emoji: '🎲', name: 'Practice' } }

function loadSaved() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (s) return {
      progress: s.progress || {}, collected: s.collected || [], muted: !!s.muted, skill: s.skill || 0,
      stats: { correct: 0, perfect: 0, practiceRounds: 0, ...(s.stats || {}) }, badges: s.badges || [],
    }
  } catch {
    /* ignore malformed / unavailable storage */
  }
  return { progress: {}, collected: [], muted: false, skill: 0, stats: { correct: 0, perfect: 0, practiceRounds: 0 }, badges: [] }
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
    worldComplete: false, // did this run finish a world (milestone)?
    practice: false,     // is this a mixed "Surprise Round" (not a real level)?
    progress: saved.progress,   // { [levelNum]: bestStars }
    collected: saved.collected, // [levelNum, ...]
    muted: saved.muted,
    skill: saved.skill,  // adaptive-difficulty offset, [-2, 3]
    stats: saved.stats,  // { correct, perfect, practiceRounds }
    badges: saved.badges, // unlocked achievement ids
    newBadges: [],       // ids unlocked by the run just finished (for the reward screen)
  }
}

// Recompute unlocked achievements; return the full set plus any newly unlocked.
function computeBadges(input, prevBadges) {
  const unlocked = unlockedIds(achievementCtx(input))
  return { badges: unlocked, newBadges: unlocked.filter((id) => !prevBadges.includes(id)) }
}

// Compute stars, persist the unlock, and move to the reward screen.
function finish(state) {
  const stars = state.wrongCount === 0 ? 3 : state.wrongCount <= 2 ? 2 : 1
  // Practice doesn't unlock animals, touch progress, or change skill.
  if (state.practice) {
    const stats = { ...state.stats, practiceRounds: state.stats.practiceRounds + 1 }
    const b = computeBadges({ progress: state.progress, collected: state.collected, stats }, state.badges)
    return { ...state, screen: 'reward', earnedStars: stars, justNew: false, worldComplete: false, stats, badges: b.badges, newBadges: b.newBadges }
  }
  const prev = state.progress[state.level] || 0
  const isNew = !state.collected.includes(state.level)
  const progress = { ...state.progress, [state.level]: Math.max(prev, stars) }
  const collected = isNew ? [...state.collected, state.level] : state.collected
  // Adaptive: nudge difficulty up after a flawless clear, ease it after a rough one.
  const delta = stars === 3 ? 1 : stars === 1 ? -1 : 0
  const skill = Math.max(-2, Math.min(3, state.skill + delta))
  const worldComplete = state.level % WORLD_SIZE === 0
  const stats = { ...state.stats, perfect: state.stats.perfect + (stars === 3 ? 1 : 0) }
  const b = computeBadges({ progress, collected, stats }, state.badges)
  return { ...state, screen: 'reward', earnedStars: stars, justNew: isNew, worldComplete, progress, collected, skill, stats, badges: b.badges, newBadges: b.newBadges }
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
        practice: false,
        questions: genQuestions(LEVELS[n - 1], state.skill),
      }
    }
    case 'START_PRACTICE': {
      const pool = LEVELS.filter((_, i) => state.progress[i + 1])
      const configs = pool.length ? pool : [LEVELS[0]]
      return {
        ...state, screen: 'play', practice: true, level: 0, qIndex: 0,
        answered: null, wrongCount: 0, attempts: 0,
        questions: genMixed(configs, state.skill),
      }
    }
    case 'ANSWER_CORRECT':
      return { ...state, answered: { correct: true, value: action.value, side: action.side }, stats: { ...state.stats, correct: state.stats.correct + 1 } }
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
        JSON.stringify({ progress: state.progress, collected: state.collected, muted: state.muted, skill: state.skill, stats: state.stats, badges: state.badges }),
      )
    } catch {
      /* ignore */
    }
  }, [state.progress, state.collected, state.muted, state.skill, state.stats, state.badges])

  // Tint the mobile status bar to match the current screen's top color.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return
    const cfg = LEVELS[(state.screen === 'intro' ? state.pendingLevel : state.level) - 1]
    const byScreen = { home: '#f6ece0', map: '#e0ebf2', collection: '#fbf3e2', awards: '#f4ecd6' }
    const color = ['intro', 'play', 'reward'].includes(state.screen) ? (cfg?.tint || PRACTICE_CFG.tint) : byScreen[state.screen] || '#e7dcc4'
    meta.setAttribute('content', color)
  }, [state.screen, state.level, state.pendingLevel, state.practice])

  // Little fanfare when the reward screen appears.
  useEffect(() => {
    if (state.screen === 'reward' && !state.muted) playFanfare()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.screen])

  const playable = (n) => n === 1 || !!state.progress[n - 1]
  const navigate = (screen) => { clearTimer(); dispatch({ type: 'NAVIGATE', screen }) }
  const openIntro = (n) => { if (playable(n)) dispatch({ type: 'OPEN_INTRO', n }) }
  const startLevel = () => { clearTimer(); dispatch({ type: 'START_LEVEL' }) }
  const startPractice = () => { clearTimer(); dispatch({ type: 'START_PRACTICE' }) }

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
  const collectedAnimals = state.collected.map((n) => LEVELS[n - 1].unlock.emoji)
  const worldAnimals = state.worldComplete
    ? LEVELS.slice(Math.max(0, state.level - WORLD_SIZE), state.level).map((l) => l.unlock.emoji)
    : []
  const screenCfg = state.practice ? PRACTICE_CFG : activeCfg
  const achCtx = achievementCtx({ progress: state.progress, collected: state.collected, stats: state.stats })
  const newBadgeObjs = state.newBadges.map((id) => ACHIEVEMENTS.find((a) => a.id === id)).filter(Boolean)

  return (
    <div className="app-outer">
      <div className="app-frame">
        {state.screen === 'home' && (
          <HomeScreen
            totalStars={totalStars}
            friendsCount={friendsCount}
            collectedAnimals={collectedAnimals}
            onPlay={() => navigate('map')}
            onFriends={() => navigate('collection')}
            onPractice={startPractice}
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
            onOpenSettings={() => setSettingsOpen(true)}
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
            cfg={screenCfg}
            levelNum={state.level}
            practice={state.practice}
            question={state.questions[state.qIndex]}
            qIndex={state.qIndex}
            answered={state.answered}
            hint={state.attempts >= HINT_AFTER}
            muted={state.muted}
            onToggleMute={() => dispatch({ type: 'TOGGLE_MUTE' })}
            onBack={() => navigate(state.practice ? 'home' : 'map')}
            onAnswer={answer}
            onAnswerCompare={answerCompare}
          />
        )}

        {state.screen === 'reward' && (
          <RewardScreen
            cfg={screenCfg}
            levelNum={state.level}
            practice={state.practice}
            stars={state.earnedStars}
            justNew={state.justNew}
            worldComplete={state.worldComplete}
            worldAnimals={worldAnimals}
            newBadges={newBadgeObjs}
            hasNext={!state.practice && state.level < LEVELS.length}
            onNext={state.practice ? startPractice : () => openIntro(state.level + 1)}
            onContinue={() => navigate(state.practice ? 'home' : 'map')}
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

        {state.screen === 'awards' && (
          <AchievementsScreen ctx={achCtx} onNavigate={navigate} />
        )}
      </div>

      <div className="rotate-hint" role="alert">
        <div className="rotate-hint__emoji" aria-hidden="true">🔄</div>
        <h1 className="crash__title">Turn your phone up!</h1>
        <p>Holly&apos;s Animal Math plays best standing tall.</p>
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
