export default function Stepper({ label, value, onChange, min = 0, max = 99, step = 1, unit = '' }) {
  const current = value ?? min
  return (
    <div className="field">
      <label>{label}</label>
      <div className="stepper" style={{ marginTop: 6 }}>
        <button type="button" onClick={() => onChange(Math.max(min, current - step))}>−</button>
        <span className="value">{value ?? '—'}{unit}</span>
        <button type="button" onClick={() => onChange(Math.min(max, current + step))}>+</button>
      </div>
    </div>
  )
}
