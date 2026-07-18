import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { todayStr, addDays, nowTimeHHMM, formatTime12h, daysBetween } from '../lib/dates'
import { lastNDates } from '../lib/dates'
import { mean } from '../lib/stats'
import { useCreatineForDate, useDailyLog } from '../hooks/useDailyLog'
import { useSetting } from '../hooks/useSetting'
import { labelFor } from '../lib/metrics'
import CreatineLog from '../components/CreatineLog'
import ChipGroup from '../components/ui/ChipGroup'
import Stepper from '../components/ui/Stepper'
import Slider from '../components/ui/Slider'
import { DEFS } from '../lib/definitions'
import { IconSun, IconCloudSun, IconMoon, IconBrain, IconCheck, IconChevron, IconClock } from '../components/ui/Icons'

const MOVEMENT_TYPES = ['Walk', 'Run', 'Gym', 'Yoga', 'Sports', 'None']

function isAnyCheckInDone(log) {
  if (!log) return false
  return isMorningDone(log) || isMiddayDone(log) || isEveningDone(log)
}

function computeStreak(logsByDate, date) {
  let streak = 0
  let cursor = date
  // Today may not be logged yet — don't break the streak on today alone.
  if (!isAnyCheckInDone(logsByDate.get(cursor))) cursor = addDays(cursor, -1)
  while (isAnyCheckInDone(logsByDate.get(cursor))) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

function avg(...vals) {
  const nums = vals.filter((v) => v !== null && v !== undefined && !Number.isNaN(v))
  return nums.length ? mean(nums) : null
}

function isMorningDone(log) {
  if (!log) return false
  return ['sleep_hours', 'sleep_quality', 'wake_state', 'am_phys_energy', 'am_mental_energy', 'am_mood', 'am_fog']
    .some((k) => log[k] !== null && log[k] !== undefined)
}

function isMiddayDone(log) {
  if (!log) return false
  // caffeine_mg/water_total are excluded here since they're now logged from any
  // of the three check-ins, not just midday — they can't signal this section alone.
  return ['focus_minutes', 'midday_fog', 'memory_slips', 'stress_midday', 'processing_speed']
    .some((k) => log[k] !== null && log[k] !== undefined)
}

function isEveningDone(log) {
  if (!log) return false
  return ['exec_tasks', 'pm_phys_energy', 'pm_mental_energy', 'pm_mood', 'notes']
    .some((k) => log[k] !== null && log[k] !== undefined)
}

export default function Today() {
  const date = todayStr()
  const baselineDates = lastNDates(8, date) // includes today as last entry
  const priorDates = baselineDates.slice(0, 7)

  const { log: editableLog, patch } = useDailyLog(date)
  const todayLog = useLiveQuery(() => db.daily_log.get(date), [date])
  const creatineEntries = useCreatineForDate(date)
  const [reminderTimes] = useSetting('benchmarkReminderTimes', ['09:00'])
  const allLogs = useLiveQuery(() => db.daily_log.toArray(), [])
  const priorLogs = useLiveQuery(
    () => db.daily_log.where('date').anyOf(priorDates).toArray(),
    [date]
  )
  const benchmarkToday = useLiveQuery(
    () => db.benchmark_runs.where('date').equals(date).toArray(),
    [date]
  )
  const benchmarkPrior = useLiveQuery(
    () => db.benchmark_runs.where('date').anyOf(priorDates).toArray(),
    [date]
  )
  const activeExperiments = useLiveQuery(
    () => db.experiments.filter((e) => !e.end_date).toArray(),
    []
  )

  const logsByDate = new Map((allLogs || []).map((l) => [l.date, l]))
  const streak = computeStreak(logsByDate, date)
  const sortedReminders = [...(reminderTimes || [])].sort()
  const nowTime = nowTimeHHMM()

  const morningDone = isMorningDone(todayLog)
  const middayDone = isMiddayDone(todayLog)
  const eveningDone = isEveningDone(todayLog)
  const benchmarkDone = (benchmarkToday || []).length > 0

  const nextCheckIn = !morningDone ? { to: '/checkin/morning', label: 'Morning check-in' }
    : !middayDone ? { to: '/checkin/midday', label: 'Midday check-in' }
    : !eveningDone ? { to: '/checkin/evening', label: 'Evening check-in' }
    : !benchmarkDone ? { to: '/benchmark', label: 'Run benchmark' }
    : null

  const todayMental = avg(todayLog?.am_mental_energy, todayLog?.pm_mental_energy)
  const todayPhys = avg(todayLog?.am_phys_energy, todayLog?.pm_phys_energy)
  const todayMood = avg(todayLog?.am_mood, todayLog?.pm_mood)
  const todayComposite = (benchmarkToday || []).length
    ? mean((benchmarkToday || []).map((r) => r.composite).filter((v) => v !== null && v !== undefined))
    : null

  const priorMental = mean((priorLogs || []).map((l) => avg(l.am_mental_energy, l.pm_mental_energy)).filter((v) => v !== null))
  const priorPhys = mean((priorLogs || []).map((l) => avg(l.am_phys_energy, l.pm_phys_energy)).filter((v) => v !== null))
  const priorMood = mean((priorLogs || []).map((l) => avg(l.am_mood, l.pm_mood)).filter((v) => v !== null))
  const priorComposite = mean((benchmarkPrior || []).map((r) => r.composite).filter((v) => v !== null && v !== undefined))

  function fmt(v) {
    return v === null || v === undefined || Number.isNaN(v) ? '—' : v.toFixed(1)
  }

  return (
    <div>
      <div className="top-bar">
        <h1>Today</h1>
        <span className="mono muted">{date}</span>
      </div>

      <div className="card">
        <div className="field-row" style={{ marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Check-ins</h3>
          {streak > 0 && <span className="mono muted">{streak}-day streak</span>}
        </div>
        {[
          { to: '/checkin/morning', label: 'Morning', done: morningDone, badge: morningDone ? 'done' : 'pending', Icon: IconSun },
          { to: '/checkin/midday', label: 'Midday', done: middayDone, badge: middayDone ? 'done' : 'pending', Icon: IconCloudSun },
          { to: '/checkin/evening', label: 'Evening', done: eveningDone, badge: eveningDone ? 'done' : 'pending', Icon: IconMoon },
          {
            to: '/benchmark',
            label: 'Benchmark',
            done: benchmarkDone,
            badge: benchmarkDone ? `${benchmarkToday.length}x today` : 'pending',
            Icon: IconBrain,
          },
        ].map(({ to, label, done, badge, Icon }) => (
          <Link key={to} to={to} className="list-row">
            <span className={`row-icon${done ? ' done' : ''}`}>
              {done ? <IconCheck width={18} height={18} strokeWidth={2.2} /> : <Icon width={18} height={18} />}
            </span>
            <span className="row-label">{label}</span>
            <span className={`badge ${done ? 'done' : 'pending'}`}>{badge}</span>
            <IconChevron width={16} height={16} className="row-chevron" />
          </Link>
        ))}
        {nextCheckIn ? (
          <Link to={nextCheckIn.to}>
            <button type="button" className="primary" style={{ width: '100%', marginTop: 10 }}>{nextCheckIn.label}</button>
          </Link>
        ) : (
          <p className="muted" style={{ marginTop: 14 }}>All check-ins complete for today.</p>
        )}
      </div>

      <div className="card">
        <div className="field-row" style={{ marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Benchmark reminders</h3>
          <Link to="/settings" className="muted mono" style={{ fontSize: 12 }}>edit</Link>
        </div>
        {sortedReminders.length === 0 ? (
          <p className="muted">
            No reminder times set. <Link to="/settings">Add some in Settings</Link>.
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {sortedReminders.map((t) => {
                const passed = t <= nowTime
                return (
                  <span
                    key={t}
                    className="mono"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '6px 10px', borderRadius: 'var(--radius-pill)',
                      background: passed ? 'var(--surface-2)' : 'var(--accent-soft)',
                      color: passed ? 'var(--ink-muted)' : 'var(--cobalt)',
                    }}
                  >
                    <IconClock width={14} height={14} strokeWidth={2} />
                    {formatTime12h(t)}
                  </span>
                )
              })}
            </div>
            <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>
              {(benchmarkToday || []).length} of {sortedReminders.length} run today. These are visual nudges only —
              browsers don't reliably allow this app to push background notifications, so check back at these times.
            </p>
          </>
        )}
      </div>

      <div className="card">
        <h3>Today vs 7-day baseline</h3>
        <div className="stat-row">
          <div className="stat-tile">
            <div className="num">{fmt(todayMental)}</div>
            <div className="label">Mental</div>
            <div className="muted">vs {fmt(priorMental)}</div>
          </div>
          <div className="stat-tile">
            <div className="num">{fmt(todayPhys)}</div>
            <div className="label">Physical</div>
            <div className="muted">vs {fmt(priorPhys)}</div>
          </div>
          <div className="stat-tile">
            <div className="num">{fmt(todayMood)}</div>
            <div className="label">Mood</div>
            <div className="muted">vs {fmt(priorMood)}</div>
          </div>
          <div className="stat-tile">
            <div className="num">{fmt(todayComposite)}</div>
            <div className="label">Composite</div>
            <div className="muted">vs {fmt(priorComposite)}</div>
          </div>
        </div>
      </div>

      {(activeExperiments || []).length > 0 && (
        <div className="card">
          <div className="field-row" style={{ marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Active experiments</h3>
            <Link to="/insights" className="muted mono" style={{ fontSize: 12 }}>manage</Link>
          </div>
          {activeExperiments.map((e) => {
            const targetDays = e.target_days || 14
            const dayNum = Math.min(daysBetween(e.start_date, date) + 1, targetDays)
            return (
              <div key={e.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <div className="field-row" style={{ marginBottom: 2 }}>
                  <p style={{ margin: 0, fontWeight: 600, textTransform: 'capitalize' }}>{labelFor(e.variable_changed)}</p>
                  <span className="badge pending">day {dayNum} of {targetDays}</span>
                </div>
                {e.action && <p className="muted" style={{ margin: 0 }}>{e.action}</p>}
              </div>
            )
          })}
          <p className="muted" style={{ margin: 0, fontSize: 12 }}>
            To end an experiment and record its outcome, head to the Insights page.
          </p>
        </div>
      )}

      <div className="card">
        <h3>Movement</h3>
        <p className="muted" style={{ marginTop: -8, marginBottom: 12 }}>Not tied to a time of day — log it whenever it happens.</p>
        <ChipGroup label="Type" options={MOVEMENT_TYPES} value={editableLog.movement_type} onChange={(v) => patch({ movement_type: v })} />
        <Stepper label="Minutes" value={editableLog.movement_min} onChange={(v) => patch({ movement_min: v })} min={0} max={300} step={5} />
        <Slider label="Intensity" value={editableLog.movement_intensity} onChange={(v) => patch({ movement_intensity: v })} min={1} max={10} hint={DEFS.movement_intensity} />
      </div>

      <div className="card">
        <h3>Creatine</h3>
        <p className="muted" style={{ marginTop: -8, marginBottom: 12 }}>Not tied to a time of day — submit each time you take a dose.</p>
        <CreatineLog date={date} entries={creatineEntries} />
      </div>
    </div>
  )
}
