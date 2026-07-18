import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { buildDailySeries, getCalibrationDates, filterCalibration, INPUT_VARS, OUTPUT_VARS } from '../lib/metrics'
import { getThresholdFlags, getCorrelationCards, getWeeklyRecommendation } from '../lib/insights'
import { computeExperimentResult, summarizeExperimentResult } from '../lib/experiments'
import { todayStr, daysBetween } from '../lib/dates'
import { useSetting } from '../hooks/useSetting'
import { generateWeeklyReview } from '../lib/aiReview'
import CorrelationScatter from '../components/dashboard/CorrelationScatter'
import ChipGroup from '../components/ui/ChipGroup'

const EMPTY = []
const VERDICTS = ['Worked', 'No effect', 'Inconclusive']

function labelFor(key) {
  return INPUT_VARS.find((v) => v.key === key)?.label || OUTPUT_VARS.find((v) => v.key === key)?.label || key.replace(/_/g, ' ')
}

export default function Insights() {
  const logs = useLiveQuery(() => db.daily_log.toArray(), []) ?? EMPTY
  const runs = useLiveQuery(() => db.benchmark_runs.toArray(), []) ?? EMPTY
  const experiments = useLiveQuery(() => db.experiments.toArray(), []) ?? EMPTY
  const [apiKey] = useSetting('anthropicApiKey', '')
  const [review, setReview] = useState('')
  const [reviewStatus, setReviewStatus] = useState('idle') // idle | loading | error
  const [endingId, setEndingId] = useState(null)
  const [verdictDraft, setVerdictDraft] = useState(null)
  const [outcomeDraft, setOutcomeDraft] = useState('')

  const fullSeries = useMemo(() => buildDailySeries(logs, runs), [logs, runs])
  const calibrationDates = useMemo(() => getCalibrationDates(runs), [runs])
  const correlationSeries = useMemo(
    () => filterCalibration(fullSeries, calibrationDates, true),
    [fullSeries, calibrationDates]
  )

  const flags = useMemo(() => getThresholdFlags(logs, fullSeries), [logs, fullSeries])
  const correlationCards = useMemo(() => getCorrelationCards(correlationSeries), [correlationSeries])
  const recommendation = useMemo(() => getWeeklyRecommendation(correlationCards, experiments), [correlationCards, experiments])

  async function handleGenerateReview() {
    setReviewStatus('loading')
    try {
      const text = await generateWeeklyReview(apiKey)
      setReview(text)
      setReviewStatus('idle')
    } catch (err) {
      setReview(err.message)
      setReviewStatus('error')
    }
  }

  async function acceptRecommendation() {
    if (!recommendation) return
    const today = todayStr()
    await db.experiments.add({
      start_date: today,
      end_date: null,
      variable_changed: recommendation.variable_changed,
      target_output: recommendation.target_output,
      target_days: recommendation.target_days,
      action: recommendation.action,
      hypothesis: recommendation.hypothesis,
      outcome: null,
      verdict: null,
    })
  }

  function startEnding(experiment) {
    setEndingId(experiment.id)
    setVerdictDraft(null)
    setOutcomeDraft('')
  }

  async function saveEnding(experiment) {
    const result = experiment.target_output
      ? computeExperimentResult(experiment, fullSeries)
      : null
    const computedSummary = result ? summarizeExperimentResult(experiment, result, labelFor(experiment.target_output)) : ''
    const outcome = [computedSummary, outcomeDraft.trim()].filter(Boolean).join(' — ')
    await db.experiments.update(experiment.id, {
      end_date: todayStr(),
      verdict: verdictDraft,
      outcome: outcome || null,
    })
    setEndingId(null)
  }

  return (
    <div>
      <div className="top-bar">
        <h1>Insights</h1>
      </div>

      <div className="card">
        <h3>Flags</h3>
        {flags.length === 0 ? (
          <p className="muted">Not enough data yet, or nothing out of range.</p>
        ) : (
          flags.map((f) => (
            <div key={f.id} className={`flag-card ${f.severity === 'info' ? 'info' : ''}`} style={{ marginBottom: 10 }}>
              <p style={{ margin: 0 }}>{f.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Correlations</h3>
        <p className="muted" style={{ marginTop: -4, marginBottom: 12 }}>
          <strong>r</strong> is how tightly two things move together, from -1 to 1: positive means they rise and fall
          together, negative means one rises as the other falls, and 0 means no relationship. <strong>n</strong> is how
          many days that estimate is based on — more days means a more reliable number. Only pairs with at least 10
          days of overlap and a moderate-or-stronger relationship (|r| ≥ 0.4) show up here, and lag 1 means the input
          is compared to the next day's output. None of this proves cause — it just tells you what to test next.
        </p>
        {correlationCards.length === 0 ? (
          <p className="muted">Not enough data yet (need n≥10 per pair and |r|≥0.4).</p>
        ) : (
          correlationCards.slice(0, 8).map((c) => (
            <div key={c.id} style={{ marginBottom: 20 }}>
              <div className="field-row" style={{ marginBottom: 4 }}>
                <span className={`badge ${c.r > 0 ? 'positive' : 'negative'}`} style={{ textTransform: 'capitalize' }}>
                  {c.strength} {c.r > 0 ? 'positive' : 'negative'}
                </span>
                <span className="mono muted" style={{ fontSize: 11 }}>r={c.r.toFixed(2)}, n={c.n}</span>
              </div>
              <p style={{ margin: '0 0 6px' }}>{c.text}</p>
              <CorrelationScatter
                series={correlationSeries}
                xKey={c.input}
                yKey={c.output}
                xLabel={labelFor(c.input)}
                yLabel={labelFor(c.output)}
              />
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Weekly recommendation</h3>
        {!recommendation ? (
          <p className="muted">No untested correlation strong enough to recommend yet.</p>
        ) : (
          <>
            <p style={{ marginBottom: 6 }}>{recommendation.hypothesis}</p>
            <p className="muted" style={{ marginBottom: 12 }}>
              <strong>How to test it:</strong> {recommendation.action} Then check back after {recommendation.target_days} days
              to see whether {labelFor(recommendation.target_output).toLowerCase()} actually moved compared to before.
            </p>
            <button type="button" className="primary" onClick={acceptRecommendation}>Start this experiment</button>
          </>
        )}
      </div>

      <div className="card">
        <h3>AI Review</h3>
        {!apiKey ? (
          <p className="muted">Add an Anthropic API key in Settings to enable this.</p>
        ) : (
          <button type="button" className="primary" onClick={handleGenerateReview} disabled={reviewStatus === 'loading'}>
            {reviewStatus === 'loading' ? 'Generating…' : 'Generate weekly review'}
          </button>
        )}
        {review && (
          <p style={{ whiteSpace: 'pre-wrap', marginTop: 12, color: reviewStatus === 'error' ? 'var(--danger)' : 'var(--ink)' }}>
            {review}
          </p>
        )}
      </div>

      {experiments.length > 0 && (
        <div className="card">
          <h3>Experiments</h3>
          <p className="muted" style={{ marginTop: -4, marginBottom: 12 }}>
            Each experiment compares the target metric's average in the days before you started against its average
            during the experiment — the app's best guess at whether the change actually moved anything, not proof.
          </p>
          {experiments.map((e) => {
            const dayNum = Math.min(daysBetween(e.start_date, todayStr()) + 1, e.target_days || 14)
            const targetDays = e.target_days || 14
            const isEnding = endingId === e.id
            return (
              <div key={e.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <div className="field-row" style={{ marginBottom: 2 }}>
                  <p style={{ margin: 0, fontWeight: 600, textTransform: 'capitalize' }}>{labelFor(e.variable_changed)}</p>
                  {!e.end_date ? (
                    <span className="badge pending">day {dayNum} of {targetDays}</span>
                  ) : (
                    <span className={`badge ${e.verdict === 'Worked' ? 'positive' : 'pending'}`}>{e.verdict || 'ended'}</span>
                  )}
                </div>
                <p className="muted" style={{ margin: '0 0 4px' }}>{e.hypothesis}</p>
                {e.action && <p className="muted" style={{ margin: '0 0 4px' }}>{e.action}</p>}
                <p className="muted" style={{ margin: 0 }}>
                  {e.start_date} → {e.end_date || 'ongoing'}
                </p>
                {e.outcome && <p style={{ margin: '6px 0 0' }}>{e.outcome}</p>}

                {!e.end_date && !isEnding && (
                  <button type="button" onClick={() => startEnding(e)} style={{ marginTop: 8 }}>End experiment</button>
                )}
                {isEnding && (
                  <div style={{ marginTop: 8 }}>
                    <ChipGroup label="Verdict" options={VERDICTS} value={verdictDraft} onChange={setVerdictDraft} />
                    <div className="field">
                      <label>Notes (optional)</label>
                      <textarea rows={2} value={outcomeDraft} onChange={(ev) => setOutcomeDraft(ev.target.value)} style={{ marginTop: 6 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button type="button" className="primary" onClick={() => saveEnding(e)} disabled={!verdictDraft}>Save outcome</button>
                      <button type="button" onClick={() => setEndingId(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
