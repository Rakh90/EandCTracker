import { mean } from './stats'

export const INPUT_VARS = [
  { key: 'sleep_quality', label: 'Sleep quality' },
  { key: 'sleep_hours', label: 'Sleep hours' },
  { key: 'movement_intensity', label: 'Movement intensity' },
  { key: 'stress_avg', label: 'Stress (avg)' },
  { key: 'caffeine_mg', label: 'Caffeine (mg)' },
  { key: 'water_total', label: 'Water total' },
]

export const OUTPUT_VARS = [
  { key: 'composite', label: 'Benchmark composite' },
  { key: 'focus_minutes', label: 'Focus minutes' },
  { key: 'fog', label: 'Fog' },
  { key: 'memory_slips', label: 'Memory slips' },
  { key: 'exec_avg', label: 'Executive function (avg)' },
  { key: 'pm_energy', label: 'PM energy' },
]

function avg(...vals) {
  const nums = vals.filter((v) => v !== null && v !== undefined && !Number.isNaN(v))
  return nums.length ? mean(nums) : null
}

// Joins daily_log rows with benchmark_runs (averaged per day) into one row per date
// carrying every variable referenced by INPUT_VARS / OUTPUT_VARS plus raw energy/mood fields.
export function buildDailySeries(logs, benchmarkRuns) {
  const byDate = new Map()
  for (const log of logs) {
    byDate.set(log.date, { date: log.date, ...log })
  }
  const runsByDate = new Map()
  for (const run of benchmarkRuns) {
    const arr = runsByDate.get(run.date) || []
    arr.push(run)
    runsByDate.set(run.date, arr)
  }
  const dates = new Set([...byDate.keys(), ...runsByDate.keys()])
  const rows = []
  for (const date of dates) {
    const log = byDate.get(date) || { date }
    const runs = runsByDate.get(date) || []
    const compositeArr = runs.map((r) => r.composite).filter((v) => v !== null && v !== undefined)
    const spanArr = runs.map((r) => r.span_score).filter((v) => v !== null && v !== undefined)
    const rtArr = runs.map((r) => r.rt_score).filter((v) => v !== null && v !== undefined)
    const sprintArr = runs.map((r) => r.sprint_score).filter((v) => v !== null && v !== undefined)
    rows.push({
      date,
      sleep_hours: log.sleep_hours ?? null,
      sleep_quality: log.sleep_quality ?? null,
      movement_intensity: log.movement_intensity ?? null,
      stress_avg: log.stress_avg ?? null,
      caffeine_mg: log.caffeine_mg ?? null,
      water_total: log.water_total ?? null,
      focus_minutes: log.focus_minutes ?? null,
      memory_slips: log.memory_slips ?? null,
      fog: avg(log.am_fog, log.midday_fog),
      exec_avg: avg(log.exec_tasks, log.exec_problems, log.exec_organization),
      pm_energy: avg(log.pm_phys_energy, log.pm_mental_energy),
      am_mental_energy: log.am_mental_energy ?? null,
      am_phys_energy: log.am_phys_energy ?? null,
      am_mood: log.am_mood ?? null,
      pm_mental_energy: log.pm_mental_energy ?? null,
      pm_phys_energy: log.pm_phys_energy ?? null,
      pm_mood: log.pm_mood ?? null,
      composite: compositeArr.length ? mean(compositeArr) : null,
      span_score: spanArr.length ? mean(spanArr) : null,
      rt_score: rtArr.length ? mean(rtArr) : null,
      sprint_score: sprintArr.length ? mean(sprintArr) : null,
    })
  }
  rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  return rows
}

// First N distinct dates (ascending) that have at least one benchmark run — flagged as
// calibration / practice-effect days and excluded from correlation stats by default.
export function getCalibrationDates(benchmarkRuns, n = 5) {
  const dates = [...new Set(benchmarkRuns.map((r) => r.date))].sort()
  return new Set(dates.slice(0, n))
}

export function filterCalibration(series, calibrationDates, exclude) {
  if (!exclude) return series
  return series.filter((row) => !calibrationDates.has(row.date))
}
