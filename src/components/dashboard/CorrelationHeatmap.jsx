import { useState, useMemo } from 'react'
import { pearson, lagPairs } from '../../lib/stats'
import { INPUT_VARS, OUTPUT_VARS } from '../../lib/metrics'
import { DIVERGING, TEXT } from '../../lib/palette'
import { usePrefersDark } from '../../hooks/usePrefersDark'
import { lerpColor } from '../../lib/color'

const MIN_N = 10

export default function CorrelationHeatmap({ series }) {
  const [lag, setLag] = useState(0)
  const [tableView, setTableView] = useState(false)
  const dark = usePrefersDark()
  const mode = dark ? 'dark' : 'light'
  const { pos, neg, mid } = DIVERGING[mode]
  const text = TEXT[mode]

  const cells = useMemo(() => {
    const map = {}
    for (const input of INPUT_VARS) {
      for (const output of OUTPUT_VARS) {
        const inputSeries = series.map((r) => r[input.key])
        const outputSeries = series.map((r) => r[output.key])
        const { xs, ys } = lagPairs(inputSeries, outputSeries, lag)
        map[`${input.key}__${output.key}`] = pearson(xs, ys)
      }
    }
    return map
  }, [series, lag])

  function cellColor(r) {
    if (r === null || r === undefined) return mid
    const t = Math.min(Math.abs(r), 1)
    return lerpColor(mid, r >= 0 ? pos : neg, t)
  }

  // Bubble diameter scales with |r| — strength is legible at a glance instead
  // of only from the printed number, matching the diverging color for sign.
  function radiusFor(r) {
    if (r === null || r === undefined) return 3
    return 4 + Math.min(Math.abs(r), 1) * 13
  }

  return (
    <div className="card">
      <div className="field-row">
        <h3>How everything relates</h3>
        <button type="button" onClick={() => setTableView((v) => !v)}>{tableView ? 'Bubbles' : 'Table'}</button>
      </div>
      <p className="muted" style={{ marginTop: -6, marginBottom: 10 }}>
        Every input crossed against every output, in one view. Bigger, more saturated bubbles are stronger
        relationships; blue moves together, red moves opposite; faint dashed circles mean too little data yet.
      </p>
      <div className="chip-group" style={{ marginBottom: 10 }}>
        {[0, 1].map((l) => (
          <div key={l} className={`chip${lag === l ? ' selected' : ''}`} role="button" tabIndex={0} onClick={() => setLag(l)}>
            lag {l}
          </div>
        ))}
      </div>

      {!tableView ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 4, color: text.secondary }}></th>
                {OUTPUT_VARS.map((o) => (
                  <th key={o.key} style={{ padding: 4, fontWeight: 600, color: text.secondary, minWidth: 48 }}>{o.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INPUT_VARS.map((input) => (
                <tr key={input.key}>
                  <td style={{ padding: 4, fontWeight: 600, color: text.secondary, whiteSpace: 'nowrap' }}>{input.label}</td>
                  {OUTPUT_VARS.map((output) => {
                    const { r, n } = cells[`${input.key}__${output.key}`]
                    const insufficient = n < MIN_N
                    const color = insufficient ? text.grid : cellColor(r)
                    const glossId = `glow-${input.key}-${output.key}-${lag}`
                    const radius = insufficient ? 3 : radiusFor(r)
                    return (
                      <td
                        key={output.key}
                        title={`${input.label} → ${output.label}, lag ${lag}: r=${r === null ? '—' : r.toFixed(2)}, n=${n}`}
                        style={{ padding: '2px', textAlign: 'center', borderBottom: `1px solid ${text.grid}` }}
                      >
                        <svg width={40} height={40} style={{ display: 'block', margin: '0 auto' }}>
                          <defs>
                            <radialGradient id={glossId} cx="35%" cy="30%" r="70%">
                              <stop offset="0%" stopColor={lerpColor(color, '#ffffff', 0.45)} />
                              <stop offset="100%" stopColor={color} />
                            </radialGradient>
                          </defs>
                          {insufficient ? (
                            <circle cx={20} cy={20} r={radius} fill="none" stroke={text.muted} strokeWidth={1.3} strokeDasharray="2 2" />
                          ) : (
                            <circle cx={20} cy={20} r={radius} fill={`url(#${glossId})`} stroke={text.grid} strokeWidth={1} />
                          )}
                        </svg>
                        <div className="mono" style={{ fontSize: 9, color: insufficient ? text.muted : text.secondary }}>
                          {r === null ? '—' : r.toFixed(2)}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 4 }}>Input</th>
                <th style={{ textAlign: 'left', padding: 4 }}>Output</th>
                <th style={{ textAlign: 'right', padding: 4 }}>r</th>
                <th style={{ textAlign: 'right', padding: 4 }}>n</th>
              </tr>
            </thead>
            <tbody>
              {INPUT_VARS.flatMap((input) =>
                OUTPUT_VARS.map((output) => {
                  const { r, n } = cells[`${input.key}__${output.key}`]
                  return (
                    <tr key={`${input.key}__${output.key}`}>
                      <td style={{ padding: 4 }}>{input.label}</td>
                      <td style={{ padding: 4 }}>{output.label}</td>
                      <td className="mono" style={{ padding: 4, textAlign: 'right' }}>{r === null ? '—' : r.toFixed(2)}</td>
                      <td className="mono" style={{ padding: 4, textAlign: 'right' }}>{n}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted" style={{ marginTop: 8 }}>Correlation, not causation.</p>
    </div>
  )
}
