import { useEffect, useRef, useState } from 'react'

const SYMBOLS = ['△', '○', '□', '◇', '☆', '✦']
const DURATION_S = 30

function randomPair() {
  const a = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
  const same = Math.random() < 0.5
  let b = a
  if (!same) {
    do {
      b = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    } while (b === a)
  }
  return { a, b, isSame: a === b }
}

export default function SymbolSprint({ onComplete }) {
  const [secondsLeft, setSecondsLeft] = useState(DURATION_S)
  const [pair, setPair] = useState(randomPair)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [answered, setAnswered] = useState(0)
  const finishedRef = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (secondsLeft === 0 && !finishedRef.current) {
      finishedRef.current = true
      onComplete({ sprint_net: correct - wrong, sprint_answered: answered })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft])

  function answer(choice) {
    if (secondsLeft === 0) return
    const isCorrect = choice === pair.isSame
    if (isCorrect) setCorrect((c) => c + 1)
    else setWrong((w) => w + 1)
    setAnswered((a) => a + 1)
    setPair(randomPair())
  }

  return (
    <div>
      <p className="mono muted">Time left: {secondsLeft}s · correct {correct} · wrong {wrong}</p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
          fontSize: 64,
          padding: '24px 0',
          border: '2px solid var(--ink)',
          background: 'var(--surface)',
        }}
      >
        <span>{pair.a}</span>
        <span>{pair.b}</span>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <button type="button" style={{ flex: 1 }} onClick={() => answer(true)} disabled={secondsLeft === 0}>Same</button>
        <button type="button" style={{ flex: 1 }} onClick={() => answer(false)} disabled={secondsLeft === 0}>Different</button>
      </div>
    </div>
  )
}
