import Dexie from 'dexie'

export const db = new Dexie('eandc_tracker')

db.version(1).stores({
  daily_log: 'date',
  benchmark_runs: '++id, date',
  meals: '++id, date',
  experiments: '++id, start_date, end_date',
  settings: 'key',
})

db.version(2).stores({
  creatine_intakes: '++id, date',
})

db.version(3).stores({
  movement_logs: '++id, date',
})

export const DAILY_LOG_FIELDS = [
  'date', 'bed_time', 'wake_time', 'sleep_hours', 'sleep_quality', 'wake_state', 'night_wakings',
  'am_phys_energy', 'am_mental_energy', 'am_mood', 'am_fog',
  'focus_minutes', 'midday_fog', 'memory_slips', 'processing_speed', 'stress_midday',
  'caffeine_mg', 'water_total',
  'movement_type', 'movement_min', 'movement_intensity',
  'symptom_headache', 'symptom_soreness', 'symptom_stomach', 'symptom_other',
  'exec_tasks', 'exec_problems', 'exec_organization',
  'pm_phys_energy', 'pm_mental_energy', 'pm_mood', 'stress_avg',
  'post_meal_crash', 'crash_delay_min', 'notes',
]

export const BENCHMARK_RUN_FIELDS = [
  'id', 'date', 'timestamp', 'context',
  'span', 'span_score', 'rt_median_ms', 'rt_score',
  'sprint_net', 'sprint_answered', 'sprint_score', 'composite',
]

export const MEAL_FIELDS = ['id', 'date', 'time', 'description', 'energy_effect', 'effect_delay_min']

export const CREATINE_FIELDS = ['id', 'date', 'time', 'grams']

export const MOVEMENT_FIELDS = ['id', 'date', 'time', 'movement_type', 'minutes', 'intensity']

export const EXPERIMENT_FIELDS = [
  'id', 'start_date', 'end_date', 'variable_changed', 'target_output', 'target_days',
  'action', 'hypothesis', 'outcome', 'verdict',
]

export async function getOrCreateDailyLog(date) {
  const existing = await db.daily_log.get(date)
  if (existing) return existing
  const blank = { date }
  await db.daily_log.put(blank)
  return blank
}

export async function patchDailyLog(date, patch) {
  await getOrCreateDailyLog(date)
  await db.daily_log.update(date, patch)
  return db.daily_log.get(date)
}

export async function addMeal(meal) {
  return db.meals.add(meal)
}

export async function deleteMeal(id) {
  return db.meals.delete(id)
}

export async function addCreatineIntake(entry) {
  return db.creatine_intakes.add(entry)
}

export async function deleteCreatineIntake(id) {
  return db.creatine_intakes.delete(id)
}

export async function addMovementLog(entry) {
  return db.movement_logs.add(entry)
}

export async function deleteMovementLog(id) {
  return db.movement_logs.delete(id)
}

export async function addBenchmarkRun(run) {
  return db.benchmark_runs.add(run)
}

export async function wipeAllData() {
  await db.transaction('rw', db.daily_log, db.benchmark_runs, db.meals, db.experiments, db.creatine_intakes, db.movement_logs, async () => {
    await db.daily_log.clear()
    await db.benchmark_runs.clear()
    await db.meals.clear()
    await db.experiments.clear()
    await db.creatine_intakes.clear()
    await db.movement_logs.clear()
  })
}

export async function getSetting(key, fallback = null) {
  const row = await db.settings.get(key)
  return row ? row.value : fallback
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value })
}
