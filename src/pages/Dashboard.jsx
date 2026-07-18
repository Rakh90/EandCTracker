import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { buildDailySeries, getCalibrationDates, filterCalibration } from '../lib/metrics'
import EnergyMoodChart from '../components/dashboard/EnergyMoodChart'
import SleepChart from '../components/dashboard/SleepChart'
import CompositeChart from '../components/dashboard/CompositeChart'
import CreatineChart from '../components/dashboard/CreatineChart'
import MovementChart from '../components/dashboard/MovementChart'
import TrendRelationships from '../components/dashboard/TrendRelationships'
import CorrelationHeatmap from '../components/dashboard/CorrelationHeatmap'
import CrashMap from '../components/dashboard/CrashMap'

const RANGES = [7, 30, 90]
const EMPTY = []

export default function Dashboard() {
  const [range, setRange] = useState(30)
  const [excludeCalibration, setExcludeCalibration] = useState(true)

  const logs = useLiveQuery(() => db.daily_log.toArray(), []) ?? EMPTY
  const runs = useLiveQuery(() => db.benchmark_runs.toArray(), []) ?? EMPTY
  const meals = useLiveQuery(() => db.meals.toArray(), []) ?? EMPTY
  const creatineIntakes = useLiveQuery(() => db.creatine_intakes.toArray(), []) ?? EMPTY
  const movementLogs = useLiveQuery(() => db.movement_logs.toArray(), []) ?? EMPTY

  const fullSeries = useMemo(
    () => buildDailySeries(logs, runs, creatineIntakes, movementLogs),
    [logs, runs, creatineIntakes, movementLogs]
  )
  const rangedSeries = useMemo(() => fullSeries.slice(-range), [fullSeries, range])
  const calibrationDates = useMemo(() => getCalibrationDates(runs), [runs])
  const correlationSeries = useMemo(
    () => filterCalibration(rangedSeries, calibrationDates, excludeCalibration),
    [rangedSeries, calibrationDates, excludeCalibration]
  )

  return (
    <div>
      <div className="top-bar">
        <h1>Dashboard</h1>
      </div>

      <div className="chip-group" style={{ marginBottom: 12 }}>
        {RANGES.map((r) => (
          <div key={r} className={`chip${range === r ? ' selected' : ''}`} role="button" tabIndex={0} onClick={() => setRange(r)}>
            {r}d
          </div>
        ))}
      </div>

      {rangedSeries.length > 0 && <TrendRelationships series={rangedSeries} />}

      <div className="card">
        <div className="field-row">
          <label style={{ margin: 0 }}>Exclude calibration days ({calibrationDates.size})</label>
          <input
            type="checkbox"
            style={{ width: 'auto' }}
            checked={excludeCalibration}
            onChange={(e) => setExcludeCalibration(e.target.checked)}
          />
        </div>
        <p className="muted" style={{ marginTop: 6 }}>
          First 5 benchmark days are flagged as practice-effect calibration and excluded from correlation stats by default.
        </p>
      </div>

      <CorrelationHeatmap series={correlationSeries} />

      {rangedSeries.length === 0 ? (
        <div className="card"><p className="muted">No data yet — complete a check-in to see trends.</p></div>
      ) : (
        <>
          <EnergyMoodChart series={rangedSeries} />
          <SleepChart series={rangedSeries} />
          <CompositeChart series={rangedSeries} />
          <CreatineChart series={rangedSeries} />
          <MovementChart series={rangedSeries} />
        </>
      )}

      <CrashMap meals={meals} />
    </div>
  )
}
