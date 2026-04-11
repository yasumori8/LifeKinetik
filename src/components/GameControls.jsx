// GameControls renders the bottom action bar: Start (IDLE), Submit (SELECT),
// and Next / End / Finish (RESULT). Settings have been moved to SidePanel.
import { PHASES } from '../constants/game.js'

export default function GameControls({
  phase, targetCount, selectedCount,
  onStart, onSubmit, onNext, onFinish, isLastRound,
}) {
  return (
    <div className="controls">
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
