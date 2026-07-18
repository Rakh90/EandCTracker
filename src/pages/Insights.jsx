import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { buildDailySeries, getCalibrationDates, filterCalibration } from '../lib/metrics'
import { getThresholdFlags, getCorrelationCards, getWeeklyRecommendation } from '../lib/insights'
import { todayStr } from '../lib/dates'
import { useSetting } from '../hooks/useSetting'
import { generateWeeklyReview } from '../lib/aiReview'

const EMPTY = []

export default function Insights() {
  const logs = useLiveQuery(() => db.daily_log.toArray(), []) ?? EMPTY
  const runs = useLiveQuery(() => db.benchmark_runs.toArray(), []) ?? EMPTY
  const experiments = useLiveQuery(() => db.experiments.toArray(), []) ?? EMPTY
  const [apiKey] = useSetting('anthropicApiKey', '')
  const [review, setReview] = useState('')
  const [reviewStatus, setReviewStatus] = useState('idle') // idle | loading | error

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
      hypothesis: recommendation.hypothesis,
      outcome: null,
      verdict: null,
    })
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
        {correlationCards.length === 0 ? (
          <p className="muted">Not enough data yet (need n≥10 per pair and |r|≥0.4).</p>
        ) : (
          correlationCards.slice(0, 8).map((c) => (
            <p key={c.id} className="muted" style={{ marginBottom: 8, color: 'var(--ink)', opacity: 1 }}>
              {c.text}
            </p>
          ))
        )}
      </div>

      <div className="card">
        <h3>Weekly recommendation</h3>
        {!recommendation ? (
          <p className="muted">No untested correlation strong enough to recommend yet.</p>
        ) : (
          <>
            <p>{recommendation.hypothesis}</p>
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
          {experiments.map((e) => (
            <div key={e.id} style={{ marginBottom: 10 }}>
              <p style={{ margin: 0, fontWeight: 600 }}>{e.variable_changed}</p>
              <p className="muted" style={{ margin: 0 }}>{e.hypothesis}</p>
              <p className="muted" style={{ margin: 0 }}>
                {e.start_date} → {e.end_date || 'ongoing'} {e.verdict ? `· ${e.verdict}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
