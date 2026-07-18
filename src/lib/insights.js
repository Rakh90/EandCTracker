import { pearson, lagPairs, mean, stddev } from './stats'
import { INPUT_VARS, OUTPUT_VARS } from './metrics'
import { lastNDates } from './dates'
import { guidanceFor } from './experiments'

const MIN_N = 10
const MIN_R = 0.4

// r is a correlation coefficient: -1 to 1. Positive = the two tend to move
// together; negative = one goes up as the other goes down; near 0 = little
// relationship. |r| below these bands isn't shown at all (see MIN_R above).
export function strengthLabel(r) {
  const a = Math.abs(r)
  if (a >= 0.8) return 'very strong'
  if (a >= 0.6) return 'strong'
  return 'moderate'
}

export function getThresholdFlags(logs, series) {
  const flags = []
  const byDate = new Map(logs.map((l) => [l.date, l]))
  const sortedDates = [...byDate.keys()].sort()

  // sleep_quality < 6 for 3+ consecutive days (trailing streak)
  let streak = 0
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const q = byDate.get(sortedDates[i]).sleep_quality
    if (q !== null && q !== undefined && q < 6) streak++
    else break
  }
  if (streak >= 3) {
    flags.push({
      id: 'sleep_quality_streak',
      severity: 'warn',
      message: `Sleep quality has been below 6 for ${streak} consecutive days.`,
    })
  }

  // composite > 1.5 SD below 30-day mean
  const last30 = series.filter((r) => r.composite !== null).slice(-30)
  if (last30.length >= 5) {
    const composites = last30.map((r) => r.composite)
    const m = mean(composites)
    const sd = stddev(composites)
    const latest = last30[last30.length - 1]
    if (sd && latest.composite < m - 1.5 * sd) {
      flags.push({
        id: 'composite_dip',
        severity: 'warn',
        message: `Today's benchmark composite (${latest.composite.toFixed(1)}) is more than 1.5 SD below your 30-day mean (${m.toFixed(1)}, n=${last30.length}).`,
      })
    }
  } else {
    flags.push({ id: 'composite_dip', severity: 'info', message: 'Not enough benchmark data yet to flag composite dips.' })
  }

  // memory_slips > 2x weekly average
  const last7 = sortedDates.slice(-8, -1).map((d) => byDate.get(d).memory_slips).filter((v) => v !== null && v !== undefined)
  const todayRow = sortedDates.length ? byDate.get(sortedDates[sortedDates.length - 1]) : null
  if (last7.length >= 3 && todayRow && todayRow.memory_slips !== null && todayRow.memory_slips !== undefined) {
    const weeklyAvg = mean(last7)
    if (weeklyAvg > 0 && todayRow.memory_slips > 2 * weeklyAvg) {
      flags.push({
        id: 'memory_slips_spike',
        severity: 'warn',
        message: `Memory slips today (${todayRow.memory_slips}) are more than 2x this week's average (${weeklyAvg.toFixed(1)}).`,
      })
    }
  }

  // stress_avg >= 8 twice in a week
  const last7Dates = lastNDates(7, sortedDates[sortedDates.length - 1] || undefined)
  const highStressCount = last7Dates.filter((d) => {
    const row = byDate.get(d)
    return row && row.stress_avg !== null && row.stress_avg !== undefined && row.stress_avg >= 8
  }).length
  if (highStressCount >= 2) {
    flags.push({
      id: 'stress_high',
      severity: 'warn',
      message: `Stress hit 8+ on ${highStressCount} days in the last week.`,
    })
  }

  return flags
}

export function getCorrelationCards(series) {
  const cards = []
  for (const input of INPUT_VARS) {
    for (const output of OUTPUT_VARS) {
      const inputSeries = series.map((r) => r[input.key])
      const outputSeries = series.map((r) => r[output.key])
      for (const lag of [0, 1]) {
        const { xs, ys } = lagPairs(inputSeries, outputSeries, lag)
        const { r, n } = pearson(xs, ys)
        if (r === null || n < MIN_N || Math.abs(r) < MIN_R) continue
        const tendency = r > 0 ? 'higher' : 'lower'
        const lagText = lag === 0 ? 'the same day' : `${lag} day later`
        const strength = strengthLabel(r)
        cards.push({
          id: `${input.key}__${output.key}__lag${lag}`,
          input: input.key,
          output: output.key,
          lag,
          r,
          n,
          strength,
          text: `On days with higher ${input.label.toLowerCase()}, ${output.label.toLowerCase()} tends to be ${tendency} ${lagText} — a ${strength} relationship (r=${r.toFixed(2)} across ${n} days). Correlation, not proof of cause.`,
        })
      }
    }
  }
  cards.sort((a, b) => Math.abs(b.r) - Math.abs(a.r))
  return cards
}

export function getWeeklyRecommendation(correlationCards, experiments) {
  const testedVars = new Set(experiments.map((e) => e.variable_changed))
  const candidate = correlationCards.find((c) => !testedVars.has(c.input))
  if (!candidate) return null
  const inputLabel = INPUT_VARS.find((v) => v.key === candidate.input)?.label || candidate.input.replace(/_/g, ' ')
  const outputLabel = OUTPUT_VARS.find((v) => v.key === candidate.output)?.label || candidate.output.replace(/_/g, ' ')
  const guidance = guidanceFor(candidate.input)
  return {
    variable_changed: candidate.input,
    target_output: candidate.output,
    target_days: guidance.days,
    action: guidance.action,
    hypothesis: `Changing ${inputLabel.toLowerCase()} will shift ${outputLabel.toLowerCase()} (based on r=${candidate.r.toFixed(2)}, n=${candidate.n}).`,
    sourceCard: candidate,
  }
}
