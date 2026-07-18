export default function NumberInput({ label, value, onChange, step = 1, unit = '', placeholder }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="field-row" style={{ marginTop: 6 }}>
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
        {unit && <span className="mono muted">{unit}</span>}
      </div>
    </div>
  )
}
