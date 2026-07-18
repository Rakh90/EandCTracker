import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { todayStr } from '../lib/dates'
import { useDailyLog, useMealsForDate } from '../hooks/useDailyLog'
import { db } from '../db/db'
import Slider from '../components/ui/Slider'
import Stepper from '../components/ui/Stepper'
import ChipGroup from '../components/ui/ChipGroup'
import MealQuickAdd from '../components/MealQuickAdd'
import CaffeineQuickAdd from '../components/CaffeineQuickAdd'
import WaterQuickAdd from '../components/WaterQuickAdd'
import { DEFS } from '../lib/definitions'

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
      <p className="muted" style={{ marginTop: -12, marginBottom: 16 }}>
        Late morning through mid-afternoon — roughly 11am–4pm.
      </p>

      {!benchmarkCount && (
        <div className="card" style={{ borderColor: 'var(--cobalt)' }}>
          <h3>Benchmark not run yet today</h3>
          <button type="button" className="primary" onClick={() => navigate('/benchmark')}>Run benchmark</button>
        </div>
      )}

      <div className="card">
        <h3>Focus & fog</h3>
        <Stepper label="Focus minutes" value={log.focus_minutes} onChange={(v) => patch({ focus_minutes: v })} min={0} max={600} step={5} unit="m" />
        <Slider label="Midday fog" value={log.midday_fog} onChange={(v) => patch({ midday_fog: v })} min={0} max={10} hint={DEFS.fog} />
        <Stepper label="Memory slips" value={log.memory_slips} onChange={(v) => patch({ memory_slips: v })} min={0} max={20} hint={DEFS.memory_slips} />
        <ChipGroup
          label="Processing speed"
          options={Object.keys(SPEED_LABELS)}
          value={speedLabel}
          onChange={(v) => patch({ processing_speed: v === null ? null : SPEED_LABELS[v] })}
          hint={DEFS.processing_speed}
        />
        <Slider label="Stress" value={log.stress_midday} onChange={(v) => patch({ stress_midday: v })} min={1} max={10} hint={DEFS.stress} />
      </div>

      <div className="card">
        <h3>Intake</h3>
        <CaffeineQuickAdd totalMg={log.caffeine_mg} onAdd={(mg) => patch({ caffeine_mg: Math.max(0, (log.caffeine_mg || 0) + mg) })} />
        <WaterQuickAdd totalOz={log.water_total} onAdd={(oz) => patch({ water_total: Math.max(0, (log.water_total || 0) + oz) })} />
        <MealQuickAdd date={date} meals={meals} />
      </div>
    </div>
  )
}
