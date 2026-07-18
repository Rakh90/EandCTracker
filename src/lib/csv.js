import Papa from 'papaparse'
import { db } from '../db/db'

const TABLES = ['daily_log', 'benchmark_runs', 'meals', 'experiments']

export async function exportAllAsJSON() {
  const data = {}
  for (const t of TABLES) data[t] = await db.table(t).toArray()
  return JSON.stringify(data, null, 2)
}

export async function exportTableAsCSV(tableName) {
  const rows = await db.table(tableName).toArray()
  return Papa.unparse(rows)
}

export function downloadFile(filename, contents, mime) {
  const blob = new Blob([contents], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function exportAllCSVZipish() {
  // Bundles all four tables into one text file, section-delimited, since no zip lib is used.
  const parts = []
  for (const t of TABLES) {
    const rows = await db.table(t).toArray()
    parts.push(`### ${t} ###\n${Papa.unparse(rows)}`)
  }
  return parts.join('\n\n')
}

export async function importJSON(jsonText) {
  const parsed = JSON.parse(jsonText)
  await db.transaction('rw', db.daily_log, db.benchmark_runs, db.meals, db.experiments, async () => {
    for (const t of TABLES) {
      if (!Array.isArray(parsed[t])) continue
      for (const row of parsed[t]) {
        await db.table(t).put(row)
      }
    }
  })
}

export async function importCSV(tableName, csvText) {
  const { data } = Papa.parse(csvText, { header: true, dynamicTyping: true, skipEmptyLines: true })
  await db.transaction('rw', db.table(tableName), async () => {
    for (const row of data) {
      await db.table(tableName).put(row)
    }
  })
  return data.length
}
