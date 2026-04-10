// ResultsOverlay shows the round result centred over the canvas.
// Ball-level feedback (green/red glow) is rendered directly onto the canvas by drawing.js.
export default function ResultsOverlay({ score }) {
  if (!score) return null

  return (
    <div className="results-overlay">
      <p className="results-score">{score.correct} / {score.total} correct</p>
    </div>
  )
}
