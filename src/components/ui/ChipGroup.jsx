import { useState } from 'react'
import HintToggle from './HintToggle'

export default function ChipGroup({ label, options, value, onChange, multi = false, hint }) {
  const [showHint, setShowHint] = useState(false)
  const selected = multi ? (value || []) : value
  function toggle(opt) {
    if (multi) {
      const set = new Set(selected)
      if (set.has(opt)) set.delete(opt)
      else set.add(opt)
      onChange([...set])
    } else {
      onChange(selected === opt ? null : opt)
    }
  }
  return (
    <div className="field">
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label>{label}</label>
          <HintToggle hint={hint} open={showHint} onToggle={() => setShowHint((s) => !s)} />
        </div>
      )}
      <div className="chip-group">
        {options.map((opt) => {
          const isSelected = multi ? selected.includes(opt) : selected === opt
          return (
            <div
              key={opt}
              className={`chip${isSelected ? ' selected' : ''}`}
              onClick={() => toggle(opt)}
              role="button"
              tabIndex={0}
            >
              {opt}
            </div>
          )
        })}
      </div>
      {showHint && hint && <p className="muted" style={{ marginTop: 6, marginBottom: 0 }}>{hint}</p>}
    </div>
  )
}
