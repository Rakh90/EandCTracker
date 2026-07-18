import { useState } from 'react'
import HintToggle from './HintToggle'

export default function Slider({ label, value, onChange, min = 1, max = 10, unit = '', hint }) {
  const [showHint, setShowHint] = useState(false)
  return (
    <div className="field">
      <div className="field-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label>{label}</label>
          <HintToggle hint={hint} open={showHint} onToggle={() => setShowHint((s) => !s)} />
        </div>
        <span className="mono">{value ?? '—'}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value ?? Math.round((min + max) / 2)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {showHint && hint && <p className="muted" style={{ marginTop: 6, marginBottom: 0 }}>{hint}</p>}
    </div>
  )
}
