export const DEFS = {
  sleep_quality: '1 = miserable, barely slept · 5 = okay, some interruptions · 10 = deep, unbroken, woke up naturally',
  phys_energy: '1 = can barely move · 5 = functional but tired · 10 = energized, ready for anything',
  mental_energy: "1 = can't think straight · 5 = able to focus with effort · 10 = sharp, clear-headed",
  mood: '1 = very low or irritable · 5 = neutral · 10 = great, upbeat',
  fog: '0 = crystal clear thinking · 5 = noticeably hazy, slower to process · 10 = can’t think at all',
  stress: '1 = completely relaxed · 5 = manageable tension · 10 = overwhelmed, can’t cope',
  processing_speed: 'Slower = tasks/thoughts take noticeably longer than your normal · Normal = typical pace for you · Faster = quicker than usual, ideas flow easily',
  memory_slips: "Count any time today you forgot something you'd normally remember — a word, why you walked into a room, a task, a name, losing your train of thought",
  movement_intensity: '1 = barely elevated effort · 5 = moderate, breaking a sweat · 10 = maximal effort',
  symptom_severity: '1 = barely noticeable · 5 = distracting but manageable · 10 = severe, hard to function through',
  exec_tasks: '1 = could not complete tasks · 5 = completed with effort · 10 = smooth, efficient completion',
  exec_problems: '1 = stuck on simple problems · 5 = worked through with effort · 10 = solved quickly and clearly',
  exec_organization: '1 = scattered, disorganized · 5 = kept up with effort · 10 = organized, on top of everything',
}

export const CAFFEINE_PRESETS = [
  { label: 'Drip coffee (8oz)', mg: 95 },
  { label: 'French press (8oz)', mg: 115 },
  { label: 'Espresso shot', mg: 63 },
  { label: 'Cold brew (12oz)', mg: 200 },
  { label: 'Tea (8oz)', mg: 47 },
]

export const CAFFEINE_GUIDE =
  'Rough mg per fl oz, brewed at home: drip/pour-over ~12–16 · French press ~15–20 (stronger extraction) ' +
  '· cold brew ~15–30 (often more concentrated) · espresso ~63mg per 1oz shot regardless of cup size. ' +
  'Multiply your cup size by the brew’s mg/oz for a decent estimate, or use a preset below.'

export const WATER_PRESETS = [
  { label: '+8oz', oz: 8 },
  { label: '+12oz', oz: 12 },
  { label: '+16oz', oz: 16 },
  { label: '+24oz', oz: 24 },
]
