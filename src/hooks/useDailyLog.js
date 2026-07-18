import { useLiveQuery } from 'dexie-react-hooks'
import { db, patchDailyLog } from '../db/db'

export function useDailyLog(date) {
  const log = useLiveQuery(() => db.daily_log.get(date), [date])
  async function patch(fields) {
    await patchDailyLog(date, fields)
  }
  return { log: log || { date }, patch, loaded: log !== undefined }
}

export function useMealsForDate(date) {
  const meals = useLiveQuery(() => db.meals.where('date').equals(date).toArray(), [date])
  return meals || []
}

export function useCreatineForDate(date) {
  const entries = useLiveQuery(() => db.creatine_intakes.where('date').equals(date).toArray(), [date])
  return entries || []
}

export function useMovementForDate(date) {
  const entries = useLiveQuery(() => db.movement_logs.where('date').equals(date).toArray(), [date])
  return entries || []
}
