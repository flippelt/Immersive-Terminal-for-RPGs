import { useEffect, useRef, useState } from 'react'
import { playBeep } from '../audio/sfx.js'

// Ticks from `from` down to 0, one step per `interval` ms, beeping each
// tick. Calls onDone when it hits 0 so the queue continues. `alarm`
// gives it a pulsing red treatment.
export default function CountdownLine({ line, animate, onDone }) {
  const from = Math.max(0, line.from ?? 10)
  const interval = Math.max(120, line.interval ?? 800)
  const label = line.label ?? 'DETONATION IN'
  const [n, setN] = useState(animate ? from : 0)
  const cbRef = useRef(onDone)
  cbRef.current = onDone

  useEffect(() => {
    if (!animate) {
      setN(0)
      cbRef.current?.()
      return
    }
    let cur = from
    setN(cur)
    playBeep({ freq: 1000, duration: 0.08 }, 'err')
    const id = setInterval(() => {
      cur -= 1
      setN(cur)
      if (cur <= 0) {
        clearInterval(id)
        cbRef.current?.()
        return
      }
      playBeep({ freq: 1000, duration: 0.08 }, 'err')
    }, interval)
    return () => clearInterval(id)
  }, [animate, from, interval])

  return (
    <p className={`line ${line.alarm ? 'line--alarm' : 'line--err'}`}>
      {label} {n}
      {n > 0 ? '...' : ''}
    </p>
  )
}
