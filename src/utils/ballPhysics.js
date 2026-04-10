import { BALL } from '../constants/game.js'
import { shuffle } from './shuffle.js'

export function initBalls(W, H, { ballCount, targetCount, speedMin, speedMax }) {
  const R = BALL.RADIUS
  const margin = R + 8
  const minDist = R * 2 + 10

  const ids = Array.from({ length: ballCount }, (_, i) => i)
  const targetIds = new Set(shuffle(ids).slice(0, targetCount))

  const placed = []

  for (const i of ids) {
    let x, y, attempts = 0
    do {
      x = margin + Math.random() * (W - margin * 2)
      y = margin + Math.random() * (H - margin * 2)
      attempts++
    } while (
      attempts < 100 &&
      placed.some(p => Math.hypot(x - p.x, y - p.y) < minDist)
    )

    const angle = Math.random() * Math.PI * 2
    const speed = speedMin + Math.random() * (speedMax - speedMin)

    placed.push({
      id: i,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      isTarget: targetIds.has(i),
      number: null,
      opacity: 0,
    })
  }

  return placed
}

export function applyWallBounce(ball, W, H) {
  const R = BALL.RADIUS
  if (ball.x - R < 0)  { ball.x = R;     ball.vx =  Math.abs(ball.vx) }
  if (ball.x + R > W)  { ball.x = W - R; ball.vx = -Math.abs(ball.vx) }
  if (ball.y - R < 0)  { ball.y = R;     ball.vy =  Math.abs(ball.vy) }
  if (ball.y + R > H)  { ball.y = H - R; ball.vy = -Math.abs(ball.vy) }
}

export function resolveCollisions(balls) {
  const R = BALL.RADIUS
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i]
      const b = balls[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const distSq = dx * dx + dy * dy
      const minDist = R * 2
      if (distSq >= minDist * minDist || distSq === 0) continue

      const dist = Math.sqrt(distSq)
      const nx = dx / dist
      const ny = dy / dist

      const dvn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
      if (dvn > 0) continue

      a.vx += dvn * nx; a.vy += dvn * ny
      b.vx -= dvn * nx; b.vy -= dvn * ny

      const overlap = (minDist - dist) / 2
      a.x -= overlap * nx; a.y -= overlap * ny
      b.x += overlap * nx; b.y += overlap * ny
    }
  }
}

export function stepBalls(balls, dt, W, H) {
  for (const ball of balls) {
    ball.x += ball.vx * dt
    ball.y += ball.vy * dt
    applyWallBounce(ball, W, H)
  }
  resolveCollisions(balls)
}
