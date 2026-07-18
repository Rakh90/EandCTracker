export default function TimeInput({ label, value, onChange }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <input type="time" value={value || ''} onChange={(e) => onChange(e.target.value)} style={{ marginTop: 6 }} />
    </div>
  )
}
