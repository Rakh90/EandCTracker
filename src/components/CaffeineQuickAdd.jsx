import { useState } from 'react'
import { CAFFEINE_PRESETS, CAFFEINE_GUIDE } from '../lib/definitions'
import HintToggle from './ui/HintToggle'

export default function CaffeineQuickAdd({ totalMg, onAdd }) {
  const [showGuide, setShowGuide] = useState(false)
  const [custom, setCustom] = useState('')

  function addCustom() {
    const n = Number(custom)
    if (!n) return
    onAdd(n)
    setCustom('')
  }

  return (
    <div className="field">
      <div className="field-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label>Caffeine</label>
          <HintToggle hint={CAFFEINE_GUIDE} open={showGuide} onToggle={() => setShowGuide((s) => !s)} />
        </div>
        <span className="mono">{totalMg ?? 0}mg today</span>
      </div>
      {showGuide && <p className="muted" style={{ marginTop: 6 }}>{CAFFEINE_GUIDE}</p>}
      <div className="chip-group" style={{ marginTop: 8 }}>
        {CAFFEINE_PRESETS.map((p) => (
          <div key={p.label} className="chip" role="button" tabIndex={0} onClick={() => onAdd(p.mg)}>
            {p.label} (+{p.mg})
          </div>
        ))}
      </div>
      <div className="field-row" style={{ marginTop: 8 }}>
        <input
          type="number"
          inputMode="numeric"
          placeholder="Custom mg"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button type="button" onClick={addCustom} disabled={!custom}>Add</button>
      </div>
    </div>
  )
}
