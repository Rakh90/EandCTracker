import { useEffect, useRef, useState } from 'react'
import { median } from '../../lib/scoring'

const TRIALS = 5

export default function ReactionTest({ onComplete }) {
  const [trial, setTrial] = useState(1)
  const [phase, setPhase] = useState('ready') // ready | waiting | go | false-start
  const [times, setTimes] = useState([])
  const goAtRef = useRef(0)
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  function startTrial() {
    setPhase('waiting')
    const delay = 1000 + Math.random() * 2000
    timeoutRef.current = setTimeout(() => {
      goAtRef.current = performance.now()
      setPhase('go')
    }, delay)
  }

  function handleTap() {
    if (phase === 'ready') {
      startTrial()
      return
    }
    if (phase === 'waiting') {
      clearTimeout(timeoutRef.current)
      setPhase('false-start')
      return
    }
    if (phase === 'go') {
      const rt = Math.round(performance.now() - goAtRef.current)
      const newTimes = [...times, rt]
      setTimes(newTimes)
      if (newTimes.length >= TRIALS) {
        onComplete({ rt_median_ms: Math.round(median(newTimes)) })
        return
      }
      setTrial((t) => t + 1)
      setPhase('ready')
    }
    if (phase === 'false-start') {
      setPhase('ready')
    }
  }

  const bg = phase === 'go' ? 'var(--ok)' : phase === 'false-start' ? 'var(--danger)' : 'var(--surface)'

  return (
    <div>
      <p className="mono muted">Trial {trial}/{TRIALS}</p>
      <div
        onClick={handleTap}
        role="button"
        tabIndex={0}
        style={{
          height: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bg,
          border: '2px solid var(--ink)',
          borderRadius: 2,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 18, color: phase === 'go' ? '#fff' : 'var(--ink)' }}>
          {phase === 'ready' && 'Tap to start trial'}
          {phase === 'waiting' && 'Wait for it...'}
          {phase === 'go' && 'TAP NOW'}
          {phase === 'false-start' && 'Too soon — tap to retry'}
        </span>
      </div>
      {times.length > 0 && (
        <p className="mono muted" style={{ marginTop: 8 }}>
          Recorded: {times.join(', ')} ms
        </p>
      )}
    </div>
  )
}
