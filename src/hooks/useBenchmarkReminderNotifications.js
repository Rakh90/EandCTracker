import { useEffect, useRef } from 'react'
import { useSetting } from './useSetting'
import { logicalDateStr, nowTimeHHMM } from '../lib/dates'
import { fireNotification, notificationPermission } from '../lib/notifications'

const CHECK_INTERVAL_MS = 30000

// Fires a real (Notification API) alert as each configured reminder time
// passes, as long as the app is open in a tab — foreground or backgrounded —
// since there is no push server behind this to deliver one while fully
// closed. Runs once at the App root so it keeps ticking across navigation.
export function useBenchmarkReminderNotifications() {
  const [enabled] = useSetting('notificationsEnabled', false)
  const [reminderTimes] = useSetting('benchmarkReminderTimes', ['09:00'])
  const firedRef = useRef(new Set())

  useEffect(() => {
    if (!enabled || notificationPermission() !== 'granted') return

    function tick() {
      const date = logicalDateStr()
      const nowTime = nowTimeHHMM()
      for (const t of reminderTimes || []) {
        const key = `${date}__${t}`
        if (t > nowTime || firedRef.current.has(key)) continue
        firedRef.current.add(key)
        fireNotification('Benchmark reminder', {
          body: `It's ${t} — time for your cognitive benchmark.`,
          tag: key,
          icon: `${import.meta.env.BASE_URL}pwa-192.png`,
        })
      }
    }

    tick()
    const id = setInterval(tick, CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [enabled, reminderTimes])
}
