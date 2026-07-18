import { useEffect, useState } from 'react'
import HintToggle from './HintToggle'

export default function Slider({ label, value, onChange, min = 1, max = 10, unit = '', hint, defaultValue = 5 }) {
  const [showHint, setShowHint] = useState(false)

  // The thumb always renders at a real position (defaultValue, clamped into
  // range) — so it must actually be saved on mount too, otherwise the
  // displayed position and the stored value silently disagree until the
  // user drags it.
  useEffect(() => {
    if (value === null || value === undefined) onChange(Math.min(Math.max(defaultValue, min), max))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const shown = value ?? Math.min(Math.max(defaultValue, min), max)
  return (
    <div className="field">
      <div className="field-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label>{label}</label>
          <HintToggle hint={hint} open={showHint} onToggle={() => setShowHint((s) => !s)} />
        </div>
        <span className="mono">{shown}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={shown}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {showHint && hint && <p className="muted" style={{ marginTop: 6, marginBottom: 0 }}>{hint}</p>}
    </div>
  )
}
