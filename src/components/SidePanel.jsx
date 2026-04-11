// SidePanel is a slide-in overlay from the left containing all game settings.
// Toggled open via the hamburger button in App.jsx.
import { BALL_COUNT_OPTIONS, TARGET_COUNT_OPTIONS, BALL_SIZE_OPTIONS } from '../constants/game.js'

export default function SidePanel({
  isOpen, onClose,
  duration, speed, ballCount, targetCount, repeats, ballSize,
  onDurationChange, onSpeedChange, onBallCountChange, onTargetCountChange, onRepeatsChange, onBallSizeChange,
}) {
  if (!isOpen) return null

  return (
    <>
      <div className="side-panel-backdrop" onClick={onClose} />
      <aside className="side-panel">
        <h2 className="side-panel-title">Settings</h2>

        <div className="side-panel-content">
          {/* Duration */}
          <div className="setting-row">
            <label className="setting-label">Duration: <strong>{duration}s</strong></label>
            <input
              type="range" min={5} max={15} step={1} value={duration}
              onChange={e => onDurationChange(Number(e.target.value))}
              className="setting-slider"
            />
            <div className="slider-endpoints"><span>5s</span><span>15s</span></div>
          </div>

          {/* Speed */}
          <div className="setting-row">
            <label className="setting-label">Speed: <strong>{speed} / 20</strong></label>
            <input
              type="range" min={1} max={20} step={1} value={speed}
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
                <button key={n} className={`btn-option ${ballCount === n ? 'active' : ''}`}
                  onClick={() => onBallCountChange(n)}>{n}</button>
              ))}
            </div>
          </div>

          {/* Target count */}
          <div className="setting-row">
            <label className="setting-label">Track</label>
            <div className="btn-group">
              {TARGET_COUNT_OPTIONS.map(n => (
                <button key={n} className={`btn-option ${targetCount === n ? 'active' : ''}`}
                  onClick={() => onTargetCountChange(n)}>{n}</button>
              ))}
            </div>
          </div>

          {/* Ball size — Fixed uses constant radius, Random varies 50%-100% per round */}
          <div className="setting-row">
            <label className="setting-label">Ball Size</label>
            <div className="btn-group">
              {BALL_SIZE_OPTIONS.map(opt => (
                <button key={opt} className={`btn-option ${ballSize === opt ? 'active' : ''}`}
                  onClick={() => onBallSizeChange(opt)}>{opt}</button>
              ))}
            </div>
          </div>

          {/* Repeat */}
          <div className="setting-row">
            <label className="setting-label">Repeat: <strong>{repeats}x</strong></label>
            <input
              type="range" min={1} max={20} step={1} value={repeats}
              onChange={e => onRepeatsChange(Number(e.target.value))}
              className="setting-slider"
            />
            <div className="slider-endpoints"><span>1</span><span>20</span></div>
          </div>
        </div>
      </aside>
    </>
  )
}
