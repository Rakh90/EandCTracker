import { useNavigate } from 'react-router-dom'
import { todayStr } from '../lib/dates'
import { useDailyLog, useMealsForDate } from '../hooks/useDailyLog'
import Slider from '../components/ui/Slider'
import Stepper from '../components/ui/Stepper'
import ChipGroup from '../components/ui/ChipGroup'
import NumberInput from '../components/ui/NumberInput'
import MealQuickAdd from '../components/MealQuickAdd'
import CaffeineQuickAdd from '../components/CaffeineQuickAdd'
import WaterQuickAdd from '../components/WaterQuickAdd'
import { DEFS } from '../lib/definitions'

const WAKE_STATES = ['refreshed', 'neutral', 'tired']

export default function CheckInMorning() {
  const date = todayStr()
  const { log, patch } = useDailyLog(date)
  const meals = useMealsForDate(date)
  const navigate = useNavigate()

  return (
    <div>
      <div className="top-bar">
        <h1>Morning check-in</h1>
        <button type="button" onClick={() => navigate('/')}>Done</button>
      </div>
      <p className="muted" style={{ marginTop: -12, marginBottom: 16 }}>
        Fill out shortly after waking — roughly 5–11am.
      </p>

      <div className="card">
        <h3>Sleep</h3>
        <NumberInput label="Sleep hours" value={log.sleep_hours} onChange={(v) => patch({ sleep_hours: v })} step={0.25} unit="hrs" />
        <Slider label="Sleep quality" value={log.sleep_quality} onChange={(v) => patch({ sleep_quality: v })} min={1} max={10} hint={DEFS.sleep_quality} />
        <ChipGroup label="Wake state" options={WAKE_STATES} value={log.wake_state} onChange={(v) => patch({ wake_state: v })} />
        <Stepper label="Night wakings" value={log.night_wakings} onChange={(v) => patch({ night_wakings: v })} min={0} max={10} />
      </div>

      <div className="card">
        <h3>Baseline ratings</h3>
        <Slider label="Physical energy" value={log.am_phys_energy} onChange={(v) => patch({ am_phys_energy: v })} min={1} max={10} hint={DEFS.phys_energy} />
        <Slider label="Mental energy" value={log.am_mental_energy} onChange={(v) => patch({ am_mental_energy: v })} min={1} max={10} hint={DEFS.mental_energy} />
        <Slider label="Mood" value={log.am_mood} onChange={(v) => patch({ am_mood: v })} min={1} max={10} hint={DEFS.mood} />
        <Slider label="Fog" value={log.am_fog} onChange={(v) => patch({ am_fog: v })} min={0} max={10} hint={DEFS.fog} />
      </div>

      <div className="card">
        <h3>Breakfast & intake</h3>
        <MealQuickAdd date={date} meals={meals} />
        <CaffeineQuickAdd totalMg={log.caffeine_mg} onAdd={(mg) => patch({ caffeine_mg: Math.max(0, (log.caffeine_mg || 0) + mg) })} />
        <WaterQuickAdd totalOz={log.water_total} onAdd={(oz) => patch({ water_total: Math.max(0, (log.water_total || 0) + oz) })} />
      </div>
    </div>
  )
}
