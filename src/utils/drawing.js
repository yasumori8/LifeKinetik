import { PHASES, BALL, TIMING } from '../constants/game.js'

function drawBall(ctx, ball, options = {}) {
  const { glowColor, glowBlur, ringColor, ringWidth, alpha = 1, labelAlpha = 0 } = options

  ctx.save()
  ctx.globalAlpha = alpha

  if (glowColor && glowBlur > 0) {
    ctx.shadowBlur = glowBlur
    ctx.shadowColor = glowColor
  }

  const grad = ctx.createRadialGradient(
    ball.x - BALL.RADIUS * 0.3,
    ball.y - BALL.RADIUS * 0.3,
    BALL.RADIUS * 0.1,
    ball.x,
    ball.y,
    BALL.RADIUS,
  )
  grad.addColorStop(0, '#7ea8d8')
  grad.addColorStop(1, '#3a6ea8')

  ctx.beginPath()
  ctx.arc(ball.x, ball.y, BALL.RADIUS, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'

  if (ringColor && ringWidth > 0) {
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, BALL.RADIUS + ringWidth / 2 + 2, 0, Math.PI * 2)
    ctx.strokeStyle = ringColor
    ctx.lineWidth = ringWidth
    ctx.stroke()
  }

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

export function drawFrame(ctx, balls, phase, elapsed, selected, score, W, H) {
  ctx.clearRect(0, 0, W, H)

  for (const ball of balls) {
    if (phase === PHASES.APPEAR) {
      const alpha = Math.min(1, elapsed / TIMING.APPEAR_MS)
      drawBall(ctx, ball, { alpha })

    } else if (phase === PHASES.SHINE) {
      if (ball.isTarget) {
        const pulse = 0.6 + 0.4 * Math.sin(elapsed / 150)
        drawBall(ctx, ball, { glowColor: '#FFD700', glowBlur: 30 * pulse, alpha: 1 })
      } else {
        drawBall(ctx, ball, { alpha: 0.45 })
      }

    } else if (phase === PHASES.MOVE) {
      drawBall(ctx, ball, { alpha: 1 })

    } else if (phase === PHASES.STOP) {
      const labelAlpha = Math.min(1, elapsed / TIMING.STOP_MS)
      drawBall(ctx, ball, { alpha: 1, labelAlpha })

    } else if (phase === PHASES.SELECT) {
      const isSelected = selected.has(ball.id)
      drawBall(ctx, ball, {
        alpha: 1,
        labelAlpha: 1,
        ringColor: isSelected ? '#00BFFF' : null,
        ringWidth: isSelected ? 5 : 0,
      })

    } else if (phase === PHASES.RESULT) {
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

function getBallResultStyle(ball, score) {
  if (!score) return {}
  const entry = score.perBall.find(p => p.id === ball.id)
  if (!entry) return {}
  switch (entry.status) {
    case 'hit':    return { glowColor: '#00E676', glowBlur: 28, ringColor: '#00E676' }
    case 'missed': return { glowColor: '#FFD700', glowBlur: 28, ringColor: '#FFD700' }
    case 'wrong':  return { ringColor: '#FF1744' }
    default:       return {}
  }
}
