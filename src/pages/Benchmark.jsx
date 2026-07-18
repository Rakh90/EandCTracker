import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import SequenceRecall from '../components/benchmark/SequenceRecall'
import ReactionTest from '../components/benchmark/ReactionTest'
import SymbolSprint from '../components/benchmark/SymbolSprint'
import TodayResultsChart from '../components/benchmark/TodayResultsChart'
import ChipGroup from '../components/ui/ChipGroup'
import { todayStr } from '../lib/dates'
import { db, addBenchmarkRun } from '../db/db'
import { spanToScore, rtToScore, sprintToScore, compositeScore } from '../lib/scoring'

const CONTEXTS = ['scheduled', 'foggy', 'neutral', 'sharp']

export default function Benchmark() {
  const navigate = useNavigate()
  const [step, setStep] = useState('intro')
  const [context, setContext] = useState('scheduled')
  const [results, setResults] = useState({})
  const todayRuns = useLiveQuery(() => db.benchmark_runs.where('date').equals(todayStr()).toArray(), [])

  async function handleSpanComplete({ span }) {
    setResults((r) => ({ ...r, span }))
    setStep('reaction')
  }

  async function handleReactionComplete({ rt_median_ms }) {
    setResults((r) => ({ ...r, rt_median_ms }))
    setStep('sprint')
  }

  async function handleSprintComplete({ sprint_net, sprint_answered }) {
    const merged = { ...results, sprint_net, sprint_answered }
    const span_score = spanToScore(merged.span)
    const rt_score = rtToScore(merged.rt_median_ms)
    const sprint_score = sprintToScore(sprint_net)
    const composite = compositeScore({ span_score, rt_score, sprint_score })
    const run = {
      date: todayStr(),
      timestamp: new Date().toISOString(),
      context,
      span: merged.span,
      span_score,
      rt_median_ms: merged.rt_median_ms,
      rt_score,
      sprint_net,
      sprint_answered,
      sprint_score,
      composite,
    }
    await addBenchmarkRun(run)
    setResults(run)
    setStep('results')
  }

  return (
    <div>
      <div className="top-bar">
        <h1>Benchmark</h1>
        <button type="button" onClick={() => navigate('/')}>Exit</button>
      </div>

      {step === 'intro' && (
        <div className="card">
          <h3>Three quick modules</h3>
          <p className="muted">Sequence recall, reaction time, symbol sprint. About 2 minutes.</p>
          <ChipGroup label="Context" options={CONTEXTS} value={context} onChange={(v) => setContext(v || 'scheduled')} />
          <button type="button" className="primary" onClick={() => setStep('span')} style={{ marginTop: 8 }}>Start</button>
        </div>
      )}

      {step === 'intro' && <TodayResultsChart runs={todayRuns} />}

      {step === 'span' && (
        <div className="card">
          <h3>1. Sequence recall</h3>
          <SequenceRecall onComplete={handleSpanComplete} />
        </div>
      )}

      {step === 'reaction' && (
        <div className="card">
          <h3>2. Reaction</h3>
          <ReactionTest onComplete={handleReactionComplete} />
        </div>
      )}

      {step === 'sprint' && (
        <div className="card">
          <h3>3. Symbol sprint</h3>
          <SymbolSprint onComplete={handleSprintComplete} />
        </div>
      )}

      {step === 'results' && (
        <div className="card">
          <h3>Results</h3>
          <div className="stat-row">
            <div className="stat-tile">
              <div className="num">{results.span}</div>
              <div className="label">Span</div>
            </div>
            <div className="stat-tile">
              <div className="num">{results.rt_median_ms}</div>
              <div className="label">RT ms</div>
            </div>
            <div className="stat-tile">
              <div className="num">{results.sprint_net}</div>
              <div className="label">Sprint net</div>
            </div>
          </div>
          <p className="mono" style={{ fontSize: 28, textAlign: 'center', marginTop: 12 }}>
            {results.composite?.toFixed(1)}
          </p>
          <p className="muted" style={{ textAlign: 'center' }}>Composite score</p>
          <button type="button" className="primary" onClick={() => navigate('/')} style={{ width: '100%', marginTop: 8 }}>
            Back to Today
          </button>
        </div>
      )}

      {step === 'results' && <TodayResultsChart runs={todayRuns} />}
    </div>
  )
}
