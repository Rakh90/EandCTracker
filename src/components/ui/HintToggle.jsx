export default function HintToggle({ open, onToggle, hint }) {
  if (!hint) return null
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Show definition"
      style={{
        width: 20,
        height: 20,
        padding: 0,
        borderRadius: '50%',
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '20px',
        boxShadow: 'none',
        background: open ? 'var(--cobalt)' : 'var(--surface-2)',
        color: open ? '#fff' : 'var(--ink-secondary)',
        border: 'none',
        flexShrink: 0,
      }}
    >
      i
    </button>
  )
}
