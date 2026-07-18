import { useState } from 'react'
import { CAFFEINE_PRESETS, CAFFEINE_GUIDE } from '../lib/definitions'
import HintToggle from './ui/HintToggle'
import ChipGroup from './ui/ChipGroup'
import Slider from './ui/Slider'

export default function CaffeineQuickAdd({ totalMg, onAdd }) {
  const [showGuide, setShowGuide] = useState(false)
  const [customMg, setCustomMg] = useState('')
  const [pourType, setPourType] = useState(CAFFEINE_PRESETS[0].label)
  const [pourOz, setPourOz] = useState(CAFFEINE_PRESETS[0].defaultOz)

  const pourPreset = CAFFEINE_PRESETS.find((p) => p.label === pourType) || CAFFEINE_PRESETS[0]
  const mgPerOz = pourPreset.mg / pourPreset.defaultOz
  const pourMg = Math.round(mgPerOz * pourOz)

  function selectPourType(label) {
    const preset = CAFFEINE_PRESETS.find((p) => p.label === label) || CAFFEINE_PRESETS[0]
    setPourType(preset.label)
    setPourOz(preset.defaultOz)
  }

  function addAmount() {
    const n = Number(customMg)
    if (!n) return
    onAdd(n)
    setCustomMg('')
  }

  function subtractAmount() {
    const n = Number(customMg)
    if (!n) return
    onAdd(-n)
    setCustomMg('')
  }

  return (
    <div className="field">
      <div className="field-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label>Caffeine</label>
          <HintToggle hint={CAFFEINE_GUIDE} open={showGuide} onToggle={() => setShowGuide((s) => !s)} />
        </div>
        <span className="mono">{totalMg ?? 0}mg today</span>
      </div>
      {showGuide && <p className="muted" style={{ marginTop: 6 }}>{CAFFEINE_GUIDE}</p>}

      <ChipGroup options={CAFFEINE_PRESETS.map((p) => p.label)} value={pourType} onChange={(v) => selectPourType(v || CAFFEINE_PRESETS[0].label)} />
      <Slider
        label={`${pourType} size`}
        value={pourOz}
        onChange={setPourOz}
        min={1}
        max={pourType === 'Espresso' ? 4 : 24}
        unit="oz"
        defaultValue={pourPreset.defaultOz}
      />
      <div className="field-row" style={{ marginTop: 4 }}>
        <span className="mono muted">≈{pourMg}mg</span>
        <button type="button" onClick={() => onAdd(pourMg)}>Add pour</button>
      </div>

      <div className="field-row" style={{ marginTop: 10 }}>
        <input
          type="number"
          inputMode="numeric"
          placeholder="mg"
          value={customMg}
          onChange={(e) => setCustomMg(e.target.value)}
          style={{ flex: '0 0 90px' }}
        />
        <button type="button" onClick={addAmount} disabled={!customMg}>Add</button>
        <button type="button" className="danger" onClick={subtractAmount} disabled={!customMg}>Subtract</button>
      </div>
    </div>
  )
}
