import { describe, it, expect } from 'vitest'
import { validateScenario, validateFrontMatter, parseFrontMatter } from 'rpgterm-engine'

const metaModules = import.meta.glob('./scenarios/*/*/scenario.json', { eager: true })
const fileModules = import.meta.glob('./scenarios/*/*/files/**/*', {
  eager: true,
  query: '?raw',
  import: 'default'
})

describe('repo scenarios match the engine schema', () => {
  it.each(Object.entries(metaModules))('%s', (key, mod) => {
    const data = mod.default ?? mod
    expect(validateScenario(data), `${key}: ${validateScenario(data).join('; ')}`).toEqual([])
  })
})

describe('repo file front-matter matches the engine schema', () => {
  const cases = Object.entries(fileModules).map(([key, raw]) => {
    const { meta } = parseFrontMatter(raw)
    return [key, meta]
  })
  it.each(cases)('%s', (key, meta) => {
    expect(validateFrontMatter(meta), `${key}: ${validateFrontMatter(meta).join('; ')}`).toEqual([])
  })
})
