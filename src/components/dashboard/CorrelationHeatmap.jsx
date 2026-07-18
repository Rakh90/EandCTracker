import { useState, useMemo } from 'react'
import { pearson, lagPairs } from '../../lib/stats'
import { INPUT_VARS, OUTPUT_VARS } from '../../lib/metrics'
import { DIVERGING, TEXT } from '../../lib/palette'
import { usePrefersDark } from '../../hooks/usePrefersDark'
import { lerpColor } from '../../lib/color'

const MIN_N = 10

function textOn(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#0b0b0b' : '#ffffff'
}

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

  return (
    <div className="card">
      <div className="field-row">
        <h3>Lag correlations</h3>
        <button type="button" onClick={() => setTableView((v) => !v)}>{tableView ? 'Grid' : 'Table'}</button>
      </div>
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
                  <th key={o.key} style={{ padding: 4, fontWeight: 600, color: text.secondary, minWidth: 56 }}>{o.label}</th>
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
                    const bg = insufficient ? text.grid : cellColor(r)
                    const fg = insufficient ? text.muted : textOn(bg)
                    return (
                      <td
                        key={output.key}
                        title={`${input.label} → ${output.label}, lag ${lag}: r=${r === null ? '—' : r.toFixed(2)}, n=${n}`}
                        style={{
                          padding: '6px 4px',
                          textAlign: 'center',
                          background: bg,
                          color: fg,
                          border: `1px solid ${text.grid}`,
                        }}
                      >
                        <div className="mono" style={{ fontWeight: 700 }}>{r === null ? '—' : r.toFixed(2)}</div>
                        <div style={{ fontSize: 9, opacity: 0.85 }}>n={n}</div>
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
      <p className="muted" style={{ marginTop: 8 }}>
        Blue = positive, red = negative, gray = ~0 or insufficient data (n&lt;{MIN_N}). Correlation, not causation.
      </p>
    </div>
  )
}
