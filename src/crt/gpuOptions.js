// Maps a theme's `crt` block onto rpg-prop-kit's WebGPU CRT overlay
// options, so each system keeps its own feel when the GPU takes over from
// the CSS scanlines/sweep/vignette.

const num = (v, fallback) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)
const clamp01 = (v) => Math.min(1, Math.max(0, v))

export const GPU_PREF_KEY = 'tirpg.gpu'

export function crtGpuOptions(theme) {
  const crt = theme?.crt ?? {}
  const p = theme?.palette ?? {}
  const bloom = num(crt.bloom, 1)
  return {
    // CSS default scanline opacity is 0.28; that lands on the overlay's 0.5.
    scanlines: clamp01(num(crt.scanlines, 0.28) * 1.8),
    interference: clamp01(0.3 * bloom),
    glare: clamp01(0.3 * bloom),
    color: p.fg ?? '#33ff33'
  }
}

// GPU overlay is on by default where WebGPU exists; '0' turns it off.
export function readGpuPref() {
  try {
    return localStorage.getItem(GPU_PREF_KEY) !== '0'
  } catch {
    return true
  }
}

export function gpuSupported() {
  return typeof navigator !== 'undefined' && 'gpu' in navigator
}
