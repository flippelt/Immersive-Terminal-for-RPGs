import { useEffect, useMemo, useState } from 'react'
import { playGlitch, playPowerOff } from '../audio/sfx.js'

const COLS = 18
const ROWS = 12

// Self-destruct detonation: sectors fail, the last MU/TH/UR line types
// out, the monitor collapses, and the console reboots. Opaque overlay so
// nothing of the old screen shows through (same pattern as the tracer
// "caught" climax).
export default function Detonation({ config = {}, onReboot }) {
  const [off, setOff] = useState(false)
  const [typed, setTyped] = useState('')
  const [showRest, setShowRest] = useState(false)
  const delays = useMemo(
    () => Array.from({ length: COLS * ROWS }, () => Math.random() * 0.45),
    []
  )
  const lines = (Array.isArray(config.detonate) ? config.detonate : [config.detonate]).filter(Boolean)
  const headline = String(lines[0] ?? 'DETONATION.')
  const rest = lines.slice(1)

  useEffect(() => {
    playGlitch()
    let n = 0
    const id = setInterval(() => {
      n += 1
      setTyped(headline.slice(0, n))
      if (n >= headline.length) {
        clearInterval(id)
        setTimeout(() => setShowRest(true), 280)
      }
    }, 90)
    return () => clearInterval(id)
  }, [headline])

  useEffect(() => {
    if (!showRest) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const t = setTimeout(() => {
      if (reduce) onReboot?.()
      else {
        playPowerOff()
        setOff(true)
      }
    }, 1600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRest])

  useEffect(() => {
    if (!off) return
    const t = setTimeout(() => onReboot?.(), 550)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [off])

  return (
    <div className="detonation" role="alertdialog" aria-label="self-destruct">
      <div className="detonation__grid">
        {delays.map((d, i) => (
          <span key={i} className="detonation__cell" style={{ animationDelay: `${d}s` }} />
        ))}
      </div>
      <div className="detonation__scan" aria-hidden="true" />
      {!off && (
        <div className="detonation__msg">
          {config.tag && <span className="detonation__tag">{config.tag}</span>}
          <span className="detonation__text">{typed}</span>
          {showRest &&
            rest.map((line, i) => (
              <div key={i} className="detonation__sub">{line}</div>
            ))}
        </div>
      )}
      {off && <div className="caught__off" />}
    </div>
  )
}
