export function mean(nums) {
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function stddev(nums) {
  if (nums.length < 2) return null
  const m = mean(nums)
  const variance = nums.reduce((a, b) => a + (b - m) ** 2, 0) / (nums.length - 1)
  return Math.sqrt(variance)
}

// Pearson correlation over paired (x, y) samples, ignoring pairs where either is null/undefined.
export function pearson(xs, ys) {
  const pairs = []
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i]
    const y = ys[i]
    if (x === null || x === undefined || y === null || y === undefined) continue
    if (Number.isNaN(x) || Number.isNaN(y)) continue
    pairs.push([x, y])
  }
  const n = pairs.length
  if (n < 2) return { r: null, n }
  const xsF = pairs.map((p) => p[0])
  const ysF = pairs.map((p) => p[1])
  const mx = mean(xsF)
  const my = mean(ysF)
  let num = 0, dx2 = 0, dy2 = 0
  for (let i = 0; i < n; i++) {
    const dx = xsF[i] - mx
    const dy = ysF[i] - my
    num += dx * dy
    dx2 += dx * dx
    dy2 += dy * dy
  }
  const denom = Math.sqrt(dx2 * dy2)
  if (denom === 0) return { r: null, n }
  return { r: num / denom, n }
}

// Builds lag-shifted pairs: output[i] paired with input[i - lag].
export function lagPairs(inputSeries, outputSeries, lag) {
  const xs = []
  const ys = []
  for (let i = 0; i < outputSeries.length; i++) {
    const inputIdx = i - lag
    if (inputIdx < 0) continue
    xs.push(inputSeries[inputIdx])
    ys.push(outputSeries[i])
  }
  return { xs, ys }
}
