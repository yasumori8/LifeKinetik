import { useEffect } from 'react'

// Renders the <canvas> element and keeps its pixel dimensions in sync with its
// CSS display size. Without this, a canvas styled to fill the viewport would
// still have its default 300×150 attribute dimensions, causing blurry rendering
// and incorrect click-to-ball hit detection coordinates.
export default function Canvas({ canvasRef, onCanvasClick }) {

  // ResizeObserver updates the canvas width/height attributes whenever the
  // element's layout size changes (e.g. window resize, orientation change)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        canvas.width = Math.round(width)
        canvas.height = Math.round(height)
      }
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [canvasRef])

  // Click handler is attached imperatively so it can be swapped without
  // removing and re-adding the canvas element
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.addEventListener('click', onCanvasClick)
    return () => canvas.removeEventListener('click', onCanvasClick)
  }, [canvasRef, onCanvasClick])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}
    />
  )
}
