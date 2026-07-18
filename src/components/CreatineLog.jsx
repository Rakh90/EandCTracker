import { useState } from 'react'
import { addCreatineIntake } from '../db/db'
import { nowTimeHHMM, formatTime12h } from '../lib/dates'

export default function CreatineLog({ date, entries }) {
  const [grams, setGrams] = useState('5')

  const total = entries.reduce((sum, e) => sum + (e.grams || 0), 0)

  async function submit() {
    const n = Number(grams)
    if (!n) return
    await addCreatineIntake({ date, time: nowTimeHHMM(), grams: n })
  }

  return (
    <div>
      <div className="field-row">
        <input
          type="number"
          inputMode="decimal"
          step={0.5}
          min={0}
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
          style={{ flex: '0 0 100px' }}
        />
        <span className="mono muted">g</span>
        <button type="button" className="primary" onClick={submit} disabled={!grams}>Submit</button>
        <span className="mono muted" style={{ marginLeft: 'auto' }}>{total}g today</span>
      </div>
      {entries.length > 0 && (
        <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14 }}>
          {entries
            .slice()
            .sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0))
            .map((e) => (
              <li key={e.id}>
                <span className="mono">{formatTime12h(e.time)}</span> — {e.grams}g
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
