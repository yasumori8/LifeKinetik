const STATUS_ICON = {
  hit: '✓',
  missed: '●',
  wrong: '✗',
  ok: '',
}

const STATUS_LABEL = {
  hit: 'Correct!',
  missed: 'Missed',
  wrong: 'Wrong',
  ok: '',
}

export default function ResultsOverlay({ score }) {
  if (!score) return null

  return (
    <div className="results-overlay">
      <h2 className="results-score">
        {score.correct} / {score.total} correct
      </h2>

      <div className="results-grid" style={{ gridTemplateColumns: `repeat(${Math.min(score.perBall.length, 6)}, 1fr)` }}>
        {score.perBall.map(entry => (
          <div key={entry.id} className={`result-cell result-${entry.status}`}>
            <span className="result-number">{entry.number}</span>
            <span className="result-icon">{STATUS_ICON[entry.status]}</span>
            <span className="result-label">{STATUS_LABEL[entry.status]}</span>
          </div>
        ))}
      </div>

      <div className="results-legend">
        <span className="legend-item legend-hit">✓ Correct</span>
        <span className="legend-item legend-missed">● Missed target</span>
        <span className="legend-item legend-wrong">✗ Wrong pick</span>
      </div>
    </div>
  )
}
