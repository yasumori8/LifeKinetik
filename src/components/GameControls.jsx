// GameControls renders the settings panel (IDLE), selection counter + Submit (SELECT),
// and Next / End / Finish buttons (RESULT). It is purely presentational — all state
// lives in App.jsx and is passed down as props.
import { PHASES, BALL_COUNT_OPTIONS, TARGET_COUNT_OPTIONS } from '../constants/game.js'

export default function GameControls({
  phase, duration, speed, ballCount, targetCount, repeats, selectedCount,
  onDurationChange, onSpeedChange, onBallCountChange, onTargetCountChange, onRepeatsChange,
  onStart, onSubmit, onNext, onFinish, isLastRound,
}) {
  // Settings are only editable before the session starts
  const showSettings = phase === PHASES.IDLE

  return (
    <div className="controls">
      {showSettings && (
        <div className="settings-grid">
          {/* How long balls move before stopping (5–15 seconds) */}
          <div className="setting-row">
            <label className="setting-label">Duration: <strong>{duration}s</strong></label>
            <input
              type="range" min={5} max={15} step={1} value={duration}
              onChange={e => onDurationChange(Number(e.target.value))}
              className="setting-slider"
            />
            <div className="slider-endpoints"><span>5s</span><span>15s</span></div>
          </div>

          {/* Ball movement speed (1–20, mapped to px/s via speedLevelToRange) */}
          <div className="setting-row">
            <label className="setting-label">Speed: <strong>{speed} / 20</strong></label>
            <input
              type="range" min={1} max={20} step={1} value={speed}
              onChange={e => onSpeedChange(Number(e.target.value))}
              className="setting-slider"
            />
            <div className="slider-endpoints"><span>Slow</span><span>Fast</span></div>
          </div>

          {/* Total number of balls spawned on the canvas */}
          <div className="setting-row">
            <label className="setting-label">Balls</label>
            <div className="btn-group">
              {BALL_COUNT_OPTIONS.map(n => (
                <button key={n} className={`btn-option ${ballCount === n ? 'active' : ''}`}
                  onClick={() => onBallCountChange(n)}>{n}</button>
              ))}
            </div>
          </div>

          {/* How many of those balls the user needs to track and identify */}
          <div className="setting-row">
            <label className="setting-label">Track</label>
            <div className="btn-group">
              {TARGET_COUNT_OPTIONS.map(n => (
                <button key={n} className={`btn-option ${targetCount === n ? 'active' : ''}`}
                  onClick={() => onTargetCountChange(n)}>{n}</button>
              ))}
            </div>
          </div>

          {/* How many rounds to play in sequence before returning to IDLE */}
          <div className="setting-row setting-row-wide">
            <label className="setting-label">Repeat: <strong>{repeats}x</strong></label>
            <input
              type="range" min={1} max={20} step={1} value={repeats}
              onChange={e => onRepeatsChange(Number(e.target.value))}
              className="setting-slider"
            />
            <div className="slider-endpoints"><span>1</span><span>20</span></div>
          </div>
        </div>
      )}

      {phase === PHASES.IDLE && (
        <button className="btn btn-start" onClick={onStart}>Start</button>
      )}

      {phase === PHASES.SELECT && (
        <div className="select-row">
          <span className="select-hint">{selectedCount} / {targetCount} selected</span>
          {/* Submit stays disabled until exactly targetCount balls are chosen */}
          <button className="btn btn-submit" onClick={onSubmit}
            disabled={selectedCount !== targetCount}>Submit</button>
        </div>
      )}

      {phase === PHASES.RESULT && (
        <div className="select-row">
          {/* Next is hidden on the final round — only Finish is shown */}
          {!isLastRound && (
            <button className="btn btn-start" onClick={onNext}>Next</button>
          )}
          <button className="btn btn-finish" onClick={onFinish}>
            {isLastRound ? 'Finish' : 'End'}
          </button>
        </div>
      )}
    </div>
  )
}
