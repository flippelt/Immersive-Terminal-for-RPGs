import { useEffect, useRef, useState } from 'react'
import { playGlitch, playPowerOff } from '../audio/sfx.js'

// ICE daemon — hex frame, slit eyes, broken grin. Color comes from CSS.
function IceFace() {
  return (
    <svg className="caught__smiley caught__face" viewBox="0 0 120 120" aria-hidden="true">
      <polygon
        points="60,6 108,34 108,86 60,114 12,86 12,34"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
      />
      <polygon
        points="60,18 96,40 96,80 60,102 24,80 24,40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.45"
      />
      <rect x="34" y="50" width="18" height="5" fill="currentColor" />
      <rect x="68" y="50" width="18" height="5" fill="currentColor" />
      <path
        d="M32 78 L48 90 L60 76 L72 90 L88 78"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
    </svg>
  )
}

// The "you ran out of time" climax (config-driven; currently only Cyberpunk
// ships a `tracer.caught`). A burst of FOUND YOU popups scatters across the
// screen, then a black takeover types the final line letter-by-letter, an
// ICE face lands, holds, the monitor "powers off", and the console reboots.
export default function TraceCaught({ config = {}, onReboot }) {
  const popupMsgs = config.popups ?? ['FOUND YOU!']
  const popupCount = config.popupCount ?? 14
  const popupInterval = config.popupInterval ?? 220
  const finalText = config.finalText ?? 'FOUND YOU'
  const typeSpeed = config.typeSpeed ?? 220
  const holdMs = (config.hold ?? 5) * 1000
  const sound = config.sound !== false

  const [popups, setPopups] = useState([])
  const [phase, setPhase] = useState('popups') // 'popups' -> 'final'
  const [typed, setTyped] = useState('')
  const [showSmiley, setShowSmiley] = useState(false)
  const [off, setOff] = useState(false)
  const rebooted = useRef(false)

  const reboot = () => {
    if (!rebooted.current) {
      rebooted.current = true
      onReboot?.()
    }
  }

  // Phase 1 — scatter popups in quick succession (with a glitch hit).
  useEffect(() => {
    if (sound) playGlitch()
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
          rot: -12 + Math.random() * 24,
          scale: 0.82 + Math.random() * 0.55,
          invert: i % 4 === 0
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

  // Phase 2 — type the final line, then reveal the face.
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

  // Hold, then power the monitor off (CRT collapse) and reboot. Honors
  // reduced-motion by skipping the collapse animation.
  useEffect(() => {
    if (!showSmiley) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const t = setTimeout(() => {
      if (reduce) reboot()
      else {
        if (sound) playPowerOff()
        setOff(true)
      }
    }, holdMs)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSmiley])

  // Power-off: collapse (~0.5s), then hold a fully black screen 0.7s, then
  // reboot. Content is hidden the instant it powers off, so nothing of the
  // FOUND YOU screen shows through before the reboot.
  useEffect(() => {
    if (!off) return
    const t = setTimeout(reboot, 1200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [off])

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
            className={`caught__popup${p.invert ? ' caught__popup--invert' : ''}`}
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              transform: `rotate(${p.rot}deg) scale(${p.scale})`
            }}
          >
            {p.text}
          </div>
        ))}
      {phase === 'final' && !off && (
        <div className="caught__final">
          <div className="caught__scan" aria-hidden="true" />
          <span className="caught__tag">ICE TRACE COMPLETE</span>
          <span className="caught__text" data-text={typed}>
            {typed}
          </span>
          {showSmiley &&
            (config.smiley ? (
              <span className="caught__smiley">{config.smiley}</span>
            ) : (
              <IceFace />
            ))}
        </div>
      )}
      {off && <div className="caught__off" />}
    </div>
  )
}
