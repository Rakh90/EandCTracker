import { useLiveQuery } from 'dexie-react-hooks'
import { db, setSetting } from '../db/db'

export function useSetting(key, fallback = null) {
  const row = useLiveQuery(() => db.settings.get(key), [key])
  const value = row === undefined ? fallback : row ? row.value : fallback
  async function set(v) {
    await setSetting(key, v)
  }
  return [value, set]
}
