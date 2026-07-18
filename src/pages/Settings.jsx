import { useState, useRef } from 'react'
import { useSetting } from '../hooks/useSetting'
import { wipeAllData } from '../db/db'
import { exportAllAsJSON, exportAllCSVZipish, downloadFile, importJSON } from '../lib/csv'
import { todayStr } from '../lib/dates'

export default function Settings() {
  const [reminderTimes, setReminderTimes] = useSetting('benchmarkReminderTimes', ['09:00'])
  const [apiKey, setApiKey] = useSetting('anthropicApiKey', '')
  const [wipeStep, setWipeStep] = useState(0)
  const [status, setStatus] = useState('')
  const fileInputRef = useRef(null)

  const times = reminderTimes || []

  function updateReminderTime(index, value) {
    const next = [...times]
    next[index] = value
    setReminderTimes(next)
  }

  function addReminderTime() {
    setReminderTimes([...times, '09:00'])
  }

  function removeReminderTime(index) {
    setReminderTimes(times.filter((_, i) => i !== index))
  }

  async function handleExportJSON() {
    const json = await exportAllAsJSON()
    downloadFile(`eandc-export-${todayStr()}.json`, json, 'application/json')
  }

  async function handleExportCSV() {
    const csv = await exportAllCSVZipish()
    downloadFile(`eandc-export-${todayStr()}.txt`, csv, 'text/plain')
  }

  async function handleImportFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const text = await file.text()
    try {
      await importJSON(text)
      setStatus(`Imported successfully from ${file.name}.`)
    } catch (err) {
      setStatus(`Import failed: ${err.message}`)
    }
    e.target.value = ''
  }

  async function handleWipe() {
    if (wipeStep === 0) {
      setWipeStep(1)
      return
    }
    await wipeAllData()
    setWipeStep(0)
    setStatus('All data wiped.')
  }

  return (
    <div>
      <div className="top-bar">
        <h1>Settings</h1>
      </div>

      <div className="card">
        <h3>Benchmark reminders</h3>
        <p className="muted" style={{ marginTop: -8, marginBottom: 12 }}>
          The benchmark is meant to be run multiple times a day — add a reminder for each time you want a nudge.
        </p>
        {times.map((t, i) => (
          <div key={i} className="field-row" style={{ marginBottom: 8 }}>
            <input type="time" value={t} onChange={(e) => updateReminderTime(i, e.target.value)} />
            <button type="button" onClick={() => removeReminderTime(i)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addReminderTime}>Add reminder</button>
      </div>

      <div className="card">
        <h3>AI Review</h3>
        <label>Anthropic API key</label>
        <input
          type="password"
          value={apiKey || ''}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-..."
          style={{ marginTop: 6 }}
        />
        <p className="muted" style={{ marginTop: 6 }}>
          Stored locally only, never sent anywhere but Anthropic's API. Required for the "Generate weekly review" button on the Insights tab.
        </p>
      </div>

      <div className="card">
        <h3>Export data</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={handleExportJSON}>Export JSON</button>
          <button type="button" onClick={handleExportCSV}>Export CSV</button>
        </div>
      </div>

      <div className="card">
        <h3>Import data</h3>
        <p className="muted">Import a JSON dump exported from this app (round-trips losslessly).</p>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} />
      </div>

      {status && (
        <div className="card">
          <p style={{ margin: 0 }}>{status}</p>
        </div>
      )}

      <div className="card" style={{ borderColor: 'var(--danger)' }}>
        <h3>Danger zone</h3>
        {wipeStep === 0 ? (
          <button type="button" className="danger" onClick={handleWipe}>Wipe all data</button>
        ) : (
          <>
            <p>Are you sure? This permanently deletes every check-in, benchmark run, meal, and experiment.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="danger" onClick={handleWipe}>Yes, wipe everything</button>
              <button type="button" onClick={() => setWipeStep(0)}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
