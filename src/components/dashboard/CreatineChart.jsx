import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { formatDisplayDate } from '../../lib/dates'
import { CATEGORICAL, TEXT } from '../../lib/palette'
import { usePrefersDark } from '../../hooks/usePrefersDark'

export default function CreatineChart({ series }) {
  const dark = usePrefersDark()
  const mode = dark ? 'dark' : 'light'
  const colors = CATEGORICAL[mode]
  const text = TEXT[mode]
  const data = series.map((row) => ({ ...row, label: formatDisplayDate(row.date) }))

  return (
    <div className="card">
      <h3>Creatine (g/day)</h3>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ left: -20, bottom: 4 }}>
          <CartesianGrid strokeDasharray="none" stroke={text.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: text.muted }} axisLine={{ stroke: text.grid }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: text.muted }} axisLine={{ stroke: text.grid }} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12 }} />
          <Bar dataKey="creatine_g" name="Creatine" fill={colors[2]} radius={[4, 4, 0, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
      <p className="muted" style={{ marginTop: 8 }}>
        See the "Creatine (g)" row in the correlation table below for how it tracks against benchmark composite, fog, and other outputs.
      </p>
    </div>
  )
}
