// Validated categorical palette (see dataviz skill references/palette.md) — fixed
// hue order, never cycled or reordered per chart.
export const CATEGORICAL = {
  light: ['#2a78d6', '#008300', '#e87ba4', '#eda100', '#1baf7a', '#eb6834', '#4a3aa7', '#e34948'],
  dark: ['#3987e5', '#008300', '#d55181', '#c98500', '#199e70', '#d95926', '#9085e9', '#e66767'],
}

export const DIVERGING = {
  light: { pos: '#2a78d6', neg: '#e34948', mid: '#f0efec' },
  dark: { pos: '#3987e5', neg: '#e66767', mid: '#383835' },
}

export const SEQUENTIAL_BLUE = {
  light: ['#cde2fb', '#9ec5f4', '#5598e7', '#2a78d6', '#1c5cab', '#0d366b'],
  dark: ['#cde2fb', '#9ec5f4', '#5598e7', '#3987e5', '#1c5cab', '#0d366b'],
}

export const TEXT = {
  light: { primary: '#0b0b0b', secondary: '#52514e', muted: '#898781', grid: '#e1e0d9' },
  dark: { primary: '#ffffff', secondary: '#c3c2b7', muted: '#898781', grid: '#2c2c2a' },
}

export function seriesColor(mode, index) {
  return CATEGORICAL[mode][index % CATEGORICAL[mode].length]
}
