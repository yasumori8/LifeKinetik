import { useEffect, useRef, useCallback } from 'react'
import { PHASES, TIMING } from '../constants/game.js'
import { stepBalls } from '../utils/ballPhysics.js'
import { drawFrame } from '../utils/drawing.js'

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
  const rafIdRef = useRef(null)
  const lastTimestampRef = useRef(null)

  const tick = useCallback(
    (timestamp) => {
      if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp
      const dt = Math.min((timestamp - lastTimestampRef.current) / 1000, 0.05)
      lastTimestampRef.current = timestamp

      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const W = canvas.width
      const H = canvas.height

      const phase = phaseRef.current
      const elapsed = timestamp - startTimeRef.current

      // Phase transitions
      if (phase === PHASES.APPEAR && elapsed >= TIMING.APPEAR_MS) {
        transitionTo(PHASES.SHINE)
      } else if (phase === PHASES.SHINE && elapsed >= TIMING.SHINE_MS) {
        transitionTo(PHASES.MOVE)
      } else if (phase === PHASES.MOVE && elapsed >= moveDurationRef.current) {
        onAssignNumbers()
        transitionTo(PHASES.STOP)
      } else if (phase === PHASES.STOP && elapsed >= TIMING.STOP_MS) {
        transitionTo(PHASES.SELECT)
      }

      // Physics — only during MOVE
      if (phaseRef.current === PHASES.MOVE) {
        stepBalls(ballsRef.current, dt, W, H)
      }

      // Draw
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const start = useCallback(() => {
    lastTimestampRef.current = null
    rafIdRef.current = requestAnimationFrame(tick)
  }, [tick])

  const stop = useCallback(() => {
    cancelAnimationFrame(rafIdRef.current)
    rafIdRef.current = null
  }, [])

  useEffect(() => () => cancelAnimationFrame(rafIdRef.current), [])

  return { start, stop }
}
