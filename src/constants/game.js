export const PHASES = {
  IDLE: 'IDLE',
  APPEAR: 'APPEAR',
  SHINE: 'SHINE',
  MOVE: 'MOVE',
  STOP: 'STOP',
  SELECT: 'SELECT',
  RESULT: 'RESULT',
}

export const TIMING = {
  APPEAR_MS: 600,
  SHINE_MS: 1500,
  STOP_MS: 400,
}

export const BALL = {
  RADIUS: 32,
}

// Speed level 1-10 → px/s range
export function speedLevelToRange(level) {
  const min = 150 + (level - 1) * 60
  const max = min + 100
  return { min, max }
}

export const BALL_COUNT_OPTIONS = [8, 10, 12]
export const TARGET_COUNT_OPTIONS = [4, 5, 6]

