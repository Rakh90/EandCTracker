export default function Slider({ label, value, onChange, min = 1, max = 10, unit = '' }) {
  return (
    <div className="field">
      <div className="field-row">
        <label>{label}</label>
        <span className="mono">{value ?? '—'}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value ?? Math.round((min + max) / 2)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
