// SidePanel is a slide-in overlay from the left containing game settings.
// It has two tabs:
//   - "Training": structured 12-round session with a single Level slider (1–18)
//   - "Custom": freeform settings for duration, speed, balls, track, ball size, repeat
// Toggled open via the hamburger button in App.jsx.
import { BALL_COUNT_OPTIONS, TARGET_COUNT_OPTIONS, BALL_SIZE_OPTIONS } from '../constants/game.js'

export default function SidePanel({
  isOpen, onClose,
  mode, onModeChange,
  trainingLevel, onTrainingLevelChange,
  duration, speed, ballCount, targetCount, repeats, ballSize,
  onDurationChange, onSpeedChange, onBallCountChange, onTargetCountChange, onRepeatsChange, onBallSizeChange,
}) {
  if (!isOpen) return null

  return (
    <>
      <div className="side-panel-backdrop" onClick={onClose} />
      <aside className="side-panel">
        {/* Tab switcher: Training vs Custom */}
        <div className="side-panel-tabs">
          <button
            className={`tab-btn ${mode === 'Training' ? 'active' : ''}`}
            onClick={() => onModeChange('Training')}
          >Training</button>
          <button
            className={`tab-btn ${mode === 'Custom' ? 'active' : ''}`}
            onClick={() => onModeChange('Custom')}
          >Custom</button>
        </div>

        <div className="side-panel-content">
          {mode === 'Training' ? (
            /* ── Training tab: structured session with a single Level slider ── */
            <>
              <p className="side-panel-desc">
                Standard 12-round training. Speed increases every 4 rounds.
              </p>

              <div className="setting-row">
                <label className="setting-label">Level: <strong>{trainingLevel}</strong></label>
                <input
                  type="range" min={1} max={18} step={1} value={trainingLevel}
                  onChange={e => onTrainingLevelChange(Number(e.target.value))}
                  className="setting-slider"
                />
                <div className="slider-endpoints"><span>1</span><span>18</span></div>
              </div>
            </>
          ) : (
            /* ── Custom tab: freeform per-setting configuration ──────────── */
            <>
              {/* Duration: how long balls move before stopping */}
              <div className="setting-row">
                <label className="setting-label">Duration: <strong>{duration}s</strong></label>
                <input
                  type="range" min={5} max={15} step={1} value={duration}
                  onChange={e => onDurationChange(Number(e.target.value))}
                  className="setting-slider"
                />
                <div className="slider-endpoints"><span>5s</span><span>15s</span></div>
              </div>

              {/* Speed: ball movement speed level */}
              <div className="setting-row">
                <label className="setting-label">Speed: <strong>{speed} / 20</strong></label>
                <input
                  type="range" min={1} max={20} step={1} value={speed}
                  onChange={e => onSpeedChange(Number(e.target.value))}
                  className="setting-slider"
                />
                <div className="slider-endpoints"><span>Slow</span><span>Fast</span></div>
              </div>

              {/* Ball count: total number of balls on screen */}
              <div className="setting-row">
                <label className="setting-label">Balls</label>
                <div className="btn-group">
                  {BALL_COUNT_OPTIONS.map(n => (
                    <button key={n} className={`btn-option ${ballCount === n ? 'active' : ''}`}
                      onClick={() => onBallCountChange(n)}>{n}</button>
                  ))}
                </div>
              </div>

              {/* Target count: how many balls the user must track */}
              <div className="setting-row">
                <label className="setting-label">Track</label>
                <div className="btn-group">
                  {TARGET_COUNT_OPTIONS.map(n => (
                    <button key={n} className={`btn-option ${targetCount === n ? 'active' : ''}`}
                      onClick={() => onTargetCountChange(n)}>{n}</button>
                  ))}
                </div>
              </div>

              {/* Ball size: Fixed (constant) or Random (varies 70–100% per round) */}
              <div className="setting-row">
                <label className="setting-label">Ball Size</label>
                <div className="btn-group">
                  {BALL_SIZE_OPTIONS.map(opt => (
                    <button key={opt} className={`btn-option ${ballSize === opt ? 'active' : ''}`}
                      onClick={() => onBallSizeChange(opt)}>{opt}</button>
                  ))}
                </div>
              </div>

              {/* Repeat: how many rounds per session */}
              <div className="setting-row">
                <label className="setting-label">Repeat: <strong>{repeats}x</strong></label>
                <input
                  type="range" min={1} max={20} step={1} value={repeats}
                  onChange={e => onRepeatsChange(Number(e.target.value))}
                  className="setting-slider"
                />
                <div className="slider-endpoints"><span>1</span><span>20</span></div>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
