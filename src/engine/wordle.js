// Wordle-style scoring for the `decrypt` minigame. Pure & unit-tested.
import enWords from '../i18n/words.en.json'
import ptWords from '../i18n/words.pt.json'

// Default keyword pools by language (src/i18n/words.<lang>.json).
const POOLS = { en: enWords.words, pt: ptWords.words }
export const DEFAULT_WORDS = enWords.words

// The default keyword pool for a language (falls back to English).
export function wordsFor(lang) {
  return POOLS[lang] ?? DEFAULT_WORDS
}

// Pick the target word for a game file: a fixed `decryptWord`, a random one
// from comma-separated `decryptWords`, else a random word from the active
// language's default pool. Uppercased.
export function pickWord(meta, rand = Math.random, lang = 'en') {
  const norm = (w) => String(w).trim().toUpperCase()
  if (meta?.decryptWord) return norm(meta.decryptWord)
  const list = meta?.decryptWords
    ? String(meta.decryptWords).split(',').map(norm).filter(Boolean)
    : wordsFor(lang)
  return list[Math.floor(rand() * list.length)] ?? wordsFor(lang)[0]
}

// Score a guess against the target, Wordle-style, handling duplicate letters:
// returns one of 'hit' (right letter, right spot), 'present' (right letter,
// wrong spot), 'miss' (not in remaining letters) per position.
export function scoreGuess(guess, target) {
  const g = String(guess).toUpperCase()
  const t = String(target).toUpperCase()
  const n = t.length
  const res = new Array(n).fill('miss')
  const counts = {}
  for (let i = 0; i < n; i++) counts[t[i]] = (counts[t[i]] ?? 0) + 1
  // first pass: exact hits consume a letter
  for (let i = 0; i < n; i++) {
    if (g[i] === t[i]) {
      res[i] = 'hit'
      counts[g[i]] -= 1
    }
  }
  // second pass: present-but-misplaced from what's left
  for (let i = 0; i < n; i++) {
    if (res[i] === 'hit') continue
    if (counts[g[i]] > 0) {
      res[i] = 'present'
      counts[g[i]] -= 1
    }
  }
  return res
}

export const isWin = (guess, target) =>
  String(guess).toUpperCase() === String(target).toUpperCase()
