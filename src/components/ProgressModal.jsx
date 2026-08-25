import { useEffect, useRef, useState } from 'react'
import { makeT } from '../i18n/ui.js'

const SPINNER = ['|', '/', '-', '\\']
const MIN_PAUSE_MS = 80

function weights(n, rng, min = 0.35) {
  const w = Array.from({ length: n }, () => min + rng())
  const s = w.reduce((a, b) => a + b, 0)
  return w.map((x) => x / s)
}

// Piecewise 0→100 curve with random bursts and holds. Pauses steal time
// from movement so the bar still hits 100% at `duration`.
export function buildProgressSchedule(duration, rng = Math.random) {
  const T = Math.max(200, duration)
  let pauseCount = 0
  if (T >= 1000) pauseCount = 2 + Math.floor(rng() * 3)
  else if (T >= 450) pauseCount = rng() < 0.55 ? 1 : 2

  const runCount = pauseCount + 1
  const pauseFrac = pauseCount === 0 ? 0 : 0.12 + rng() * 0.12
  const pauseBudget = T * pauseFrac
  const runBudget = T - pauseBudget
  const runTimes = weights(runCount, rng).map((w) => runBudget * w)
  const pauseTimes = pauseCount
    ? weights(pauseCount, rng, 0.5).map((w) => pauseBudget * w)
    : []

  const finish = runCount === 1 ? 100 : 14 + rng() * 18
  const early = 100 - finish
  const progs =
    runCount === 1
      ? [100]
      : [...weights(runCount - 1, rng, 0.25).map((w) => early * w), finish]

  const pts = [{ t: 0, p: 0 }]
  let t = 0
  let p = 0
  for (let i = 0; i < runCount; i++) {
    t += runTimes[i]
    p += progs[i]
    pts.push({ t, p: i === runCount - 1 ? 100 : p })
    if (i < pauseCount && pauseTimes[i] >= MIN_PAUSE_MS) {
      t += pauseTimes[i]
      pts.push({ t, p: pts[pts.length - 1].p })
    }
  }
  pts[pts.length - 1].t = T
  pts[pts.length - 1].p = 100
  return pts
}

export function sampleProgress(pts, elapsed) {
  const end = pts[pts.length - 1]
  if (elapsed <= 0) return 0
  if (elapsed >= end.t) return 100
  let i = 1
  while (i < pts.length && pts[i].t < elapsed) i++
  const a = pts[i - 1]
  const b = pts[i]
  const span = b.t - a.t
  if (span <= 0) return b.p
  return a.p + (b.p - a.p) * ((elapsed - a.t) / span)
}

function easeOut(linear) {
  return (1 - (1 - linear) ** 2) * 100
}

// Centered popup that runs a progress bar (crack/decrypt) for `duration`
// ms and calls onDone when it completes. Cinematic replacement for the
// old inline bar. Coexists with corner popups; the password/roll dialog
// has already closed by the time this shows.
export default function ProgressModal({
  label,
  duration = 5000,
  jitter = true,
  t = makeT('en'),
  onDone
}) {
  const labelText = label ?? t('modal.progress.label')
  const [pct, setPct] = useState(0)
  const [spin, setSpin] = useState(0)
  const cbRef = useRef(onDone)
  cbRef.current = onDone

  useEffect(() => {
    const dur = Math.max(200, duration)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const schedule = reduce || !jitter ? null : buildProgressSchedule(dur)
    const start = performance.now()
    let raf
    const spinIv = setInterval(() => setSpin((s) => (s + 1) % SPINNER.length), 90)
    const tick = () => {
      const elapsed = performance.now() - start
      const p = schedule
        ? sampleProgress(schedule, elapsed)
        : easeOut(Math.min(1, elapsed / dur))
      setPct(p)
      if (elapsed < dur) {
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
  }, [duration, jitter])

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
