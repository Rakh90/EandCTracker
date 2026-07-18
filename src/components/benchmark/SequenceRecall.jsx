import { useEffect, useRef, useState } from 'react'
import { SPAN_MIN, SPAN_MAX } from '../../lib/scoring'

const GRID_SIZE = 9
const SHOW_MS = 600
const GAP_MS = 250

function randomSequence(length) {
  const seq = []
  for (let i = 0; i < length; i++) seq.push(Math.floor(Math.random() * GRID_SIZE))
  return seq
}

export default function SequenceRecall({ onComplete }) {
  const [span, setSpan] = useState(SPAN_MIN)
  const [misses, setMisses] = useState(0)
  const [maxSpan, setMaxSpan] = useState(0)
  const [sequence, setSequence] = useState(() => randomSequence(SPAN_MIN))
  const [phase, setPhase] = useState('showing') // showing | input | flash-correct | flash-wrong
  const [litIndex, setLitIndex] = useState(-1)
  const [userInput, setUserInput] = useState([])
  const finishedRef = useRef(false)

  useEffect(() => {
    if (phase !== 'showing') return
    let i = 0
    let cancelled = false
    function step() {
      if (cancelled) return
      if (i >= sequence.length) {
        setLitIndex(-1)
        setPhase('input')
        return
      }
      setLitIndex(sequence[i])
      setTimeout(() => {
        if (cancelled) return
        setLitIndex(-1)
        i++
        setTimeout(step, GAP_MS)
      }, SHOW_MS)
    }
    step()
    return () => { cancelled = true }
  }, [phase, sequence])

  function finish(finalMax) {
    if (finishedRef.current) return
    finishedRef.current = true
    onComplete({ span: finalMax })
  }

  function nextRound(nextSpan) {
    setSpan(nextSpan)
    setSequence(randomSequence(nextSpan))
    setUserInput([])
    setPhase('showing')
  }

  function handleCellClick(idx) {
    if (phase !== 'input') return
    const pos = userInput.length
    const expected = sequence[pos]
    if (idx !== expected) {
      const newMisses = misses + 1
      setMisses(newMisses)
      setPhase('flash-wrong')
      setTimeout(() => {
        if (newMisses >= 2) {
          finish(maxSpan)
        } else {
          nextRound(span)
        }
      }, 700)
      return
    }
    const newInput = [...userInput, idx]
    setUserInput(newInput)
    if (newInput.length === sequence.length) {
      const newMax = span
      setMaxSpan(newMax)
      setPhase('flash-correct')
      setTimeout(() => {
        if (span >= SPAN_MAX) {
          finish(newMax)
        } else {
          nextRound(span + 1)
        }
      }, 500)
    }
  }

  const cells = Array.from({ length: GRID_SIZE }, (_, i) => i)

  return (
    <div>
      <p className="mono muted">Span {span} · misses {misses}/2</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          maxWidth: 280,
          margin: '0 auto',
        }}
      >
        {cells.map((idx) => {
          const isLit = litIndex === idx
          const isWrong = phase === 'flash-wrong'
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleCellClick(idx)}
              disabled={phase !== 'input'}
              style={{
                aspectRatio: '1',
                borderRadius: 'var(--radius-sm)',
                border: `2px solid ${isLit ? 'var(--cobalt)' : isWrong ? 'var(--danger)' : 'var(--border)'}`,
                background: isLit ? 'var(--cobalt)' : isWrong ? 'var(--danger)' : 'var(--surface-2)',
                boxShadow: isLit || isWrong ? 'var(--shadow-md)' : 'none',
                transition: 'background 80ms ease, box-shadow 80ms ease',
              }}
            />
          )
        })}
      </div>
      <p className="muted" style={{ textAlign: 'center', marginTop: 12 }}>
        {phase === 'showing' && 'Watch the sequence...'}
        {phase === 'input' && `Repeat it (${userInput.length}/${sequence.length})`}
        {phase === 'flash-correct' && 'Correct!'}
        {phase === 'flash-wrong' && 'Missed it'}
      </p>
    </div>
  )
}
