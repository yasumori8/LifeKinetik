import { shuffle } from './shuffle.js'

// Creates the initial array of ball objects with random positions and velocities.
// Uses rejection sampling to ensure no two balls overlap at spawn.
// `radius` is shared by all balls in a single round (pre-computed in App.jsx).
export function initBalls(W, H, { ballCount, targetCount, speedMin, speedMax, radius }) {
  const R = radius
  const margin = R + 8           // keep balls fully within canvas edges
  const minDist = R * 2 + 10    // minimum centre-to-centre distance between balls

  const ids = Array.from({ length: ballCount }, (_, i) => i)

  // Randomly pick which ball IDs will be the "target" balls the user must track
  const targetIds = new Set(shuffle(ids).slice(0, targetCount))

  const placed = []

  for (const i of ids) {
    let x, y, attempts = 0

    // Try up to 100 random positions; accept the first that doesn't overlap an existing ball.
    // After 100 attempts we place anyway to avoid an infinite loop on very crowded canvases.
    do {
      x = margin + Math.random() * (W - margin * 2)
      y = margin + Math.random() * (H - margin * 2)
      attempts++
    } while (
      attempts < 100 &&
      placed.some(p => Math.hypot(x - p.x, y - p.y) < minDist)
    )

    // Random direction and speed within the configured range
    const angle = Math.random() * Math.PI * 2
    const speed = speedMin + Math.random() * (speedMax - speedMin)

    placed.push({
      id: i,
      x,
      y,
      radius: R,                    // per-ball so physics/drawing/click can read uniformly
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      isTarget: targetIds.has(i),  // remembered throughout the round; never changes
      number: null,                 // assigned via Fisher-Yates shuffle when MOVE ends
      opacity: 0,                   // starts at 0 and fades to 1 during APPEAR phase
    })
  }

  return placed
}

// Reflects a ball's velocity when it hits any canvas edge and clamps its position
// so it never escapes the boundary even at high speeds.
export function applyWallBounce(ball, W, H) {
  const R = ball.radius
  if (ball.x - R < 0)  { ball.x = R;     ball.vx =  Math.abs(ball.vx) }
  if (ball.x + R > W)  { ball.x = W - R; ball.vx = -Math.abs(ball.vx) }
  if (ball.y - R < 0)  { ball.y = R;     ball.vy =  Math.abs(ball.vy) }
  if (ball.y + R > H)  { ball.y = H - R; ball.vy = -Math.abs(ball.vy) }
}

// Detects and resolves ball-to-ball collisions using elastic physics (equal mass).
// O(n²) over all pairs — acceptable because n ≤ 12.
// minDist uses the sum of the two balls' radii so this still works if sizes differ.
export function resolveCollisions(balls) {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i]
      const b = balls[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const distSq = dx * dx + dy * dy
      const minDist = a.radius + b.radius
      if (distSq >= minDist * minDist || distSq === 0) continue

      const dist = Math.sqrt(distSq)
      // Collision normal: unit vector pointing from a → b
      const nx = dx / dist
      const ny = dy / dist

      // Relative velocity along the collision normal
      const dvn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
      // Skip if the balls are already moving apart
      if (dvn > 0) continue

      // Exchange velocity components along the normal (equal-mass elastic collision)
      a.vx += dvn * nx; a.vy += dvn * ny
      b.vx -= dvn * nx; b.vy -= dvn * ny

      // Push the balls apart so they no longer overlap
      const overlap = (minDist - dist) / 2
      a.x -= overlap * nx; a.y -= overlap * ny
      b.x += overlap * nx; b.y += overlap * ny
    }
  }
}

// Advances all ball positions by dt seconds, then enforces boundaries and collisions.
// Call order matters: move first, then bounce walls, then resolve ball-to-ball overlaps.
export function stepBalls(balls, dt, W, H) {
  for (const ball of balls) {
    ball.x += ball.vx * dt
    ball.y += ball.vy * dt
    applyWallBounce(ball, W, H)
  }
  resolveCollisions(balls)
}
