import { useEffect, useReducer, useRef, useState } from 'react'
import { LEVELS, WORLD_SIZE } from './levels'
import { genQuestions, genMixed } from './game'
import { ACHIEVEMENTS, achievementCtx, unlockedIds } from './achievements'
import { themeForStars } from './themes'
import { playCorrect, playWrong, playFanfare, unlockAudio, startMusic, stopMusic } from './sound'
import WelcomeScreen from './screens/WelcomeScreen'
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
const PRACTICE_CFG = { name: 'Surprise Round', accent: '#d9663d', tint: '#f3ece0', scene: 'sky', unlock: { emoji: '🎲', name: 'Practice' } }

// Levels unlock a whole "world" (chunk of WORLD_SIZE) at a time: finishing
// every level in a world opens the next, and within an open world the child
// can play the levels in any order.
const worldOf = (n) => Math.floor((n - 1) / WORLD_SIZE) // 0-based world index for a 1-based level
const worldLevelNums = (w) =>
  Array.from({ length: WORLD_SIZE }, (_, i) => w * WORLD_SIZE + i + 1).filter((n) => n <= LEVELS.length)
const isWorldDone = (progress, w) => worldLevelNums(w).every((n) => progress[n])

function loadSaved() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (s) {
      // Guard against saves from an older build with a different level set —
      // an out-of-range index would later crash on LEVELS[n - 1].unlock.
      const valid = (n) => Number.isInteger(n) && n >= 1 && n <= LEVELS.length
      const progress = {}
      for (const [k, v] of Object.entries(s.progress || {})) {
        if (valid(Number(k))) progress[Number(k)] = v
      }
      const decor = Array.isArray(s.decor)
        ? s.decor
            .filter((d) => d && typeof d.emoji === 'string' && typeof d.x === 'number' && typeof d.y === 'number')
            .slice(0, 60)
        : []
      return {
        progress,
        collected: Array.isArray(s.collected) ? s.collected.filter(valid) : [],
        decor,
        muted: !!s.muted, music: s.music === undefined ? true : !!s.music, skill: s.skill || 0,
        stats: { correct: 0, perfect: 0, practiceRounds: 0, ...(s.stats || {}) },
        badges: Array.isArray(s.badges) ? s.badges : [],
        name: s.name || '', avatar: s.avatar || '🐰',
      }
    }
  } catch {
    /* ignore malformed / unavailable storage */
  }
  return { progress: {}, collected: [], decor: [], muted: false, music: true, skill: 0, stats: { correct: 0, perfect: 0, practiceRounds: 0 }, badges: [], name: '', avatar: '🐰' }
}

function init() {
  const saved = loadSaved()
  return {
    // First launch (no name yet) starts on the welcome/profile step.
    screen: saved.name ? 'home' : 'welcome', // welcome | home | map | intro | play | reward | collection | awards
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
    decor: saved.decor,  // clubhouse decorations: [{ id, emoji, x, y }]
    muted: saved.muted,  // silences all sound effects (quick-access toggle)
    music: saved.music,  // background music on/off (grown-up settings)
    skill: saved.skill,  // adaptive-difficulty offset, [-2, 3]
    stats: saved.stats,  // { correct, perfect, practiceRounds }
    badges: saved.badges, // unlocked achievement ids
    newBadges: [],       // ids unlocked by the run just finished (for the reward screen)
    newTheme: null,      // reward theme newly unlocked this run (label or null)
    name: saved.name,    // the player's name (drives titles + cheers)
    avatar: saved.avatar, // the player's chosen buddy (home hero)
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
    return { ...state, screen: 'reward', earnedStars: stars, justNew: false, worldComplete: false, stats, badges: b.badges, newBadges: b.newBadges, newTheme: null }
  }
  const prevStars = Object.values(state.progress).reduce((a, b) => a + b, 0)
  const prev = state.progress[state.level] || 0
  const isNew = !state.collected.includes(state.level)
  const progress = { ...state.progress, [state.level]: Math.max(prev, stars) }
  const collected = isNew ? [...state.collected, state.level] : state.collected
  // Adaptive: nudge difficulty up after a flawless clear, ease it after a rough one.
  const delta = stars === 3 ? 1 : stars === 1 ? -1 : 0
  const skill = Math.max(-2, Math.min(3, state.skill + delta))
  // Milestone fires when this clear is the one that finishes the whole world
  // (works no matter which order the levels were played in).
  const w = worldOf(state.level)
  const worldComplete = !isWorldDone(state.progress, w) && isWorldDone(progress, w)
  const stats = { ...state.stats, perfect: state.stats.perfect + (stars === 3 ? 1 : 0) }
  const b = computeBadges({ progress, collected, stats }, state.badges)
  const newStars = Object.values(progress).reduce((a, b) => a + b, 0)
  const newTheme = themeForStars(prevStars).id !== themeForStars(newStars).id ? themeForStars(newStars).label : null
  return { ...state, screen: 'reward', earnedStars: stars, justNew: isNew, worldComplete, progress, collected, skill, stats, badges: b.badges, newBadges: b.newBadges, newTheme }
}

function reducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, screen: action.screen, answered: null }
    case 'SET_PROFILE':
      return { ...state, name: action.name, avatar: action.avatar, screen: 'home' }
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
    case 'TOGGLE_MUSIC':
      return { ...state, music: !state.music }
    case 'SET_DECOR':
      return { ...state, decor: action.decor }
    case 'RESET_PROGRESS':
      // Clear everything derived from play so no ghost badge/skill survives.
      return {
        ...state,
        progress: {},
        collected: [],
        decor: [],
        skill: 0,
        stats: { correct: 0, perfect: 0, practiceRounds: 0 },
        badges: [],
        newBadges: [],
        newTheme: null,
      }
    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // dispatch is stable, so deferred callbacks read fresh state without a ref hack.
  const timerRef = useRef(null)
  const resolvingRef = useRef(false) // synchronous lock: a correct answer resolves exactly once
  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    resolvingRef.current = false
  }
  useEffect(() => clearTimer, [])

  // Prime Web Audio on the first touch so the first sound is reliable on iOS.
  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  // Background music: runs whenever sound is on and music is enabled. The
  // scheduler stays silent until the AudioContext resumes on first gesture.
  useEffect(() => {
    if (!state.muted && state.music) startMusic()
    else stopMusic()
    return () => stopMusic()
  }, [state.muted, state.music])

  // Persist progress, collection, and the sound preference whenever they change
  // (skip the first run — it would just rewrite what we loaded).
  const didPersist = useRef(false)
  useEffect(() => {
    if (!didPersist.current) { didPersist.current = true; return }
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ progress: state.progress, collected: state.collected, decor: state.decor, muted: state.muted, music: state.music, skill: state.skill, stats: state.stats, badges: state.badges, name: state.name, avatar: state.avatar }),
      )
    } catch {
      /* ignore */
    }
  }, [state.progress, state.collected, state.decor, state.muted, state.music, state.skill, state.stats, state.badges, state.name, state.avatar])

  // Tint the mobile status bar to match the current screen's top color.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return
    const cfg = LEVELS[(state.screen === 'intro' ? state.pendingLevel : state.level) - 1]
    const byScreen = { welcome: '#f6ece0', home: '#f6ece0', map: '#e0ebf2', collection: '#fbf3e2', awards: '#f4ecd6' }
    const color = ['intro', 'play', 'reward'].includes(state.screen) ? (cfg?.tint || PRACTICE_CFG.tint) : byScreen[state.screen] || '#e7dcc4'
    meta.setAttribute('content', color)
  }, [state.screen, state.level, state.pendingLevel, state.practice])

  // Little fanfare when the reward screen appears.
  useEffect(() => {
    if (state.screen === 'reward' && !state.muted) playFanfare(state.earnedStars)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.screen])

  // A level is playable if it's in the first world, or the previous world is
  // fully complete — so an open world exposes all of its levels at once.
  const playable = (n) => { const w = worldOf(n); return w === 0 || isWorldDone(state.progress, w - 1) }
  // The next level to nudge toward on the reward screen: prefer the next
  // higher-numbered open+unfinished level, wrapping back to earlier gaps.
  const nextLevel = () => {
    const order = []
    for (let n = state.level + 1; n <= LEVELS.length; n++) order.push(n)
    for (let n = 1; n <= state.level; n++) order.push(n)
    return order.find((n) => playable(n) && !state.progress[n]) ?? null
  }
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
      resolvingRef.current = true
      dispatch({ type: 'ANSWER_CORRECT', ...payload })
      feedback(true)
      timerRef.current = setTimeout(() => { resolvingRef.current = false; dispatch({ type: 'ADVANCE' }) }, 1150)
    } else {
      dispatch({ type: 'ANSWER_WRONG', ...payload })
      feedback(false)
      timerRef.current = setTimeout(() => dispatch({ type: 'CLEAR_ANSWER' }), 800)
    }
  }

  const answer = (value) => {
    const q = state.questions[state.qIndex]
    if (!q || resolvingRef.current || state.answered?.correct) return
    resolve(value === q.answer, { value })
  }

  const answerCompare = (side) => {
    const q = state.questions[state.qIndex]
    if (!q || resolvingRef.current || state.answered?.correct) return
    resolve(side === q.answerSide, { side })
  }

  const totalStars = Object.values(state.progress).reduce((a, b) => a + b, 0)
  const friendsCount = state.collected.length
  const activeCfg = LEVELS[(state.screen === 'intro' ? state.pendingLevel : state.level) - 1]
  const collectedAnimals = state.collected.map((n) => LEVELS[n - 1].unlock.emoji)
  const worldAnimals = state.worldComplete
    ? LEVELS.slice(worldOf(state.level) * WORLD_SIZE, worldOf(state.level) * WORLD_SIZE + WORLD_SIZE).map((l) => l.unlock.emoji)
    : []
  const nextLevelNum = state.practice ? null : nextLevel()
  const screenCfg = state.practice ? PRACTICE_CFG : activeCfg
  const achCtx = achievementCtx({ progress: state.progress, collected: state.collected, stats: state.stats })
  const newBadgeObjs = state.newBadges.map((id) => ACHIEVEMENTS.find((a) => a.id === id)).filter(Boolean)
  const displayName = state.name || 'Holly'

  return (
    <div className="app-outer">
      <div className="app-frame">
        {state.screen === 'welcome' && (
          <WelcomeScreen
            initialName={state.name}
            initialAvatar={state.avatar}
            onDone={(name, avatar) => dispatch({ type: 'SET_PROFILE', name, avatar })}
          />
        )}

        {state.screen === 'home' && (
          <HomeScreen
            totalStars={totalStars}
            friendsCount={friendsCount}
            collectedAnimals={collectedAnimals}
            name={displayName}
            avatar={state.avatar}
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
            name={displayName}
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
            name={displayName}
            totalStars={totalStars}
            newTheme={state.newTheme}
            stars={state.earnedStars}
            justNew={state.justNew}
            worldComplete={state.worldComplete}
            worldAnimals={worldAnimals}
            newBadges={newBadgeObjs}
            hasNext={nextLevelNum !== null}
            onNext={state.practice ? startPractice : () => openIntro(nextLevelNum)}
            onContinue={() => navigate(state.practice ? 'home' : 'map')}
          />
        )}

        {state.screen === 'collection' && (
          <CollectionScreen
            levels={LEVELS}
            collected={state.collected}
            friendsCount={friendsCount}
            muted={state.muted}
            decor={state.decor}
            onSetDecor={(decor) => dispatch({ type: 'SET_DECOR', decor })}
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
          music={state.music}
          onToggleMute={() => dispatch({ type: 'TOGGLE_MUTE' })}
          onToggleMusic={() => dispatch({ type: 'TOGGLE_MUSIC' })}
          onReset={() => dispatch({ type: 'RESET_PROGRESS' })}
          onChangeName={() => { setSettingsOpen(false); navigate('welcome') }}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
