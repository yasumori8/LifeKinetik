// Training mode runs a fixed 12-round session structured in 3 blocks of 4 rounds.
// Each block increases speed by 1 from the base level.
//
// Block pattern (repeats 3 times with speed Level, Level+1, Level+2):
//   Round 1–2 of block: Fixed ball size, 8s duration  (warm-up)
//   Round 3 of block:   Random ball size, 8s duration  (visual challenge)
//   Round 4 of block:   Random ball size, 10s duration  (endurance challenge)
//
// Balls are always 8, target count always 4.

// Per-round config within a single 4-round block.
// Index = (round - 1) % 4 → which slot in the block pattern.
const BLOCK_PATTERN = [
  { ballSize: 'Fixed',  duration: 8  },   // round 1 of block
  { ballSize: 'Fixed',  duration: 8  },   // round 2 of block
  { ballSize: 'Random', duration: 8  },   // round 3 of block
  { ballSize: 'Random', duration: 10 },   // round 4 of block
]

// Total rounds in a Training session
export const TRAINING_ROUNDS = 12

// Returns the configuration for a specific round in Training mode.
// `level` is 1–18 (user-selected), `round` is 1–12.
export function getTrainingRoundConfig(level, round) {
  // Which 4-round block are we in? (0, 1, or 2)
  const block = Math.floor((round - 1) / 4)

  // Speed increases by 1 per block, clamped to the max of 20
  const speed = Math.min(level + block, 20)

  // Look up the block-internal pattern for ball size and duration
  const slot = (round - 1) % 4
  const { ballSize, duration } = BLOCK_PATTERN[slot]

  return {
    speed,
    duration,
    ballSize,
    ballCount: 8,
    targetCount: 4,
  }
}
