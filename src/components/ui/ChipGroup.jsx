export default function ChipGroup({ label, options, value, onChange, multi = false }) {
  const selected = multi ? (value || []) : value
  function toggle(opt) {
    if (multi) {
      const set = new Set(selected)
      if (set.has(opt)) set.delete(opt)
      else set.add(opt)
      onChange([...set])
    } else {
      onChange(selected === opt ? null : opt)
    }
  }
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="chip-group">
        {options.map((opt) => {
          const isSelected = multi ? selected.includes(opt) : selected === opt
          return (
            <div
              key={opt}
              className={`chip${isSelected ? ' selected' : ''}`}
              onClick={() => toggle(opt)}
              role="button"
              tabIndex={0}
            >
              {opt}
            </div>
          )
        })}
      </div>
    </div>
  )
}
