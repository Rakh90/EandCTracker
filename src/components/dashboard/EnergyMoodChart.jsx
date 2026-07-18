import { useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { formatDisplayDate } from '../../lib/dates'
import { CATEGORICAL, TEXT } from '../../lib/palette'
import { usePrefersDark } from '../../hooks/usePrefersDark'

const METRICS = [
  { amKey: 'am_mental_energy', pmKey: 'pm_mental_energy', label: 'Mental energy' },
  { amKey: 'am_phys_energy', pmKey: 'pm_phys_energy', label: 'Physical energy' },
  { amKey: 'am_mood', pmKey: 'pm_mood', label: 'Mood' },
]

export default function EnergyMoodChart({ series }) {
  const [split, setSplit] = useState(false)
  const dark = usePrefersDark()
  const mode = dark ? 'dark' : 'light'
  const colors = CATEGORICAL[mode]
  const text = TEXT[mode]
  const data = series.map((row) => ({ ...row, label: formatDisplayDate(row.date) }))

  return (
    <div className="card">
      <div className="field-row">
        <h3>Energy & mood</h3>
        <button type="button" onClick={() => setSplit((s) => !s)}>{split ? 'AM only' : 'Show AM+PM'}</button>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ left: -20, bottom: 4 }}>
          <CartesianGrid strokeDasharray="none" stroke={text.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: text.muted }} axisLine={{ stroke: text.grid }} tickLine={false} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: text.muted }} axisLine={{ stroke: text.grid }} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: text.secondary }} />
          {METRICS.map((m, i) => (
            <Line key={m.amKey} type="monotone" dataKey={m.amKey} name={m.label} stroke={colors[i]} dot={false} connectNulls strokeWidth={2} />
          ))}
          {split && METRICS.map((m, i) => (
            <Line key={m.pmKey} type="monotone" dataKey={m.pmKey} name={`${m.label} (PM)`} stroke={colors[i]} strokeDasharray="4 3" dot={false} connectNulls strokeWidth={2} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
