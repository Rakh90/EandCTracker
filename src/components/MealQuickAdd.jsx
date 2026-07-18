import { useState } from 'react'
import { addMeal } from '../db/db'
import { nowTimeHHMM } from '../lib/dates'
import ChipGroup from './ui/ChipGroup'

const EFFECTS = ['energized', 'neutral', 'sluggish']

export default function MealQuickAdd({ date, meals }) {
  const [description, setDescription] = useState('')
  const [time, setTime] = useState(nowTimeHHMM())
  const [effect, setEffect] = useState(null)
  const [delay, setDelay] = useState(null)

  async function save() {
    if (!description.trim()) return
    await addMeal({
      date,
      time,
      description: description.trim(),
      energy_effect: effect,
      effect_delay_min: delay,
    })
    setDescription('')
    setEffect(null)
    setDelay(null)
    setTime(nowTimeHHMM())
  }

  return (
    <div className="field">
      <label>Meals</label>
      {meals.length > 0 && (
        <ul style={{ margin: '8px 0', paddingLeft: 18, fontSize: 14 }}>
          {meals.map((m) => (
            <li key={m.id}>
              <span className="mono">{m.time}</span> — {m.description}
              {m.energy_effect ? ` (${m.energy_effect})` : ''}
            </li>
          ))}
        </ul>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ flex: '0 0 100px' }} />
        <input
          type="text"
          placeholder="What did you eat?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <ChipGroup options={EFFECTS} value={effect} onChange={setEffect} />
      <div className="field-row" style={{ marginTop: 8 }}>
        <input
          type="number"
          inputMode="numeric"
          placeholder="Effect delay (min)"
          value={delay ?? ''}
          onChange={(e) => setDelay(e.target.value === '' ? null : Number(e.target.value))}
        />
        <button type="button" onClick={save} disabled={!description.trim()}>Add meal</button>
      </div>
    </div>
  )
}
