// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { crtGpuOptions, readGpuPref, gpuSupported, GPU_PREF_KEY } from './gpuOptions.js'

describe('crtGpuOptions', () => {
  it('maps the default CSS scanline opacity to the overlay midpoint', () => {
    expect(crtGpuOptions({ crt: {} }).scanlines).toBeCloseTo(0.504)
  })

  it('clamps and scales with bloom, and takes the phosphor colour', () => {
    const o = crtGpuOptions({ crt: { scanlines: 2, bloom: 5 }, palette: { fg: '#ffb000' } })
    expect(o.scanlines).toBe(1)
    expect(o.interference).toBe(1)
    expect(o.glare).toBe(1)
    expect(o.color).toBe('#ffb000')
  })

  it('survives a theme without crt/palette', () => {
    expect(crtGpuOptions(undefined)).toEqual({
      scanlines: expect.any(Number),
      interference: 0.3,
      glare: 0.3,
      color: '#33ff33'
    })
  })
})

describe('readGpuPref', () => {
  // Node 26 ships its own (disabled) localStorage global, so stub a Map-backed one.
  beforeEach(() => {
    const store = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v))
    })
  })
  afterEach(() => vi.unstubAllGlobals())

  it('defaults to on and honours an explicit off', () => {
    expect(readGpuPref()).toBe(true)
    localStorage.setItem(GPU_PREF_KEY, '0')
    expect(readGpuPref()).toBe(false)
  })

  it('jsdom has no WebGPU', () => {
    expect(gpuSupported()).toBe(false)
  })
})
