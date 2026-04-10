// Game phase identifiers — the app moves through these in order each round:
// IDLE → APPEAR → SHINE → MOVE → STOP → SELECT → RESULT
export const PHASES = {
  IDLE:   'IDLE',    // waiting on the start screen
  APPEAR: 'APPEAR',  // balls fade in
  SHINE:  'SHINE',   // target balls glow so the user memorises them
  MOVE:   'MOVE',    // all balls move around — user must track mentally
  STOP:   'STOP',    // movement freezes and numbers fade in
  SELECT: 'SELECT',  // user taps the balls they think were targets
  RESULT: 'RESULT',  // feedback shown (green = correct, red = wrong)
}

// How long each automatic phase lasts in milliseconds
export const TIMING = {
  APPEAR_MS: 600,   // ball fade-in animation
  SHINE_MS:  1500,  // how long the gold glow is shown
  STOP_MS:   400,   // brief pause while numbers fade in before SELECT
}

export const BALL = {
  RADIUS: 32,  // px, used for drawing, collision detection, and click hit-testing
}

// Maps a speed level (1–20) to a [min, max] velocity range in px/s.
// Level 6 was calibrated to feel like the original "medium" default.
// Each level adds 60 px/s, so level 20 reaches ~1400 px/s.
export function speedLevelToRange(level) {
  const min = 240 + (level - 1) * 60
  const max = min + 80  // 80 px/s spread gives variety within a level
  return { min, max }
}

// Ball count options shown in the UI (total balls on screen)
export const BALL_COUNT_OPTIONS = [8, 10, 12]

// Target count options (how many balls the user must track and identify)
export const TARGET_COUNT_OPTIONS = [4, 5, 6]
