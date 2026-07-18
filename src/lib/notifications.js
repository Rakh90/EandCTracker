export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission() {
  return isNotificationSupported() ? Notification.permission : 'unsupported'
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported'
  return Notification.requestPermission()
}

// Uses the service worker registration when available so the notification
// carries the app icon/badge like a native one; falls back to a plain
// Notification for browsers/contexts without an active registration. Either
// way this only fires while the app is open in a tab (foreground or
// backgrounded) — there is no push server here, so a fully closed tab or
// browser will not receive it.
export async function fireNotification(title, options) {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg) {
        await reg.showNotification(title, options)
        return
      }
    } catch {
      // fall through to plain Notification
    }
  }
  new Notification(title, options)
}
