import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { todayStr } from '../lib/dates'
import { useDailyLog, useMealsForDate } from '../hooks/useDailyLog'
import { db } from '../db/db'
import Slider from '../components/ui/Slider'
import Stepper from '../components/ui/Stepper'
import ChipGroup from '../components/ui/ChipGroup'
import NumberInput from '../components/ui/NumberInput'
import MealQuickAdd from '../components/MealQuickAdd'

const SPEED_LABELS = { Slower: -1, Normal: 0, Faster: 1 }

export default function CheckInMidday() {
  const date = todayStr()
  const { log, patch } = useDailyLog(date)
  const meals = useMealsForDate(date)
  const navigate = useNavigate()
  const benchmarkCount = useLiveQuery(() => db.benchmark_runs.where('date').equals(date).count(), [date])

  const speedLabel = Object.keys(SPEED_LABELS).find((k) => SPEED_LABELS[k] === log.processing_speed) || null

  return (
    <div>
      <div className="top-bar">
        <h1>Midday check-in</h1>
        <button type="button" onClick={() => navigate('/')}>Done</button>
      </div>

      {!benchmarkCount && (
        <div className="card" style={{ borderColor: 'var(--cobalt)' }}>
          <h3>Benchmark not run yet today</h3>
          <button type="button" className="primary" onClick={() => navigate('/benchmark')}>Run benchmark</button>
        </div>
      )}

      <div className="card">
        <h3>Focus & fog</h3>
        <Stepper label="Focus minutes" value={log.focus_minutes} onChange={(v) => patch({ focus_minutes: v })} min={0} max={600} step={5} unit="m" />
        <Slider label="Midday fog" value={log.midday_fog} onChange={(v) => patch({ midday_fog: v })} min={0} max={10} />
        <Stepper label="Memory slips" value={log.memory_slips} onChange={(v) => patch({ memory_slips: v })} min={0} max={20} />
        <ChipGroup
          label="Processing speed"
          options={Object.keys(SPEED_LABELS)}
          value={speedLabel}
          onChange={(v) => patch({ processing_speed: v === null ? null : SPEED_LABELS[v] })}
        />
        <Slider label="Stress" value={log.stress_midday} onChange={(v) => patch({ stress_midday: v })} min={1} max={10} />
      </div>

      <div className="card">
        <h3>Intake</h3>
        <NumberInput label="Caffeine" value={log.caffeine_mg} onChange={(v) => patch({ caffeine_mg: v })} step={10} unit="mg" />
        <NumberInput label="Water total" value={log.water_total} onChange={(v) => patch({ water_total: v })} step={0.1} unit="L" />
        <MealQuickAdd date={date} meals={meals} />
      </div>
    </div>
  )
}
