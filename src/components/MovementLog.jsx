import { useState } from 'react'
import { addMovementLog, deleteMovementLog } from '../db/db'
import { nowTimeHHMM, formatTime12h, logicalMinutes } from '../lib/dates'
import { DEFS } from '../lib/definitions'
import ChipGroup from './ui/ChipGroup'
import Stepper from './ui/Stepper'
import Slider from './ui/Slider'
import TimeInput from './ui/TimeInput'
import { IconTrash } from './ui/Icons'

const MOVEMENT_TYPES = ['Walk', 'Run', 'Gym', 'Yoga', 'Sports']

export default function MovementLog({ date, entries }) {
  const [type, setType] = useState(null)
  const [minutes, setMinutes] = useState(20)
  const [intensity, setIntensity] = useState(5)
  const [time, setTime] = useState(nowTimeHHMM())

  const totalMinutes = entries.reduce((sum, e) => sum + (e.minutes || 0), 0)

  async function submit() {
    if (!type) return
    await addMovementLog({ date, time: time || nowTimeHHMM(), movement_type: type, minutes, intensity })
    setType(null)
  }

  return (
    <div>
      <ChipGroup label="Type" options={MOVEMENT_TYPES} value={type} onChange={setType} />
      <Stepper label="Minutes" value={minutes} onChange={setMinutes} min={5} max={300} step={5} />
      <Slider label="Intensity" value={intensity} onChange={setIntensity} min={1} max={10} hint={DEFS.movement_intensity} />
      <TimeInput label="Time" value={time} onChange={setTime} />
      <div className="field-row" style={{ marginTop: 8 }}>
        <button type="button" className="primary" onClick={submit} disabled={!type}>Submit</button>
        <span className="mono muted" style={{ marginLeft: 'auto' }}>{totalMinutes}m today</span>
      </div>
      {entries.length > 0 && (
        <ul className="entry-list">
          {entries
            .slice()
            .sort((a, b) => logicalMinutes(a.time) - logicalMinutes(b.time))
            .map((e) => (
              <li key={e.id} className="entry-row">
                <span className="entry-text">
                  <span className="mono">{formatTime12h(e.time)}</span> — {e.movement_type}, {e.minutes}m, intensity {e.intensity}
                </span>
                <button type="button" className="icon-btn icon-btn-danger" onClick={() => deleteMovementLog(e.id)} aria-label="Delete entry">
                  <IconTrash width={16} height={16} strokeWidth={1.8} />
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  )
}
