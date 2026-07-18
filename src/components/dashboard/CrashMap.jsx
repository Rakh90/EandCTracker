import { useMemo } from 'react'
import { formatDisplayDate } from '../../lib/dates'
import { TEXT } from '../../lib/palette'
import { usePrefersDark } from '../../hooks/usePrefersDark'

// Matches the app's own three check-in windows (see the time-frame captions on
// each check-in page) instead of an unrelated 4-bucket split — that previously
// left a "PM" column almost always empty since nothing else in the app treats
// 2–6pm as its own window.
const BUCKETS = [
  { label: 'AM', from: 0, to: 11 },
  { label: 'Midday', from: 11, to: 16 },
  { label: 'Evening', from: 16, to: 24 },
]

const STATUS = {
  energized: { color: '#0ca30c', darkColor: '#0ca30c', label: 'Energized' },
  neutral: { color: '#c3c2b7', darkColor: '#383835', label: 'Neutral' },
  sluggish: { color: '#d03b3b', darkColor: '#d03b3b', label: 'Sluggish' },
}
const RANK = { sluggish: 2, neutral: 1, energized: 0 }

function bucketFor(time) {
  if (!time) return null
  const hour = Number(time.split(':')[0])
  return BUCKETS.find((b) => hour >= b.from && hour < b.to) || BUCKETS[BUCKETS.length - 1]
}

export default function CrashMap({ meals }) {
  const dark = usePrefersDark()
  const text = TEXT[dark ? 'dark' : 'light']

  const grid = useMemo(() => {
    const byDay = new Map()
    for (const m of meals) {
      const bucket = bucketFor(m.time)
      if (!bucket || !m.energy_effect) continue
      if (!byDay.has(m.date)) byDay.set(m.date, {})
      const dayRow = byDay.get(m.date)
      const existing = dayRow[bucket.label]
      if (!existing || RANK[m.energy_effect] > RANK[existing.effect]) {
        dayRow[bucket.label] = { effect: m.energy_effect, meals: [m] }
      } else if (RANK[m.energy_effect] === RANK[existing.effect]) {
        existing.meals.push(m)
      }
    }
    return [...byDay.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))
  }, [meals])

  if (grid.length === 0) {
    return (
      <div className="card">
        <h3>Crash map</h3>
        <p className="muted">No meals logged yet.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3>Crash map</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 4, color: text.secondary }}></th>
              {BUCKETS.map((b) => (
                <th key={b.label} style={{ padding: 4, color: text.secondary }}>{b.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map(([date, row]) => (
              <tr key={date}>
                <td style={{ padding: 4, whiteSpace: 'nowrap', color: text.secondary }}>{formatDisplayDate(date)}</td>
                {BUCKETS.map((b) => {
                  const cell = row[b.label]
                  const status = cell ? STATUS[cell.effect] : null
                  const bg = status ? (dark ? status.darkColor : status.color) : 'transparent'
                  const titleText = cell
                    ? cell.meals.map((m) => `${m.time} ${m.description} (${m.energy_effect})`).join('; ')
                    : ''
                  return (
                    <td key={b.label} title={titleText} style={{ padding: 4, textAlign: 'center', border: `1px solid ${text.grid}` }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: bg, margin: '0 auto' }} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 11 }}>
        {Object.entries(STATUS).map(([key, s]) => (
          <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: dark ? s.darkColor : s.color, display: 'inline-block' }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}
