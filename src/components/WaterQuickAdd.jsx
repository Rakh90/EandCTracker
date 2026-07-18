import { useState } from 'react'
import { WATER_PRESETS } from '../lib/definitions'

export default function WaterQuickAdd({ totalOz, onAdd }) {
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
        <label>Water</label>
        <span className="mono">{totalOz ?? 0}oz today</span>
      </div>
      <div className="chip-group" style={{ marginTop: 8 }}>
        {WATER_PRESETS.map((p) => (
          <div key={p.label} className="chip" role="button" tabIndex={0} onClick={() => onAdd(p.oz)}>
            {p.label}
          </div>
        ))}
      </div>
      <div className="field-row" style={{ marginTop: 8 }}>
        <input
          type="number"
          inputMode="numeric"
          placeholder="Custom oz"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button type="button" onClick={addCustom} disabled={!custom}>Add</button>
      </div>
    </div>
  )
}
