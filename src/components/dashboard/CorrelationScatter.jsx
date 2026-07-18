import { ComposedChart, Scatter, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { CATEGORICAL, TEXT } from '../../lib/palette'
import { usePrefersDark } from '../../hooks/usePrefersDark'

function linearFit(points) {
  const n = points.length
  if (n < 2) return null
  const sumX = points.reduce((a, p) => a + p.x, 0)
  const sumY = points.reduce((a, p) => a + p.y, 0)
  const sumXY = points.reduce((a, p) => a + p.x * p.y, 0)
  const sumXX = points.reduce((a, p) => a + p.x * p.x, 0)
  const denom = n * sumXX - sumX * sumX
  if (denom === 0) return null
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

// A generic X-vs-Y scatter, reused for any input/output metric pair the
// correlation engine flags — one visual so a reader can see the shape of the
// relationship instead of just reading r and n as bare numbers.
export default function CorrelationScatter({ series, xKey, yKey, xLabel, yLabel }) {
  const dark = usePrefersDark()
  const mode = dark ? 'dark' : 'light'
  const color = CATEGORICAL[mode][0]
  const text = TEXT[mode]

  const points = series
    .map((row) => ({ x: row[xKey], y: row[yKey], date: row.date }))
    .filter((p) => p.x !== null && p.x !== undefined && p.y !== null && p.y !== undefined)

  const fit = linearFit(points)
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  // Pad both axes a bit so edge points/trend endpoints don't sit flush on the
  // border — and explicit numeric bounds (not Recharts' 'dataMin'/'dataMax'
  // tokens) so the domain reflects the real observed points, not whichever
  // child series (Scatter vs the overlay trend Line) Recharts happens to
  // infer it from.
  const padX = Math.max((maxX - minX) * 0.08, 0.5)
  const padY = Math.max((maxY - minY) * 0.12, 0.5)
  const xDomain = [minX - padX, maxX + padX]
  const yDomain = [minY - padY, maxY + padY]
  const trendData = fit ? [{ x: minX, y: fit.slope * minX + fit.intercept }, { x: maxX, y: fit.slope * maxX + fit.intercept }] : []

  return (
    <div>
      <h4 style={{ margin: '0 0 2px', fontSize: 14 }}>{xLabel} vs {yLabel}</h4>
      <p className="muted" style={{ marginBottom: 4, fontSize: 11 }}>{xLabel} (x-axis) vs {yLabel} (y-axis) — each dot is one day</p>
      <ResponsiveContainer width="100%" height={150}>
        <ComposedChart data={points} margin={{ left: -20, top: 4, bottom: 4, right: 8 }}>
          <CartesianGrid strokeDasharray="none" stroke={text.grid} />
          <XAxis dataKey="x" type="number" domain={xDomain} tick={{ fontSize: 10, fill: text.muted }} axisLine={{ stroke: text.grid }} tickLine={false} />
          <YAxis dataKey="y" type="number" domain={yDomain} tick={{ fontSize: 10, fill: text.muted }} axisLine={{ stroke: text.grid }} tickLine={false} width={34} />
          <Tooltip contentStyle={{ fontSize: 11 }} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter dataKey="y" fill={color} fillOpacity={0.75} isAnimationActive={false} />
          {trendData.length === 2 && (
            <Line data={trendData} dataKey="y" type="linear" stroke={color} strokeWidth={2} strokeDasharray="4 3" strokeOpacity={0.55} dot={false} isAnimationActive={false} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
