import { PHASES } from '../constants/game.js'

const MESSAGES = {
  [PHASES.IDLE]: { text: 'Life Kinetik Training', sub: 'Track the highlighted balls!' },
  [PHASES.APPEAR]: { text: 'Get ready...', sub: 'Watch the screen' },
  [PHASES.SHINE]: { text: 'Remember these balls!', sub: 'Watch the glowing ones carefully' },
  [PHASES.MOVE]: null,
  [PHASES.STOP]: { text: 'Time\'s up!', sub: 'Now select the balls that glowed' },
  [PHASES.SELECT]: { text: 'Which ones glowed?', sub: 'Select 4 balls, then press Submit' },
  [PHASES.RESULT]: null,
}

export default function PhaseMessage({ phase }) {
  const msg = MESSAGES[phase]
  if (!msg) return null

  return (
    <div className="phase-message">
      <h2 className="phase-title">{msg.text}</h2>
      <p className="phase-sub">{msg.sub}</p>
    </div>
  )
}
