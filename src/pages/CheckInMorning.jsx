import { useNavigate } from 'react-router-dom'
import { todayStr } from '../lib/dates'
import { useDailyLog } from '../hooks/useDailyLog'
import Slider from '../components/ui/Slider'
import Stepper from '../components/ui/Stepper'
import ChipGroup from '../components/ui/ChipGroup'
import NumberInput from '../components/ui/NumberInput'

const WAKE_STATES = ['refreshed', 'neutral', 'tired']

export default function CheckInMorning() {
  const date = todayStr()
  const { log, patch } = useDailyLog(date)
  const navigate = useNavigate()

  return (
    <div>
      <div className="top-bar">
        <h1>Morning check-in</h1>
        <button type="button" onClick={() => navigate('/')}>Done</button>
      </div>

      <div className="card">
        <h3>Sleep</h3>
        <NumberInput label="Sleep hours" value={log.sleep_hours} onChange={(v) => patch({ sleep_hours: v })} step={0.25} unit="hrs" />
        <Slider label="Sleep quality" value={log.sleep_quality} onChange={(v) => patch({ sleep_quality: v })} min={1} max={10} />
        <ChipGroup label="Wake state" options={WAKE_STATES} value={log.wake_state} onChange={(v) => patch({ wake_state: v })} />
        <Stepper label="Night wakings" value={log.night_wakings} onChange={(v) => patch({ night_wakings: v })} min={0} max={10} />
      </div>

      <div className="card">
        <h3>Baseline ratings</h3>
        <Slider label="Physical energy" value={log.am_phys_energy} onChange={(v) => patch({ am_phys_energy: v })} min={1} max={10} />
        <Slider label="Mental energy" value={log.am_mental_energy} onChange={(v) => patch({ am_mental_energy: v })} min={1} max={10} />
        <Slider label="Mood" value={log.am_mood} onChange={(v) => patch({ am_mood: v })} min={1} max={10} />
        <Slider label="Fog" value={log.am_fog} onChange={(v) => patch({ am_fog: v })} min={0} max={10} />
      </div>
    </div>
  )
}
