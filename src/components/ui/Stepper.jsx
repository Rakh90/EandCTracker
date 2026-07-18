import { useState } from 'react'
import HintToggle from './HintToggle'

export default function Stepper({ label, value, onChange, min = 0, max = 99, step = 1, unit = '', hint }) {
  const [showHint, setShowHint] = useState(false)
  const current = value ?? min
  return (
    <div className="field">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label>{label}</label>
        <HintToggle hint={hint} open={showHint} onToggle={() => setShowHint((s) => !s)} />
      </div>
      <div className="stepper" style={{ marginTop: 6 }}>
        <button type="button" onClick={() => onChange(Math.max(min, current - step))}>−</button>
        <span className="value">{value ?? '—'}{unit}</span>
        <button type="button" onClick={() => onChange(Math.min(max, current + step))}>+</button>
      </div>
      {showHint && hint && <p className="muted" style={{ marginTop: 6, marginBottom: 0 }}>{hint}</p>}
    </div>
  )
}
