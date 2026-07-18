export function todayStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// The "logical" day for logging purposes runs 4am-to-4am instead of
// midnight-to-midnight, so a late night (up past midnight but before dawn)
// still counts toward the day you were actually awake for, not a new one.
export const DAY_START_HOUR = 4

export function logicalDateStr(d = new Date()) {
  const shifted = new Date(d)
  if (shifted.getHours() < DAY_START_HOUR) shifted.setDate(shifted.getDate() - 1)
  return todayStr(shifted)
}

export function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + n)
  return todayStr(dt)
}

export function daysBetween(startStr, endStr) {
  const [y1, m1, d1] = startStr.split('-').map(Number)
  const [y2, m2, d2] = endStr.split('-').map(Number)
  const a = new Date(y1, m1 - 1, d1)
  const b = new Date(y2, m2 - 1, d2)
  return Math.round((b - a) / 86400000)
}

export function lastNDates(n, endDateStr = logicalDateStr()) {
  const out = []
  for (let i = n - 1; i >= 0; i--) out.push(addDays(endDateStr, -i))
  return out
}

// Sorts clock times chronologically within a logical (4am-to-4am) day: a
// time before DAY_START_HOUR belongs to the tail end of the day that started
// the previous calendar morning, so it must sort after 23:59, not before 00:00.
export function logicalMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const adjH = h < DAY_START_HOUR ? h + 24 : h
  return adjH * 60 + m
}

export function formatDisplayDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function nowTimeHHMM(d = new Date()) {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

// Derives hours slept from clock-time bed/wake inputs. If bed-time is
// numerically at or after wake-time (e.g. bed 23:00, wake 07:00), the
// bedtime is assumed to be the previous evening and wraps past midnight;
// otherwise both times are treated as the same overnight stretch (e.g. bed
// 00:30, wake 07:00 = 6.5h) without needing a separate calendar date.
export function sleepHoursFromTimes(bedTime, wakeTime) {
  if (!bedTime || !wakeTime) return null
  const [bh, bm] = bedTime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  const bedMin = bh * 60 + bm
  let wakeMin = wh * 60 + wm
  if (bedMin === wakeMin) return 0
  if (bedMin > wakeMin) wakeMin += 24 * 60
  return Math.round(((wakeMin - bedMin) / 60) * 4) / 4
}

export function formatTime12h(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}
