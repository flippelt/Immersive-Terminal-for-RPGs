import { describe, it, expect } from 'vitest'
import { makeT, SUPPORTED_LANGS } from './ui.js'
import en from './ui.en.json'
import pt from './ui.pt.json'

describe('makeT', () => {
  it('returns English by default', () => {
    const t = makeT()
    expect(t('cat.missing')).toBe('cat: missing operand')
  })

  it('translates to Portuguese when asked', () => {
    const t = makeT('pt')
    expect(t('cat.missing')).toBe('cat: operando ausente')
  })

  it('interpolates named placeholders', () => {
    expect(makeT('en')('ls.notdir', { target: '/x' })).toBe('ls: /x: not a directory')
    expect(makeT('pt')('ls.notdir', { target: '/x' })).toBe('ls: /x: não é um diretório')
  })

  it('leaves unknown placeholders intact', () => {
    expect(makeT('en')('ls.notdir', {})).toBe('ls: {target}: not a directory')
  })

  it('falls back to English for an untranslated key', () => {
    const partial = makeT('pt')
    // every key the pt file is missing should still resolve via English
    expect(partial('cat.missing')).not.toBe('cat.missing')
  })

  it('falls back to English for an unknown language', () => {
    expect(makeT('xx')('cat.missing')).toBe('cat: missing operand')
  })

  it('returns the raw key only when English also lacks it', () => {
    expect(makeT('en')('totally.unknown.key')).toBe('totally.unknown.key')
  })

  it('passes array values through untouched (help table)', () => {
    const lines = makeT('en')('help.lines')
    expect(Array.isArray(lines)).toBe(true)
    expect(lines.length).toBeGreaterThan(0)
  })

  it('exposes the supported languages', () => {
    expect(SUPPORTED_LANGS).toContain('en')
    expect(SUPPORTED_LANGS).toContain('pt')
  })
})

describe('dictionary parity', () => {
  // Command names must never be translated: the help table keeps identical
  // command tokens in both languages (only the descriptions differ).
  it('keeps the same command tokens in the pt help table', () => {
    const token = (line) => line.trim().split(/\s+/)[0]
    const enTokens = en['help.lines'].map(token)
    const ptTokens = pt['help.lines'].map(token)
    expect(ptTokens).toEqual(enTokens)
  })

  it('every pt key exists in en (no orphan translations)', () => {
    for (const key of Object.keys(pt)) {
      if (key === 'lang') continue
      expect(en, `en is missing key "${key}"`).toHaveProperty([key])
    }
  })
})
