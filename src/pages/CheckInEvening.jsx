import { useNavigate } from 'react-router-dom'
import { todayStr } from '../lib/dates'
import { useDailyLog, useMealsForDate } from '../hooks/useDailyLog'
import Slider from '../components/ui/Slider'
import Stepper from '../components/ui/Stepper'
import ChipGroup from '../components/ui/ChipGroup'
import MealQuickAdd from '../components/MealQuickAdd'
import CaffeineQuickAdd from '../components/CaffeineQuickAdd'
import WaterQuickAdd from '../components/WaterQuickAdd'
import { DEFS } from '../lib/definitions'

const SYMPTOMS = [
  { key: 'symptom_headache', label: 'Headache' },
  { key: 'symptom_soreness', label: 'Soreness' },
  { key: 'symptom_stomach', label: 'Stomach' },
]
const CRASH_OPTIONS = ['Yes', 'No']

export default function CheckInEvening() {
  const date = todayStr()
  const { log, patch } = useDailyLog(date)
  const meals = useMealsForDate(date)
  const navigate = useNavigate()

  const activeSymptoms = SYMPTOMS.filter((s) => (log[s.key] ?? 0) > 0).map((s) => s.label)

  function toggleSymptoms(labels) {
    for (const s of SYMPTOMS) {
      const isOn = labels.includes(s.label)
      const wasOn = (log[s.key] ?? 0) > 0
      if (isOn && !wasOn) patch({ [s.key]: 5 })
      if (!isOn && wasOn) patch({ [s.key]: 0 })
    }
  }

  const crashValue = log.post_meal_crash === 1 ? 'Yes' : log.post_meal_crash === 0 ? 'No' : null

  return (
    <div>
      <div className="top-bar">
        <h1>Evening check-in</h1>
        <button type="button" onClick={() => navigate('/')}>Done</button>
      </div>
      <p className="muted" style={{ marginTop: -12, marginBottom: 16 }}>
        End of day, before bed — roughly 4pm–11pm.
      </p>

      <div className="card">
        <h3>Symptoms</h3>
        <ChipGroup options={SYMPTOMS.map((s) => s.label)} value={activeSymptoms} onChange={toggleSymptoms} multi />
        {SYMPTOMS.filter((s) => (log[s.key] ?? 0) > 0).map((s) => (
          <Slider key={s.key} label={`${s.label} severity`} value={log[s.key]} onChange={(v) => patch({ [s.key]: v })} min={1} max={10} hint={DEFS.symptom_severity} />
        ))}
        <div className="field">
          <label>Other symptoms</label>
          <input type="text" value={log.symptom_other || ''} onChange={(e) => patch({ symptom_other: e.target.value })} style={{ marginTop: 6 }} />
        </div>
      </div>

      <div className="card">
        <h3>Executive function</h3>
        <Slider label="Task completion" value={log.exec_tasks} onChange={(v) => patch({ exec_tasks: v })} min={1} max={10} hint={DEFS.exec_tasks} />
        <Slider label="Problem solving" value={log.exec_problems} onChange={(v) => patch({ exec_problems: v })} min={1} max={10} hint={DEFS.exec_problems} />
        <Slider label="Organization" value={log.exec_organization} onChange={(v) => patch({ exec_organization: v })} min={1} max={10} hint={DEFS.exec_organization} />
      </div>

      <div className="card">
        <h3>End-of-day state</h3>
        <Slider label="Physical energy" value={log.pm_phys_energy} onChange={(v) => patch({ pm_phys_energy: v })} min={1} max={10} hint={DEFS.phys_energy} />
        <Slider label="Mental energy" value={log.pm_mental_energy} onChange={(v) => patch({ pm_mental_energy: v })} min={1} max={10} hint={DEFS.mental_energy} />
        <Slider label="Mood" value={log.pm_mood} onChange={(v) => patch({ pm_mood: v })} min={1} max={10} hint={DEFS.mood} />
        <Slider label="Stress (day average)" value={log.stress_avg} onChange={(v) => patch({ stress_avg: v })} min={1} max={10} hint={DEFS.stress} />
        <ChipGroup label="Post-meal crash" options={CRASH_OPTIONS} value={crashValue} onChange={(v) => patch({ post_meal_crash: v === 'Yes' ? 1 : v === 'No' ? 0 : null })} />
        {log.post_meal_crash === 1 && (
          <Stepper label="Crash delay" value={log.crash_delay_min} onChange={(v) => patch({ crash_delay_min: v })} min={0} max={300} step={5} unit="m" />
        )}
      </div>

      <div className="card">
        <h3>Remaining food & intake</h3>
        <MealQuickAdd date={date} meals={meals} />
        <CaffeineQuickAdd totalMg={log.caffeine_mg} onAdd={(mg) => patch({ caffeine_mg: Math.max(0, (log.caffeine_mg || 0) + mg) })} />
        <WaterQuickAdd totalOz={log.water_total} onAdd={(oz) => patch({ water_total: Math.max(0, (log.water_total || 0) + oz) })} />
      </div>

      <div className="card">
        <h3>Notes</h3>
        <textarea rows={4} value={log.notes || ''} onChange={(e) => patch({ notes: e.target.value })} />
      </div>
    </div>
  )
}
