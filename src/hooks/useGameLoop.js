import { useEffect, useRef, useCallback } from 'react'
import { PHASES, TIMING } from '../constants/game.js'
import { stepBalls } from '../utils/ballPhysics.js'
import { drawFrame } from '../utils/drawing.js'

// Manages the requestAnimationFrame loop that drives physics and rendering.
// All game state is read from refs (not React state) so the tick closure never
// captures stale values — React state would be frozen at the time the closure
// was created, while refs always reflect the latest value.
export function useGameLoop({
  canvasRef,
  ballsRef,
  phaseRef,
  startTimeRef,
  moveDurationRef,
  selectedRef,
  scoreRef,
  transitionTo,
  onAssignNumbers,
}) {
  const rafIdRef = useRef(null)           // handle used to cancel the loop
  const lastTimestampRef = useRef(null)   // tracks previous frame time for dt calculation

  const tick = useCallback(
    (timestamp) => {
      // On the very first frame, seed lastTimestamp so dt = 0 (no physics jump)
      if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp

      // dt is capped at 50ms to prevent a huge physics step if the tab was hidden
      const dt = Math.min((timestamp - lastTimestampRef.current) / 1000, 0.05)
      lastTimestampRef.current = timestamp

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const W = canvas.width
      const H = canvas.height

      const phase = phaseRef.current
      const elapsed = timestamp - startTimeRef.current  // ms since this phase started

      // Automatic phase transitions driven by elapsed time
      if (phase === PHASES.APPEAR && elapsed >= TIMING.APPEAR_MS) {
        transitionTo(PHASES.SHINE)
      } else if (phase === PHASES.SHINE && elapsed >= TIMING.SHINE_MS) {
        transitionTo(PHASES.MOVE)
      } else if (phase === PHASES.MOVE && elapsed >= moveDurationRef.current) {
        // Assign random numbers to balls before freezing so they appear on STOP
        onAssignNumbers()
        transitionTo(PHASES.STOP)
      } else if (phase === PHASES.STOP && elapsed >= TIMING.STOP_MS) {
        transitionTo(PHASES.SELECT)
      }

      // Physics only runs during MOVE; all other phases keep balls stationary
      if (phaseRef.current === PHASES.MOVE) {
        stepBalls(ballsRef.current, dt, W, H)
      }

      // Render the current frame — reads phaseRef after the transition above
      drawFrame(
        ctx,
        ballsRef.current,
        phaseRef.current,
        timestamp - startTimeRef.current,
        selectedRef.current,
        scoreRef.current,
        W,
        H,
      )

      rafIdRef.current = requestAnimationFrame(tick)
    },
    // Dependencies are intentionally empty — all values are read via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const start = useCallback(() => {
    lastTimestampRef.current = null  // reset so first frame doesn't produce a large dt
    rafIdRef.current = requestAnimationFrame(tick)
  }, [tick])

  const stop = useCallback(() => {
    cancelAnimationFrame(rafIdRef.current)
    rafIdRef.current = null
  }, [])

  // Cancel the loop if the component unmounts to prevent memory leaks
  useEffect(() => () => cancelAnimationFrame(rafIdRef.current), [])

  return { start, stop }
}
