import { useState } from 'react'
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { formatDisplayDate } from '../../lib/dates'
import { CATEGORICAL, TEXT } from '../../lib/palette'
import { usePrefersDark } from '../../hooks/usePrefersDark'

const BREAKDOWN = [
  { key: 'span_score', label: 'Span' },
  { key: 'rt_score', label: 'Reaction' },
  { key: 'sprint_score', label: 'Sprint' },
]

export default function CompositeChart({ series }) {
  const [breakdown, setBreakdown] = useState(false)
  const dark = usePrefersDark()
  const mode = dark ? 'dark' : 'light'
  const colors = CATEGORICAL[mode]
  const text = TEXT[mode]
  const data = series.map((row) => ({ ...row, label: formatDisplayDate(row.date) }))

  return (
    <div className="card">
      <div className="field-row">
        <h3>Benchmark composite</h3>
        <button type="button" onClick={() => setBreakdown((b) => !b)}>{breakdown ? 'Composite only' : 'Per-module'}</button>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={data} margin={{ left: -20, bottom: 4 }}>
          <defs>
            <linearGradient id="compositeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[0]} stopOpacity={0.32} />
              <stop offset="100%" stopColor={colors[0]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="none" stroke={text.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: text.muted }} axisLine={{ stroke: text.grid }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: text.muted }} axisLine={{ stroke: text.grid }} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          {breakdown && <Legend wrapperStyle={{ fontSize: 11, color: text.secondary }} />}
          {breakdown
            ? BREAKDOWN.map((s, i) => (
                <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={colors[i]} dot={false} connectNulls strokeWidth={2} />
              ))
            : <Area type="monotone" dataKey="composite" name="Composite" stroke={colors[0]} strokeWidth={2} fill="url(#compositeFill)" dot={false} connectNulls />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
