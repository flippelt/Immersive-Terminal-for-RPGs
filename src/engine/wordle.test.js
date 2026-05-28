import { describe, it, expect } from 'vitest'
import { scoreGuess, isWin, pickWord, DEFAULT_WORDS, wordsFor } from './wordle.js'

describe('scoreGuess', () => {
  it('marks all hits for the exact word', () => {
    expect(scoreGuess('CIPHER', 'CIPHER')).toEqual(['hit', 'hit', 'hit', 'hit', 'hit', 'hit'])
  })
  it('marks present, with the aligned letter a hit', () => {
    // target REACT, guess CRATE — the A (index 2) lines up → hit; rest present
    expect(scoreGuess('CRATE', 'REACT')).toEqual(['present', 'present', 'hit', 'present', 'present'])
  })
  it('handles duplicate letters in the guess', () => {
    // target ABBEY, guess BABES
    expect(scoreGuess('BABES', 'ABBEY')).toEqual(['present', 'present', 'hit', 'hit', 'miss'])
  })
  it('does not over-credit a repeated guess letter', () => {
    // target ALERT (one L), guess LLLLL -> exactly one of them counts (at the L position)
    const r = scoreGuess('LLLLL', 'ALERT')
    expect(r.filter((x) => x !== 'miss')).toEqual(['hit'])
  })
})

describe('isWin', () => {
  it('is case-insensitive', () => {
    expect(isWin('cipher', 'CIPHER')).toBe(true)
    expect(isWin('cyphr', 'CIPHER')).toBe(false)
  })
})

describe('pickWord', () => {
  it('returns a fixed decryptWord uppercased', () => {
    expect(pickWord({ decryptWord: 'swordfish' })).toBe('SWORDFISH')
  })
  it('picks from comma-separated decryptWords', () => {
    const w = pickWord({ decryptWords: 'alpha, bravo ,charlie' }, () => 0)
    expect(w).toBe('ALPHA')
  })
  it('falls back to the default pool', () => {
    expect(DEFAULT_WORDS).toContain(pickWord({}, () => 0))
  })
})

describe('default word pools', () => {
  // The minigame keyboard only accepts A-Z, and the grid sizes itself to the
  // word length — so words may vary in length but must be plain ASCII capitals
  // (no accents, or they'd be unwinnable).
  it('every default-pool word (en + pt) is ASCII A-Z only', () => {
    for (const lang of ['en', 'pt']) {
      for (const w of wordsFor(lang)) {
        expect(w, `${lang}: "${w}"`).toMatch(/^[A-Z]+$/)
      }
    }
  })
  it('keeps at least 25 six-letter words per language (lengths still vary)', () => {
    for (const lang of ['en', 'pt']) {
      const sixes = wordsFor(lang).filter((w) => w.length === 6)
      expect(sixes.length, `${lang} six-letter count`).toBeGreaterThanOrEqual(25)
    }
  })
})
