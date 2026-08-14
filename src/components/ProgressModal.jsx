import { useEffect, useRef, useState } from 'react'
import { makeT } from '../i18n/ui.js'

const SPINNER = ['|', '/', '-', '\\']

// Centered popup that runs a progress bar (crack/decrypt) for `duration`
// ms and calls onDone when it completes. Cinematic replacement for the
// old inline bar. Coexists with corner popups; the password/roll dialog
// has already closed by the time this shows.
export default function ProgressModal({ label, duration = 5000, t = makeT('en'), onDone }) {
  const labelText = label ?? t('modal.progress.label')
  const [pct, setPct] = useState(0)
  const [spin, setSpin] = useState(0)
  const cbRef = useRef(onDone)
  cbRef.current = onDone

  useEffect(() => {
    const dur = Math.max(200, duration)
    const start = performance.now()
    let raf
    const spinIv = setInterval(() => setSpin((s) => (s + 1) % SPINNER.length), 90)
    const tick = () => {
      const linear = Math.min(1, (performance.now() - start) / dur)
      // Ease-out so the last stretch feels like a lock yielding.
      const p = (1 - (1 - linear) ** 2) * 100
      setPct(p)
      if (linear < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setPct(100)
        clearInterval(spinIv)
        cbRef.current?.()
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(spinIv)
    }
  }, [duration])

  const done = pct >= 100
  const spinner = done ? '✓' : SPINNER[spin]
  const hex = Math.floor((pct / 100) * 0xffff).toString(16).toUpperCase().padStart(4, '0')

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal modal--progress" role="dialog" aria-label={labelText}>
        <div className="modal__header">{labelText}</div>
        <div className="progress">
          <div className="progress__meta">
            <span className="progress__spin" aria-hidden="true">{spinner}</span>
            <span className="progress__pct">{String(Math.floor(pct)).padStart(3, ' ')}%</span>
          </div>
          <div
            className="progress__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.floor(pct)}
            aria-label={labelText}
          >
            <div className="progress__fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="progress__foot" aria-hidden="true">
            <span>0x{hex}</span>
            <span>{done ? 'OK' : 'BUSY'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
