import { mean } from './stats'
import { addDays, daysBetween, todayStr } from './dates'

// Concrete, variable-specific instructions for running an experiment — a
// correlation alone doesn't tell you what to actually go and change.
export const EXPERIMENT_GUIDANCE = {
  sleep_quality: {
    days: 14,
    action: "Sleep quality isn't something you dose directly. Hold a consistent routine for 14 nights — fixed bed/wake time, no screens in the last 30 minutes — and see if quality trends up.",
  },
  sleep_hours: {
    days: 14,
    action: 'Aim for at least 7.5 hours in bed, 14 nights in a row, then compare to your prior average.',
  },
  movement_intensity: {
    days: 14,
    action: 'Add 3–4 sessions a week of moderate-or-harder movement (RPE 6+) for 14 days.',
  },
  stress_avg: {
    days: 14,
    action: "Stress isn't directly controllable, but a response to it can be. Pick one mitigation — a daily 10-minute walk, a breathing break — and hold it steady for 14 days.",
  },
  caffeine_mg: {
    days: 14,
    action: 'Pick one consistent daily target (e.g. under 150mg, or shift your intake earlier in the day) and hold it steady for 14 days.',
  },
  water_total: {
    days: 14,
    action: 'Aim for at least 80oz/day for 14 days.',
  },
  creatine_g: {
    days: 14,
    action: 'Take a consistent 5g/day, at the same time each day, for 14 days.',
  },
}

export const DEFAULT_GUIDANCE = {
  days: 14,
  action: 'Hold this variable at a deliberate, consistent level for 14 days rather than letting it vary.',
}

export function guidanceFor(variableKey) {
  return EXPERIMENT_GUIDANCE[variableKey] || DEFAULT_GUIDANCE
}

// Compares the mean of `outputKey` during the experiment window against an
// equal-length window immediately before it started — the closest a
// single-subject, no-control-group setup can get to "did this actually move."
export function computeExperimentResult(experiment, series) {
  const start = experiment.start_date
  const end = experiment.end_date || todayStr()
  const windowDays = daysBetween(start, end) + 1
  const beforeEnd = addDays(start, -1)
  const beforeStart = addDays(start, -windowDays)

  const afterVals = series
    .filter((r) => r.date >= start && r.date <= end)
    .map((r) => r[experiment.target_output])
    .filter((v) => v !== null && v !== undefined && !Number.isNaN(v))
  const beforeVals = series
    .filter((r) => r.date >= beforeStart && r.date <= beforeEnd)
    .map((r) => r[experiment.target_output])
    .filter((v) => v !== null && v !== undefined && !Number.isNaN(v))

  const beforeMean = mean(beforeVals)
  const afterMean = mean(afterVals)
  return {
    beforeMean, afterMean,
    n_before: beforeVals.length, n_after: afterVals.length,
    delta: beforeMean !== null && afterMean !== null ? afterMean - beforeMean : null,
    windowDays,
  }
}

export function summarizeExperimentResult(experiment, result, outputLabel) {
  if (result.n_before < 3 || result.n_after < 3) {
    return `Not enough data on both sides yet to compare (${result.n_before} days before, ${result.n_after} days during/after).`
  }
  const dir = result.delta > 0 ? 'up' : result.delta < 0 ? 'down' : 'unchanged'
  return `${outputLabel} averaged ${result.beforeMean.toFixed(1)} in the ${result.windowDays} days before, vs ${result.afterMean.toFixed(1)} during/after — ${dir}${result.delta !== 0 ? ` by ${Math.abs(result.delta).toFixed(1)}` : ''} (n=${result.n_before} before, ${result.n_after} during/after).`
}
