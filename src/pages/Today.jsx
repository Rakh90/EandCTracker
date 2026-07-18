import { Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { todayStr, addDays } from '../lib/dates'
import { lastNDates } from '../lib/dates'
import { mean } from '../lib/stats'
import { useCreatineForDate } from '../hooks/useDailyLog'
import CreatineLog from '../components/CreatineLog'
import { IconSun, IconCloudSun, IconMoon, IconBrain, IconCheck, IconChevron } from '../components/ui/Icons'

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
  return ['movement_type', 'exec_tasks', 'pm_phys_energy', 'pm_mental_energy', 'pm_mood', 'notes']
    .some((k) => log[k] !== null && log[k] !== undefined)
}

export default function Today() {
  const date = todayStr()
  const baselineDates = lastNDates(8, date) // includes today as last entry
  const priorDates = baselineDates.slice(0, 7)

  const todayLog = useLiveQuery(() => db.daily_log.get(date), [date])
  const creatineEntries = useCreatineForDate(date)
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

  const logsByDate = new Map((allLogs || []).map((l) => [l.date, l]))
  const streak = computeStreak(logsByDate, date)

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

      <div className="card">
        <h3>Creatine</h3>
        <p className="muted" style={{ marginTop: -8, marginBottom: 12 }}>Not tied to a time of day — submit each time you take a dose.</p>
        <CreatineLog date={date} entries={creatineEntries} />
      </div>
    </div>
  )
}
