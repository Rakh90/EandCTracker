import Anthropic from '@anthropic-ai/sdk'
import { db } from '../db/db'
import { lastNDates } from './dates'

const MODEL = 'claude-sonnet-5'

export async function generateWeeklyReview(apiKey) {
  if (!apiKey) throw new Error('No API key configured. Add one in Settings.')

  const dates = new Set(lastNDates(30))
  const [logs, runs, experiments] = await Promise.all([
    db.daily_log.toArray(),
    db.benchmark_runs.toArray(),
    db.experiments.toArray(),
  ])

  const last30Logs = logs.filter((l) => dates.has(l.date))
  const last30Runs = runs.filter((r) => dates.has(r.date))
  const activeExperiments = experiments.filter((e) => !e.verdict)

  const payload = {
    daily_log: last30Logs,
    benchmark_runs: last30Runs,
    active_experiments: activeExperiments,
  }

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system:
      'You are analyzing a personal energy and cognition tracking journal. ' +
      'Given the last 30 days of daily check-ins, cognitive benchmark runs, and any active self-experiments, write a weekly review with these sections: ' +
      '1) Narrative summary, 2) Multi-variable patterns a simple rule-based engine would likely miss, 3) Strong points, 4) Weak points, 5) One concrete recommendation. ' +
      'Always note sample size when citing a pattern. Never assert causation from correlation — say "associated with" or "coincided with", not "caused". ' +
      'If data is too sparse for a section, say so plainly instead of speculating.',
    messages: [
      {
        role: 'user',
        content: `Here is my data as JSON:\n\n${JSON.stringify(payload)}`,
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  return textBlock ? textBlock.text : ''
}
