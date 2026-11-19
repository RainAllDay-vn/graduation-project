import { useEffect, useRef, useState, useCallback } from 'react'

export interface UseSessionTimeoutOptions {
  /** Inactivity threshold in milliseconds before sign-off (default: 15 minutes = 900,000ms) */
  idleTimeoutMs?: number
  /** Duration of warning countdown in milliseconds (default: 60 seconds = 60,000ms) */
  warningDurationMs?: number
  /** Whether the session watchdog is enabled (usually true only when authenticated) */
  enabled?: boolean
  /** Callback fired when countdown finishes and session is signed off */
  onSignOff?: (reason: 'inactivity') => void
  /** Callback fired to ping the backend to extend the server session */
  onKeepAlive?: () => Promise<void> | void
}

export interface UseSessionTimeoutReturn {
  /** Whether the warning countdown modal should be displayed */
  showWarning: boolean
  /** Number of seconds remaining before automatic sign-off */
  remainingSeconds: number
  /** User action: Extend session (keep working) */
  extendSession: () => Promise<void>
  /** User action: Sign off immediately */
  signOffNow: () => void
}

const DEFAULT_IDLE_TIMEOUT_MS = 15 * 60 * 1000 // 15 minutes
const DEFAULT_WARNING_DURATION_MS = 60 * 1000 // 60 seconds
const ACTIVITY_THROTTLE_MS = 2000 // 2 seconds

export function useSessionTimeout({
  idleTimeoutMs = DEFAULT_IDLE_TIMEOUT_MS,
  warningDurationMs = DEFAULT_WARNING_DURATION_MS,
  enabled = true,
  onSignOff,
  onKeepAlive,
}: UseSessionTimeoutOptions = {}): UseSessionTimeoutReturn {
  const [showWarning, setShowWarning] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.round(warningDurationMs / 1000)
  )

  const lastActivityRef = useRef<number>(Date.now())
  const lastThrottleRef = useRef<number>(0)
  const isWarningActiveRef = useRef<boolean>(false)

  // Sync ref with state
  isWarningActiveRef.current = showWarning

  const signOffNow = useCallback(() => {
    setShowWarning(false)
    onSignOff?.('inactivity')
  }, [onSignOff])

  const extendSession = useCallback(async () => {
    lastActivityRef.current = Date.now()
    setShowWarning(false)
    if (onKeepAlive) {
      try {
        await onKeepAlive()
      } catch (err) {
        console.warn('Failed to refresh session on backend:', err)
      }
    }
  }, [onKeepAlive])

  // Track user activity (only reset if warning dialog is NOT currently showing)
  useEffect(() => {
    if (!enabled) return

    const handleUserActivity = () => {
      const now = Date.now()
      // If warning modal is already open, do not auto-dismiss on subtle mouse jiggles
      // Kỹ sư cần bấm rõ ràng vào nút "Tiếp tục"
      if (isWarningActiveRef.current) return

      if (now - lastThrottleRef.current > ACTIVITY_THROTTLE_MS) {
        lastThrottleRef.current = now
        lastActivityRef.current = now
      }
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((evt) =>
      window.addEventListener(evt, handleUserActivity, { passive: true })
    )

    return () => {
      events.forEach((evt) =>
        window.removeEventListener(evt, handleUserActivity)
      )
    }
  }, [enabled])

  // Timer watchdog loop (ticks every 1,000ms)
  useEffect(() => {
    if (!enabled) {
      setShowWarning(false)
      return
    }

    // Reset reference timestamp on activation
    lastActivityRef.current = Date.now()

    const intervalId = window.setInterval(() => {
      const now = Date.now()
      const idleElapsed = now - lastActivityRef.current
      const warningThreshold = idleTimeoutMs - warningDurationMs

      if (idleElapsed >= idleTimeoutMs) {
        // Timeout reached -> Sign off
        signOffNow()
      } else if (idleElapsed >= warningThreshold) {
        // Warning threshold reached -> Show warning countdown
        const remainingMs = idleTimeoutMs - idleElapsed
        const remainingSec = Math.max(1, Math.ceil(remainingMs / 1000))
        setRemainingSeconds(remainingSec)
        setShowWarning(true)
      } else {
        // Still within normal activity period
        if (isWarningActiveRef.current) {
          setShowWarning(false)
        }
      }
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [enabled, idleTimeoutMs, warningDurationMs, signOffNow])

  return {
    showWarning,
    remainingSeconds,
    extendSession,
    signOffNow,
  }
}
