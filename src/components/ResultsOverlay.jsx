export default function ResultsOverlay({ score }) {
  if (!score) return null

  return (
    <div className="results-overlay">
      <p className="results-score">{score.correct} / {score.total} correct</p>
    </div>
  )
}
