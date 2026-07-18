import { mean } from './stats'
import { addDays, daysBetween, todayStr } from './dates'
import { INPUT_VARS, OUTPUT_VARS } from './metrics'

// Concrete, direction-aware instructions for running an experiment.
// `direction` is which way to push the INPUT to move the OUTPUT toward its
// better value — already resolved from the correlation's sign combined with
// whether the output is higher-is-better or lower-is-better (see
// insights.getWeeklyRecommendation) — so a builder only ever has to answer
// "what does increasing/decreasing this input actually look like."
const DAYS = 14

const GUIDANCE_BUILDERS = {
  sleep_quality: (direction) => direction === 'higher'
    ? { action: `Sleep quality isn't something you dose directly, so work on improving it: a fixed bed/wake time and no screens in the last 30 minutes, held for ${DAYS} nights.` }
    : { action: `This would mean deliberately worsening sleep quality, which isn't a sane experiment to run. Instead hold your routine exactly as-is for ${DAYS} nights and see if the pattern still holds before acting on it.`, caution: true },

  sleep_hours: (direction) => direction === 'higher'
    ? { action: `Increase to at least 7.5 hours in bed, ${DAYS} nights in a row, then compare to your prior average.` }
    : { action: `This would mean deliberately cutting sleep, which isn't a sane experiment to run. Instead hold your current hours steady and consistent for ${DAYS} nights and see if the pattern still holds before acting on it.`, caution: true },

  movement_intensity: (direction) => direction === 'higher'
    ? { action: `Increase: add 3–4 sessions a week of moderate-or-harder movement (RPE 6+) for ${DAYS} days.` }
    : { action: `Decrease: scale back to lighter movement (RPE 4 or under, or more rest days) for ${DAYS} days — this pattern suggests high intensity may be working against you right now.` },

  stress_avg: () => ({ action: `Work to lower stress — pick one mitigation (a daily 10-minute walk, a breathing break, cutting one recurring stressor) and hold it steady for ${DAYS} days.` }),

  caffeine_mg: (direction) => direction === 'higher'
    ? { action: `Increase: add roughly 50mg earlier in the day (e.g. an extra coffee before noon) and hold that higher, consistent level for ${DAYS} days.` }
    : { action: `Decrease: cut to under 150mg/day (or shift what you do have earlier), held consistently for ${DAYS} days.` },

  water_total: (direction) => direction === 'higher'
    ? { action: `Increase to at least 80oz/day for ${DAYS} days.` }
    : { action: `Decrease slightly to a lower-but-still-healthy ~50–60oz/day for ${DAYS} days — this pattern suggests more isn't better here.` },

  creatine_g: (direction) => direction === 'higher'
    ? { action: `Increase: take a consistent 5g/day, same time each day, for ${DAYS} days.` }
    : { action: `Decrease: pause creatine entirely for ${DAYS} days and compare to when you were taking it — but first make sure your prior dosing was actually consistent, since noisy logging can produce this pattern too.`, caution: true },
}

export function guidanceFor(variableKey, direction = 'higher') {
  const builder = GUIDANCE_BUILDERS[variableKey]
  const built = builder
    ? builder(direction)
    : { action: `Move this ${direction} for ${DAYS} days rather than letting it vary, then compare.` }
  return { days: DAYS, ...built }
}

// Experiments started before the app grew direction-aware guidance were only
// ever saved with a free-text `hypothesis` (and, for a while, no `action` /
// `target_output` at all) — that data doesn't retroactively grow the new
// fields on its own, so old cards render with no "how to test it" text.
// The hypothesis sentence's shape has stayed constant across every version
// ("Changing X will shift Y (based on r=R, n=N)."), so it can be parsed back
// into input/output/r and re-run through the current, direction-aware logic.
const LEGACY_HYPOTHESIS_RE = /^Changing (.+) will shift (.+) \(based on r=(-?[\d.]+), n=(\d+)\)\.$/i

export function backfillLegacyExperiment(experiment) {
  if (experiment.action) return null // already has current-format guidance
  const match = experiment.hypothesis?.match(LEGACY_HYPOTHESIS_RE)
  if (!match) return null
  const [, inputText, outputText, rText] = match
  // Two legacy phrasings existed: the original used the raw key
  // ("stress avg"), a later one used the pretty label ("stress (avg)") —
  // check both.
  const norm = (s) => s.trim().toLowerCase()
  const findVar = (vars, text) => vars.find((v) => norm(v.label) === norm(text) || v.key.replace(/_/g, ' ') === norm(text))
  const inputVar = findVar(INPUT_VARS, inputText)
  const outputVar = findVar(OUTPUT_VARS, outputText)
  const r = Number(rText)
  if (!inputVar || !outputVar || Number.isNaN(r)) return null

  const outputWantsHigher = outputVar.higherIsBetter ?? true
  const direction = (r > 0) === outputWantsHigher ? 'higher' : 'lower'
  const guidance = guidanceFor(inputVar.key, direction)
  return {
    target_output: outputVar.key,
    target_days: guidance.days,
    action: guidance.action,
    caution: guidance.caution || false,
    hypothesis: `${direction === 'higher' ? 'Increasing' : 'Decreasing'} ${inputVar.label.toLowerCase()} looks likely to move ${outputVar.label.toLowerCase()} toward its better range (based on r=${r.toFixed(2)}, n=${match[4]}).`,
  }
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
