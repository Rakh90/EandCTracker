import { useMemo, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts'
import { formatDisplayDate } from '../../lib/dates'
import { CATEGORICAL, TEXT } from '../../lib/palette'
import { usePrefersDark } from '../../hooks/usePrefersDark'
import ChipGroup from '../ui/ChipGroup'

const ANCHORS = [
  { key: 'cognitive', label: 'Cognitive (composite)', unit: '', get: (r) => r.composite },
  {
    key: 'energy', label: 'Energy (avg)', unit: '',
    get: (r) => {
      const vals = [r.am_mental_energy, r.am_phys_energy, r.pm_mental_energy, r.pm_phys_energy].filter((v) => v !== null && v !== undefined)
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
    },
  },
]

const OVERLAY_OPTIONS = [
  { key: 'sleep_quality', label: 'Sleep quality', unit: '', get: (r) => r.sleep_quality },
  { key: 'sleep_hours', label: 'Sleep hours', unit: 'h', get: (r) => r.sleep_hours },
  { key: 'stress_avg', label: 'Stress (avg)', unit: '', get: (r) => r.stress_avg },
  { key: 'caffeine_mg', label: 'Caffeine', unit: 'mg', get: (r) => r.caffeine_mg },
  { key: 'water_total', label: 'Water', unit: 'oz', get: (r) => r.water_total },
  { key: 'creatine_g', label: 'Creatine', unit: 'g', get: (r) => r.creatine_g },
  // These three come after the 8-color categorical palette runs out (2
  // anchors + 6 overlays above already claim every hue), so they reuse an
  // earlier color — dashed instead of solid keeps them tellable apart from
  // whichever anchor/overlay they share a hue with.
  { key: 'movement_intensity', label: 'Movement intensity', unit: '', get: (r) => r.movement_intensity, dashed: true },
  { key: 'fog', label: 'Fog', unit: '', get: (r) => r.fog, dashed: true },
  { key: 'memory_slips', label: 'Memory slips', unit: '', get: (r) => r.memory_slips, dashed: true },
]

// Fixed identity -> color assignment across every possible series (anchors
// then overlays, in this constant order) so a metric's color never changes
// just because a *different* chip got toggled — only the metric's own
// selection state should change what's drawn, per the "color follows the
// entity, never its rank" rule.
const COLOR_INDEX = Object.fromEntries([...ANCHORS, ...OVERLAY_OPTIONS].map((s, i) => [s.key, i]))

function normalizeSeries(rows, getter) {
  const raw = rows.map(getter)
  const vals = raw.filter((v) => v !== null && v !== undefined && !Number.isNaN(v))
  if (vals.length < 2) return raw.map(() => null)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min
  return raw.map((v) => {
    if (v === null || v === undefined || Number.isNaN(v)) return null
    return range === 0 ? 50 : ((v - min) / range) * 100
  })
}

function CustomTooltip({ active, payload, label, seriesMeta, text }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{ background: text.tooltipBg, border: `1px solid ${text.grid}`, borderRadius: 8, padding: '8px 10px', fontSize: 12 }}>
      <div className="mono" style={{ marginBottom: 4, color: text.secondary }}>{label}</div>
      {payload.map((p) => {
        const meta = seriesMeta[p.dataKey]
        if (!meta || p.payload[`${p.dataKey}__raw`] === undefined) return null
        const raw = p.payload[`${p.dataKey}__raw`]
        return (
          <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            <span>{meta.label}: {raw === null || raw === undefined ? '—' : `${raw.toFixed(1)}${meta.unit}`}</span>
          </div>
        )
      })}
    </div>
  )
}

// Different metrics live on wildly different scales (grams, mg, hours,
// 1-10 ratings) so they can't share a raw y-axis — each is indexed to its
// own 0-100 min-max range over the visible window instead (a relative
// shape, not an absolute level), which is what actually lets a reader see
// whether two lines move together over time.
export default function TrendRelationships({ series }) {
  const dark = usePrefersDark()
  const mode = dark ? 'dark' : 'light'
  const colors = CATEGORICAL[mode]
  const text = { ...TEXT[mode], tooltipBg: dark ? '#161922' : '#FFFFFF' }
  const [overlays, setOverlays] = useState(['sleep_quality', 'stress_avg'])

  function toggleOverlay(labels) {
    setOverlays(OVERLAY_OPTIONS.filter((o) => labels.includes(o.label)).map((o) => o.key))
  }

  // Anchors are always drawn, and always drawn LAST (after overlays) so they
  // paint on top in SVG stacking order — combined with the heavier stroke
  // below, that's what makes them read as "the point" instead of getting
  // lost among however many overlays are toggled on.
  const activeOverlays = OVERLAY_OPTIONS.filter((o) => overlays.includes(o.key))
  const activeSeries = [...activeOverlays, ...ANCHORS]
  const seriesMeta = Object.fromEntries(activeSeries.map((s) => [s.key, s]))

  const data = useMemo(() => {
    const normalized = {}
    for (const s of activeSeries) normalized[s.key] = normalizeSeries(series, s.get)
    return series.map((row, i) => {
      const point = { label: formatDisplayDate(row.date) }
      for (const s of activeSeries) {
        point[s.key] = normalized[s.key][i]
        point[`${s.key}__raw`] = s.get(row)
      }
      return point
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series, overlays])

  const overlaySelectedLabels = activeOverlays.map((o) => o.label)
  const allSelected = overlays.length === OVERLAY_OPTIONS.length

  return (
    <div className="card">
      <h3>Energy & cognition vs. everything else</h3>
      <p className="muted" style={{ marginTop: -6, marginBottom: 10 }}>
        Each line is scaled to its own min–max over this window, so shapes are comparable even though the
        underlying units aren't — hover a point for real values. Cognitive and Energy (bold, in front) are
        always shown; toggle any or all of the rest to compare against them.
      </p>
      <div className="field-row" style={{ marginBottom: 8 }}>
        <ChipGroup options={OVERLAY_OPTIONS.map((o) => o.label)} value={overlaySelectedLabels} onChange={toggleOverlay} multi />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button
          type="button"
          onClick={() => setOverlays(OVERLAY_OPTIONS.map((o) => o.key))}
          disabled={allSelected}
        >
          Select all
        </button>
        <button type="button" onClick={() => setOverlays([])} disabled={overlays.length === 0}>Clear</button>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ left: -20, top: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="none" stroke={text.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: text.muted }} axisLine={{ stroke: text.grid }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: text.muted }} axisLine={{ stroke: text.grid }} tickLine={false} />
          <Tooltip content={<CustomTooltip seriesMeta={seriesMeta} text={text} />} />
          <Legend wrapperStyle={{ fontSize: 11, color: text.secondary }} />
          {activeSeries.map((s) => {
            const isAnchor = ANCHORS.includes(s)
            return (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={colors[COLOR_INDEX[s.key] % colors.length]}
                strokeWidth={isAnchor ? 3.5 : 1.5}
                strokeOpacity={isAnchor ? 1 : 0.6}
                strokeDasharray={s.dashed ? '5 3' : undefined}
                dot={isAnchor ? { r: 2.5, strokeWidth: 0 } : false}
                connectNulls
                isAnimationActive={false}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
