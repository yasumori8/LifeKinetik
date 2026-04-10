import { useState, useRef, useCallback } from 'react'
import { PHASES, BALL, speedLevelToRange } from './constants/game.js'
import { initBalls } from './utils/ballPhysics.js'
import { shuffle } from './utils/shuffle.js'
import { useGameLoop } from './hooks/useGameLoop.js'
import Canvas from './components/Canvas.jsx'
import GameControls from './components/GameControls.jsx'
import PhaseMessage from './components/PhaseMessage.jsx'
import ResultsOverlay from './components/ResultsOverlay.jsx'
import './App.css'

export default function App() {
  const [phase, setPhase] = useState(PHASES.IDLE)
  const [duration, setDuration] = useState(10)   // seconds, 5–15
  const [speed, setSpeed] = useState(5)           // level 1–10
  const [ballCount, setBallCount] = useState(8)
  const [targetCount, setTargetCount] = useState(4)
  const [selected, setSelected] = useState(new Set())
  const [score, setScore] = useState(null)

  // Refs for animation loop
  const canvasRef = useRef(null)
  const ballsRef = useRef([])
  const phaseRef = useRef(PHASES.IDLE)
  const startTimeRef = useRef(null)
  const moveDurationRef = useRef(10000)
  const selectedRef = useRef(new Set())
  const scoreRef = useRef(null)
  const targetCountRef = useRef(4)

  const updateSelected = useCallback((newSet) => {
    selectedRef.current = newSet
    setSelected(new Set(newSet))
  }, [])

  const transitionTo = useCallback((newPhase) => {
    phaseRef.current = newPhase
    startTimeRef.current = performance.now()
    setPhase(newPhase)
  }, [])

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

  const handleStart = useCallback(() => {
    const canvas = canvasRef.current
    const W = canvas ? canvas.width : window.innerWidth
    const H = canvas ? canvas.height : window.innerHeight
    const { min, max } = speedLevelToRange(speed)

    targetCountRef.current = targetCount
    ballsRef.current = initBalls(W, H, {
      ballCount,
      targetCount,
      speedMin: min,
      speedMax: max,
    })
    selectedRef.current = new Set()
    scoreRef.current = null
    setSelected(new Set())
    setScore(null)
    moveDurationRef.current = duration * 1000
    startTimeRef.current = performance.now()
    startLoop()
    transitionTo(PHASES.APPEAR)
  }, [duration, speed, ballCount, targetCount, startLoop, transitionTo])

  const handleSubmit = useCallback(() => {
    const sel = selectedRef.current
    const balls = ballsRef.current
    const tc = targetCountRef.current
    const targetIds = new Set(balls.filter(b => b.isTarget).map(b => b.id))
    const correct = [...sel].filter(id => targetIds.has(id)).length

    const result = {
      correct,
      total: tc,
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
    transitionTo(PHASES.RESULT)
  }, [transitionTo])

  const handlePlayAgain = useCallback(() => {
    stopLoop()
    ballsRef.current = []
    selectedRef.current = new Set()
    scoreRef.current = null
    setSelected(new Set())
    setScore(null)
    phaseRef.current = PHASES.IDLE
    setPhase(PHASES.IDLE)

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [stopLoop])

  const handleCanvasClick = useCallback((e) => {
    if (phaseRef.current !== PHASES.SELECT) return

    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    const R = BALL.RADIUS
    const tc = targetCountRef.current
    for (const ball of ballsRef.current) {
      const dx = mx - ball.x
      const dy = my - ball.y
      if (dx * dx + dy * dy <= R * R) {
        const next = new Set(selectedRef.current)
        if (next.has(ball.id)) {
          next.delete(ball.id)
        } else if (next.size < tc) {
          next.add(ball.id)
        }
        updateSelected(next)
        break
      }
    }
  }, [updateSelected])

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Life Kinetik</h1>
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
          duration={duration}
          speed={speed}
          ballCount={ballCount}
          targetCount={targetCount}
          selectedCount={selected.size}
          onDurationChange={setDuration}
          onSpeedChange={setSpeed}
          onBallCountChange={setBallCount}
          onTargetCountChange={setTargetCount}
          onStart={handleStart}
          onSubmit={handleSubmit}
          onPlayAgain={handlePlayAgain}
        />
      </main>
    </div>
  )
}
