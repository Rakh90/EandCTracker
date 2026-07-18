import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { formatDisplayDate } from '../../lib/dates'
import { CATEGORICAL, TEXT } from '../../lib/palette'
import { usePrefersDark } from '../../hooks/usePrefersDark'

export default function MovementChart({ series }) {
  const dark = usePrefersDark()
  const mode = dark ? 'dark' : 'light'
  const colors = CATEGORICAL[mode]
  const text = TEXT[mode]
  const data = series.map((row) => ({ ...row, label: formatDisplayDate(row.date) }))

  return (
    <div className="card">
      <h3>Movement (minutes/day)</h3>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ left: -20, bottom: 4 }}>
          <CartesianGrid strokeDasharray="none" stroke={text.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: text.muted }} axisLine={{ stroke: text.grid }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: text.muted }} axisLine={{ stroke: text.grid }} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Bar dataKey="movement_min" name="Movement" fill={colors[4]} radius={[4, 4, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
      <p className="muted" style={{ marginTop: 8 }}>
        One bar per day, summed across every session logged that day. See "Movement intensity" in the correlation table for how it tracks against other metrics.
      </p>
    </div>
  )
}
