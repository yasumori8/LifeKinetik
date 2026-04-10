import { PHASES, BALL, TIMING } from '../constants/game.js'

// Draws a single ball onto the canvas with optional glow, selection ring, and number label.
function drawBall(ctx, ball, options = {}) {
  const { glowColor, glowBlur, ringColor, ringWidth, alpha = 1, labelAlpha = 0 } = options

  ctx.save()
  ctx.globalAlpha = alpha

  // Apply glow before drawing the ball fill — shadowBlur bleeds outward from the shape
  if (glowColor && glowBlur > 0) {
    ctx.shadowBlur = glowBlur
    ctx.shadowColor = glowColor
  }

  // Radial gradient gives the ball a subtle 3D highlight (light top-left, darker base)
  const grad = ctx.createRadialGradient(
    ball.x - BALL.RADIUS * 0.3,
    ball.y - BALL.RADIUS * 0.3,
    BALL.RADIUS * 0.1,
    ball.x,
    ball.y,
    BALL.RADIUS,
  )
  grad.addColorStop(0, '#7ea8d8')  // highlight colour
  grad.addColorStop(1, '#3a6ea8')  // base colour

  ctx.beginPath()
  ctx.arc(ball.x, ball.y, BALL.RADIUS, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  // Reset shadow so the ring and label don't inherit it
  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'

  // Selection / result ring drawn slightly outside the ball edge
  if (ringColor && ringWidth > 0) {
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, BALL.RADIUS + ringWidth / 2 + 2, 0, Math.PI * 2)
    ctx.strokeStyle = ringColor
    ctx.lineWidth = ringWidth
    ctx.stroke()
  }

  // Number label — only visible from the STOP phase onward; fades in via labelAlpha
  if (ball.number !== null && labelAlpha > 0) {
    ctx.globalAlpha = alpha * labelAlpha
    ctx.shadowBlur = 0
    ctx.font = `bold ${Math.floor(BALL.RADIUS * 0.85)}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#fff'
    ctx.fillText(String(ball.number), ball.x, ball.y)
  }

  ctx.restore()
}

// Main render function called every animation frame.
// Rendering behaviour differs per phase to guide the user through the exercise.
export function drawFrame(ctx, balls, phase, elapsed, selected, score, W, H) {
  ctx.clearRect(0, 0, W, H)

  for (const ball of balls) {

    if (phase === PHASES.APPEAR) {
      // Fade all balls in from transparent over APPEAR_MS milliseconds
      const alpha = Math.min(1, elapsed / TIMING.APPEAR_MS)
      drawBall(ctx, ball, { alpha })

    } else if (phase === PHASES.SHINE) {
      // Target balls pulse with a gold glow; non-targets are dimmed so targets pop
      if (ball.isTarget) {
        const pulse = 0.6 + 0.4 * Math.sin(elapsed / 150)  // oscillates between 0.2–1.0
        drawBall(ctx, ball, { glowColor: '#FFD700', glowBlur: 30 * pulse, alpha: 1 })
      } else {
        drawBall(ctx, ball, { alpha: 0.45 })
      }

    } else if (phase === PHASES.MOVE) {
      // All balls look identical — user must rely on memory alone
      drawBall(ctx, ball, { alpha: 1 })

    } else if (phase === PHASES.STOP) {
      // Numbers fade in over STOP_MS so the transition feels smooth
      const labelAlpha = Math.min(1, elapsed / TIMING.STOP_MS)
      drawBall(ctx, ball, { alpha: 1, labelAlpha })

    } else if (phase === PHASES.SELECT) {
      // Selected balls get a bright blue ring; all numbers stay visible
      const isSelected = selected.has(ball.id)
      drawBall(ctx, ball, {
        alpha: 1,
        labelAlpha: 1,
        ringColor: isSelected ? '#00BFFF' : null,
        ringWidth: isSelected ? 5 : 0,
      })

    } else if (phase === PHASES.RESULT) {
      // Show feedback colours based on whether the user's pick was correct or wrong
      const { ringColor, glowColor, glowBlur } = getBallResultStyle(ball, score)
      drawBall(ctx, ball, {
        alpha: 1,
        labelAlpha: 1,
        ringColor,
        ringWidth: ringColor ? 5 : 0,
        glowColor,
        glowBlur,
      })
    }
  }
}

// Returns glow/ring styling for a ball in the RESULT phase.
// 'hit' = user correctly identified a target (green)
// 'wrong' = user selected a non-target (red)
// Everything else (unselected non-target, missed target) gets no extra styling
function getBallResultStyle(ball, score) {
  if (!score) return {}
  const entry = score.perBall.find(p => p.id === ball.id)
  if (!entry) return {}
  switch (entry.status) {
    case 'hit':   return { glowColor: '#00E676', glowBlur: 28, ringColor: '#00E676' }
    case 'wrong': return { glowColor: '#FF1744', glowBlur: 28, ringColor: '#FF1744' }
    default:      return {}
  }
}
