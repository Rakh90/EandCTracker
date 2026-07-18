import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { CATEGORICAL, TEXT } from '../../lib/palette'
import { usePrefersDark } from '../../hooks/usePrefersDark'

export default function TodayResultsChart({ runs }) {
  const dark = usePrefersDark()
  const mode = dark ? 'dark' : 'light'
  const color = CATEGORICAL[mode][0]
  const text = TEXT[mode]

  if (!runs || runs.length === 0) return null

  const data = runs
    .slice()
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map((r) => ({
      time: new Date(r.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      composite: r.composite,
      context: r.context,
    }))

  return (
    <div className="card">
      <h3>Today's runs ({runs.length})</h3>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ left: -20, top: 8, bottom: 4, right: 8 }}>
          <defs>
            <linearGradient id="todayCompositeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="none" stroke={text.grid} vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: text.muted }} axisLine={{ stroke: text.grid }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: text.muted }} axisLine={{ stroke: text.grid }} tickLine={false} width={30} />
          <Tooltip
            contentStyle={{ fontSize: 12 }}
            formatter={(value, name, props) => [`${value.toFixed(1)} (${props.payload.context})`, 'Composite']}
          />
          <Area type="monotone" dataKey="composite" stroke={color} strokeWidth={2} fill="url(#todayCompositeFill)" dot={{ r: 4, fill: color, strokeWidth: 0 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
