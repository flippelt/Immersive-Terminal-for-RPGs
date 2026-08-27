import { describe, it, expect } from 'vitest'
import { buildProgressSchedule, sampleProgress } from './ProgressModal.jsx'

function rngSeq(values) {
  let i = 0
  return () => values[i++ % values.length]
}

function segments(pts) {
  const pauses = []
  const speeds = []
  for (let i = 1; i < pts.length; i++) {
    const dt = pts[i].t - pts[i - 1].t
    const dp = pts[i].p - pts[i - 1].p
    if (dt <= 0) continue
    if (dp < 1e-6) pauses.push(dt)
    else speeds.push(dp / dt)
  }
  return { pauses, speeds }
}

describe('buildProgressSchedule', () => {
  it('always starts at 0 and ends at 100 at duration', () => {
    const pts = buildProgressSchedule(2300, rngSeq([0.2, 0.8, 0.1, 0.9, 0.4]))
    expect(pts[0]).toEqual({ t: 0, p: 0 })
    expect(pts[pts.length - 1].t).toBe(2300)
    expect(pts[pts.length - 1].p).toBe(100)
    expect(sampleProgress(pts, 0)).toBe(0)
    expect(sampleProgress(pts, 2300)).toBe(100)
    expect(sampleProgress(pts, 9000)).toBe(100)
  })

  it('never goes backwards', () => {
    const pts = buildProgressSchedule(5000, rngSeq([0.11, 0.73, 0.42, 0.06, 0.91, 0.55]))
    let last = 0
    for (let e = 0; e <= 5000; e += 16) {
      const p = sampleProgress(pts, e)
      expect(p).toBeGreaterThanOrEqual(last - 1e-9)
      last = p
    }
  })

  it('inserts holds on a long bar', () => {
    const pts = buildProgressSchedule(2300, () => 0.5)
    const paused = pts.some((pt, i) => i > 0 && pt.p === pts[i - 1].p && pt.t > pts[i - 1].t)
    expect(paused).toBe(true)
  })

  it('skips pauses on a very short bar', () => {
    const pts = buildProgressSchedule(200, () => 0.5)
    const paused = pts.some((pt, i) => i > 0 && pt.p === pts[i - 1].p && pt.t > pts[i - 1].t)
    expect(paused).toBe(false)
    expect(sampleProgress(pts, 100)).toBeGreaterThan(0)
    expect(sampleProgress(pts, 100)).toBeLessThan(100)
  })

  it('varies burst speed and pause length on a long bar', () => {
    const pts = buildProgressSchedule(
      5000,
      rngSeq([0.01, 0.99, 0.02, 0.98, 0.03, 0.97, 0.04, 0.96, 0.05, 0.95, 0.1, 0.9])
    )
    const { pauses, speeds } = segments(pts)
    expect(pauses.length).toBeGreaterThan(1)
    expect(Math.max(...pauses) / Math.min(...pauses)).toBeGreaterThan(2)
    expect(speeds.length).toBeGreaterThan(1)
    expect(Math.max(...speeds) / Math.min(...speeds)).toBeGreaterThan(2)
  })

  it('gives a hurried fill longer holds than a crawl', () => {
    const crawl = segments(buildProgressSchedule(4000, () => 0.15))
    const hurry = segments(buildProgressSchedule(4000, () => 0.9))
    const pauseSum = (s) => s.pauses.reduce((a, b) => a + b, 0)
    expect(pauseSum(hurry)).toBeGreaterThan(pauseSum(crawl))
  })
})
