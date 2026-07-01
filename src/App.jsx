import { useState } from 'react'
import './App.css'

// Minimal starter quiz. We'll expand this once we start building for real.
function generateQuestion() {
  const a = Math.floor(Math.random() * 10) + 1
  const b = Math.floor(Math.random() * 10) + 1
  return { a, b, answer: a + b }
}

function App() {
  const [question, setQuestion] = useState(generateQuestion)
  const [guess, setGuess] = useState('')
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (Number(guess) === question.answer) {
      setScore((s) => s + 1)
      setFeedback('Correct! ✅')
    } else {
      setFeedback(`Not quite — the answer was ${question.answer}.`)
    }
    setQuestion(generateQuestion())
    setGuess('')
  }

  return (
    <main className="app">
      <h1>MathQuiz</h1>
      <p className="score">Score: {score}</p>

      <form onSubmit={handleSubmit} className="quiz">
        <label htmlFor="answer">
          {question.a} + {question.b} =
        </label>
        <input
          id="answer"
          type="number"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          autoFocus
        />
        <button type="submit">Check</button>
      </form>

      {feedback && <p className="feedback">{feedback}</p>}
    </main>
  )
}

export default App
