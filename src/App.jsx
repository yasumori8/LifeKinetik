import { useState, useRef, useCallback } from 'react'
import { PHASES, speedLevelToRange, pickRoundRadius } from './constants/game.js'
import { initBalls } from './utils/ballPhysics.js'
import { shuffle } from './utils/shuffle.js'
import { useGameLoop } from './hooks/useGameLoop.js'
import Canvas from './components/Canvas.jsx'
import GameControls from './components/GameControls.jsx'
import ResultsOverlay from './components/ResultsOverlay.jsx'
import SidePanel from './components/SidePanel.jsx'
import './App.css'

export default function App() {
  // ── Settings (user-configurable, drive the next round) ───────────────────
  const [phase, setPhase] = useState(PHASES.IDLE)
  const [duration, setDuration] = useState(8)        // seconds balls move (5–15)
  const [speed, setSpeed] = useState(6)              // speed level 1–20
  const [ballCount, setBallCount] = useState(8)      // total balls on screen
  const [targetCount, setTargetCount] = useState(4)  // balls the user must track
  const [repeats, setRepeats] = useState(5)          // rounds per session
  const [ballSize, setBallSize] = useState('Fixed')  // 'Fixed' or 'Random' per-round radius

  // ── Per-round UI state (trigger re-renders for the header / overlay) ──────
  const [currentRound, setCurrentRound] = useState(1)
  const [selected, setSelected] = useState(new Set())  // ball IDs the user has tapped
  const [score, setScore] = useState(null)             // result object for RESULT phase
  const [sessionPoints, setSessionPoints] = useState(0) // accumulated internal pts this session
  const [panelOpen, setPanelOpen] = useState(false)    // left settings pane toggle

  // ── Refs used by the animation loop ──────────────────────────────────────
  // The rAF tick closure reads these instead of React state to avoid stale closures.
  // Every ref mirrors a piece of state that the loop needs to read each frame.
  const canvasRef = useRef(null)
  const ballsRef = useRef([])
  const phaseRef = useRef(PHASES.IDLE)
  const startTimeRef = useRef(null)
  const moveDurationRef = useRef(10000)
  const selectedRef = useRef(new Set())
  const scoreRef = useRef(null)
  const targetCountRef = useRef(4)
  const currentRoundRef = useRef(1)
  const repeatsRef = useRef(5)
  const sessionPointsRef = useRef(0)

  // Syncs both the ref (read by rAF) and the state (triggers re-render for the UI)
  const updateSelected = useCallback((newSet) => {
    selectedRef.current = newSet
    setSelected(new Set(newSet))
  }, [])

  // Always update the ref before calling setPhase so the rAF tick sees the new
  // phase immediately on the same frame, not one render cycle later.
  const transitionTo = useCallback((newPhase) => {
    phaseRef.current = newPhase
    startTimeRef.current = performance.now()  // reset the phase timer
    setPhase(newPhase)
  }, [])

  // Randomly assigns numbers 1–N to the balls just before the STOP phase.
  // Numbers are stored on the ball objects in the ref, not in state, so the
  // canvas can draw them without triggering a React re-render.
  const assignNumbers = useCallback(() => {
    const count = ballsRef.current.length
    const nums = shuffle(Array.from({ length: count }, (_, i) => i + 1))
    ballsRef.current.forEach((ball, i) => { ball.number = nums[i] })
  }, [])

  const { start: startLoop, stop: stopLoop } = useGameLoop({
    canvasRef,
    ballsRef,
    phaseRef,
    startTimeRef,
    moveDurationRef,
    selectedRef,
    scoreRef,
    transitionTo,
    onAssignNumbers: assignNumbers,
  })

  // Initialises and starts a single round. Called both from handleStart (round 1)
  // and handleNext (subsequent rounds) so all reset logic lives in one place.
  const startRound = useCallback((round) => {
    const canvas = canvasRef.current
    const W = canvas ? canvas.width : window.innerWidth
    const H = canvas ? canvas.height : window.innerHeight
    const { min, max } = speedLevelToRange(speed)
    const radius = pickRoundRadius(ballSize)

    currentRoundRef.current = round
    setCurrentRound(round)
    targetCountRef.current = targetCount

    // Spawn fresh balls with random positions, velocities, and target assignments
    ballsRef.current = initBalls(W, H, {
      ballCount,
      targetCount,
      speedMin: min,
      speedMax: max,
      radius,
    })

    // Clear any selection and score left over from the previous round
    selectedRef.current = new Set()
    scoreRef.current = null
    setSelected(new Set())
    setScore(null)

    moveDurationRef.current = duration * 1000
    startTimeRef.current = performance.now()
    startLoop()
    transitionTo(PHASES.APPEAR)
  }, [duration, speed, ballCount, targetCount, ballSize, startLoop, transitionTo])

  // Kicks off a new session: resets session score and starts round 1
  const handleStart = useCallback(() => {
    repeatsRef.current = repeats
    sessionPointsRef.current = 0
    setSessionPoints(0)
    startRound(1)
  }, [repeats, startRound])

  // Evaluates the user's selection and computes scores, then transitions to RESULT.
  // Scoring: all correct = 3 internal pts, 1 miss = 1 pt, 2+ misses = 0 pt.
  // displayScore scales the accumulated internal pts so a perfect session = 100.
  const handleSubmit = useCallback(() => {
    const sel = selectedRef.current
    const balls = ballsRef.current
    const tc = targetCountRef.current
    const targetIds = new Set(balls.filter(b => b.isTarget).map(b => b.id))
    const correct = [...sel].filter(id => targetIds.has(id)).length

    const misses = tc - correct
    const roundInternalPts = misses === 0 ? 3 : misses === 1 ? 1 : 0
    const newSessionPts = sessionPointsRef.current + roundInternalPts
    sessionPointsRef.current = newSessionPts
    setSessionPoints(newSessionPts)

    // Multiplier maps internal pts to the 0–100 display scale
    const totalRounds = repeatsRef.current
    const multiplier = 100 / (totalRounds * 3)

    const result = {
      correct,
      total: tc,
      round: currentRoundRef.current,
      totalRounds,
      roundInternalPts,
      sessionPoints: newSessionPts,
      displayScore: Math.round(newSessionPts * multiplier),
      maxDisplayScore: 100,
      // Per-ball breakdown used by drawing.js to colour each ball in RESULT phase
      perBall: balls.map(ball => ({
        id: ball.id,
        number: ball.number,
        isTarget: ball.isTarget,
        wasSelected: sel.has(ball.id),
        status:
          ball.isTarget && sel.has(ball.id) ? 'hit'
          : ball.isTarget && !sel.has(ball.id) ? 'missed'
          : !ball.isTarget && sel.has(ball.id) ? 'wrong'
          : 'ok',
      })),
    }

    scoreRef.current = result
    setScore(result)
    stopLoop()
    transitionTo(PHASES.RESULT)
  }, [transitionTo, stopLoop])

  // Advances to the next round without resetting session points
  const handleNext = useCallback(() => {
    const nextRound = currentRoundRef.current + 1
    startRound(nextRound)
  }, [startRound])

  // Ends the session early or after the final round — returns to IDLE and clears canvas
  const handleFinish = useCallback(() => {
    stopLoop()
    ballsRef.current = []
    selectedRef.current = new Set()
    scoreRef.current = null
    setSelected(new Set())
    setScore(null)
    currentRoundRef.current = 1
    setCurrentRound(1)
    sessionPointsRef.current = 0
    setSessionPoints(0)
    phaseRef.current = PHASES.IDLE
    setPhase(PHASES.IDLE)

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [stopLoop])

  // Handles ball selection taps during SELECT phase.
  // scaleX/scaleY convert CSS pixel coordinates to canvas pixel coordinates,
  // which differ when the canvas is displayed at a size other than its attribute dimensions.
  const handleCanvasClick = useCallback((e) => {
    if (phaseRef.current !== PHASES.SELECT) return

    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    const tc = targetCountRef.current
    for (const ball of ballsRef.current) {
      const dx = mx - ball.x
      const dy = my - ball.y
      // Use squared distance to avoid a sqrt — faster and sufficient for hit testing
      if (dx * dx + dy * dy <= ball.radius * ball.radius) {
        const next = new Set(selectedRef.current)
        if (next.has(ball.id)) {
          next.delete(ball.id)           // tapping again deselects
        } else if (next.size < tc) {
          next.add(ball.id)              // only allow up to targetCount selections
        }
        updateSelected(next)
        break  // only the topmost ball wins the click
      }
    }
  }, [updateSelected])

  // True when the current result is from the last round of the session
  const isLastRound = score && score.round >= score.totalRounds

  return (
    <div className="app">
      <header className="app-header">
        <button
          className="hamburger"
          onClick={() => setPanelOpen(open => !open)}
          aria-label="Toggle settings"
        >☰</button>
        <h1 className="app-title">Vision Training App</h1>

        {/* Show round progress and running score while a session is active.
            pts formula: sessionPoints × (100 / repeats×3) — same as displayScore. */}
        {phase !== PHASES.IDLE && (
          <span className="round-indicator">
            {repeatsRef.current > 1 && <span>Round {currentRound}/{repeatsRef.current}</span>}<span>{Math.round(sessionPoints * (100 / (repeatsRef.current * 3)))} pts</span>
          </span>
        )}
      </header>

      <main className="game-area">
        <div className="canvas-wrapper">
          <Canvas canvasRef={canvasRef} onCanvasClick={handleCanvasClick} />
        </div>

        {phase === PHASES.RESULT && (
          <ResultsOverlay score={score} />
        )}

        <GameControls
          phase={phase}
          targetCount={targetCount}
          selectedCount={selected.size}
          onStart={handleStart}
          onSubmit={handleSubmit}
          onNext={handleNext}
          onFinish={handleFinish}
          isLastRound={isLastRound}
        />

        <SidePanel
          isOpen={panelOpen}
          onClose={() => setPanelOpen(false)}
          duration={duration}
          speed={speed}
          ballCount={ballCount}
          targetCount={targetCount}
          repeats={repeats}
          ballSize={ballSize}
          onDurationChange={setDuration}
          onSpeedChange={setSpeed}
          onBallCountChange={setBallCount}
          onTargetCountChange={setTargetCount}
          onRepeatsChange={setRepeats}
          onBallSizeChange={setBallSize}
        />
      </main>
    </div>
  )
}
