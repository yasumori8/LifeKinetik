import { PHASES, BALL_COUNT_OPTIONS, TARGET_COUNT_OPTIONS } from '../constants/game.js'

export default function GameControls({
  phase, duration, speed, ballCount, targetCount, selectedCount,
  onDurationChange, onSpeedChange, onBallCountChange, onTargetCountChange,
  onStart, onSubmit, onPlayAgain,
}) {
  const showSettings = phase === PHASES.IDLE || phase === PHASES.RESULT

  return (
    <div className="controls">
      {showSettings && (
        <div className="settings-grid">
          {/* Duration */}
          <div className="setting-row">
            <label className="setting-label">
              Duration: <strong>{duration}s</strong>
            </label>
            <input
              type="range" min={5} max={15} step={1} value={duration}
              onChange={e => onDurationChange(Number(e.target.value))}
              className="setting-slider"
            />
            <div className="slider-endpoints"><span>5s</span><span>15s</span></div>
          </div>

          {/* Speed */}
          <div className="setting-row">
            <label className="setting-label">
              Speed: <strong>{speed} / 10</strong>
            </label>
            <input
              type="range" min={1} max={10} step={1} value={speed}
              onChange={e => onSpeedChange(Number(e.target.value))}
              className="setting-slider"
            />
            <div className="slider-endpoints"><span>Slow</span><span>Fast</span></div>
          </div>

          {/* Ball count */}
          <div className="setting-row">
            <label className="setting-label">Balls</label>
            <div className="btn-group">
              {BALL_COUNT_OPTIONS.map(n => (
                <button
                  key={n}
                  className={`btn-option ${ballCount === n ? 'active' : ''}`}
                  onClick={() => onBallCountChange(n)}
                >{n}</button>
              ))}
            </div>
          </div>

          {/* Target count */}
          <div className="setting-row">
            <label className="setting-label">Track</label>
            <div className="btn-group">
              {TARGET_COUNT_OPTIONS.map(n => (
                <button
                  key={n}
                  className={`btn-option ${targetCount === n ? 'active' : ''}`}
                  onClick={() => onTargetCountChange(n)}
                >{n}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {phase === PHASES.IDLE && (
        <button className="btn btn-start" onClick={onStart}>Start</button>
      )}

      {phase === PHASES.SELECT && (
        <div className="select-row">
          <span className="select-hint">{selectedCount} / {targetCount} selected</span>
          <button
            className="btn btn-submit"
            onClick={onSubmit}
            disabled={selectedCount !== targetCount}
          >Submit</button>
        </div>
      )}

      {phase === PHASES.RESULT && (
        <button className="btn btn-start" onClick={onPlayAgain}>Play Again</button>
      )}
    </div>
  )
}
