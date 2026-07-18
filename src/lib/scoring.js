export const SPAN_MIN = 3
export const SPAN_MAX = 8
export const RT_BEST_MS = 200
export const RT_WORST_MS = 600
export const SPRINT_NET_MAX = 30

export const WEIGHTS = { span: 0.35, rt: 0.30, sprint: 0.35 }

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

export function spanToScore(span) {
  return clamp(((span - SPAN_MIN) / (SPAN_MAX - SPAN_MIN)) * 100, 0, 100)
}

export function rtToScore(rtMedianMs) {
  return clamp(((RT_WORST_MS - rtMedianMs) / (RT_WORST_MS - RT_BEST_MS)) * 100, 0, 100)
}

export function sprintToScore(net) {
  return clamp((net / SPRINT_NET_MAX) * 100, 0, 100)
}

export function compositeScore({ span_score, rt_score, sprint_score }) {
  return span_score * WEIGHTS.span + rt_score * WEIGHTS.rt + sprint_score * WEIGHTS.sprint
}

export function median(nums) {
  if (nums.length === 0) return null
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
