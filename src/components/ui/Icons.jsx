const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconHome(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  )
}

export function IconChart(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20V10" />
      <path d="M11 20V4" />
      <path d="M18 20v-7" />
      <path d="M3 20h18" />
    </svg>
  )
}

export function IconSpark(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  )
}

export function IconGear(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V20a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H4a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10a1.7 1.7 0 0 0 1-1.55V4a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10a1.7 1.7 0 0 0 1.55 1H20a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z" />
    </svg>
  )
}

export function IconSun(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
    </svg>
  )
}

export function IconCloudSun(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8 9.5a4 4 0 0 1 7.6-1.7" />
      <path d="M6.5 20a3.8 3.8 0 0 1-.5-7.57A4.5 4.5 0 0 1 14.5 11 4 4 0 0 1 16 19H6.5Z" />
    </svg>
  )
}

export function IconMoon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  )
}

export function IconBrain(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9.5 4.5a2.5 2.5 0 0 0-2.5 2.5v.2A2.8 2.8 0 0 0 5 9.8V11a2.6 2.6 0 0 0-1 4.9 2.8 2.8 0 0 0 2.8 3.6h.2a2.5 2.5 0 0 0 4.5-1.5V7a2.5 2.5 0 0 0-1-2.5Z" />
      <path d="M14.5 4.5A2.5 2.5 0 0 1 17 7v.2A2.8 2.8 0 0 1 19 9.8V11a2.6 2.6 0 0 1 1 4.9 2.8 2.8 0 0 1-2.8 3.6h-.2a2.5 2.5 0 0 1-4.5-1.5V7a2.5 2.5 0 0 1 1-2.5Z" />
    </svg>
  )
}

export function IconClock(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3.2 2" />
    </svg>
  )
}

export function IconCheck(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12.5 9.5 18 20 6" />
    </svg>
  )
}

export function IconChevron(props) {
  return (
    <svg {...base} {...props}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

export function IconTrash(props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6.5h16" />
      <path d="M8.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v1.5" />
      <path d="M6.5 6.5 7.2 19a1.5 1.5 0 0 0 1.5 1.4h6.6a1.5 1.5 0 0 0 1.5-1.4l.7-12.5" />
      <path d="M10 10.5v6M14 10.5v6" />
    </svg>
  )
}

export function IconBell(props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 9.5a6 6 0 0 1 12 0v4.2l1.6 2.8H4.4L6 13.7Z" />
      <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
    </svg>
  )
}

export function IconCloudOff(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8 9.5a4 4 0 0 1 7.4-2.1M17.5 10.3A4 4 0 0 1 16 18H6.5a3.8 3.8 0 0 1-.9-7.5" />
      <path d="M3 3l18 18" />
    </svg>
  )
}
