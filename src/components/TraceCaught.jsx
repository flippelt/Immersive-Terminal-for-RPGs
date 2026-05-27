import { useEffect, useRef, useState } from 'react'

// The "you ran out of time" climax (config-driven; currently only Cyberpunk
// ships a `tracer.caught`). A burst of FOUND YOU popups scatters across the
// screen, then a black takeover types the final line letter-by-letter, a
// menacing smiley lands, holds, and the console reboots.
export default function TraceCaught({ config = {}, onReboot }) {
  const popupMsgs = config.popups ?? ['FOUND YOU!']
  const popupCount = config.popupCount ?? 14
  const popupInterval = config.popupInterval ?? 220
  const finalText = config.finalText ?? 'FOUND YOU'
  const smiley = config.smiley ?? ':)'
  const typeSpeed = config.typeSpeed ?? 220
  const holdMs = (config.hold ?? 7) * 1000

  const [popups, setPopups] = useState([])
  const [phase, setPhase] = useState('popups') // 'popups' -> 'final'
  const [typed, setTyped] = useState('')
  const [showSmiley, setShowSmiley] = useState(false)
  const rebooted = useRef(false)

  // Phase 1 — scatter popups in quick succession.
  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      const text = popupMsgs[i % popupMsgs.length]
      setPopups((p) => [
        ...p,
        {
          id: i,
          text,
          top: 6 + Math.random() * 76,
          left: 4 + Math.random() * 72,
          rot: -10 + Math.random() * 20
        }
      ])
      i += 1
      if (i >= popupCount) {
        clearInterval(id)
        setTimeout(() => setPhase('final'), 450)
      }
    }, popupInterval)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Phase 2 — type the final line, then reveal the smiley.
  useEffect(() => {
    if (phase !== 'final') return
    let n = 0
    const id = setInterval(() => {
      n += 1
      setTyped(finalText.slice(0, n))
      if (n >= finalText.length) {
        clearInterval(id)
        setTimeout(() => setShowSmiley(true), 500)
      }
    }, typeSpeed)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Hold on the black screen, then reboot the console.
  useEffect(() => {
    if (!showSmiley) return
    const t = setTimeout(() => {
      if (!rebooted.current) {
        rebooted.current = true
        onReboot?.()
      }
    }, holdMs)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSmiley])

  return (
    <div
      className={`caught${phase === 'final' ? ' caught--final' : ''}`}
      role="alertdialog"
      aria-label={finalText}
    >
      {phase === 'popups' &&
        popups.map((p) => (
          <div
            key={p.id}
            className="caught__popup"
            style={{ top: `${p.top}%`, left: `${p.left}%`, transform: `rotate(${p.rot}deg)` }}
          >
            {p.text}
          </div>
        ))}
      {phase === 'final' && (
        <div className="caught__final">
          <span className="caught__text">{typed}</span>
          {showSmiley && <span className="caught__smiley">{smiley}</span>}
        </div>
      )}
    </div>
  )
}
