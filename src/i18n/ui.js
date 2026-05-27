// Built-in UI / system strings (help, errors, modal labels, scan readouts).
// English is the source of truth; other languages fall back to it key-by-key
// so a missing translation degrades gracefully instead of showing the raw key.
// Scenario/theme-authored text (banners, dialog, popups) is NOT here — that
// lives in the bundles and is translated per scenario.
import en from './ui.en.json'
import pt from './ui.pt.json'

const DICTS = { en, pt }

// Fill {placeholders} from params. Missing params are left intact so the
// template stays debuggable rather than rendering "undefined".
function interpolate(str, params) {
  if (!params) return str
  return str.replace(/\{(\w+)\}/g, (m, k) => (k in params ? String(params[k]) : m))
}

// makeT(lang) -> t(key, params?). Returns the English string for unknown
// langs or untranslated keys; returns the key itself only if English lacks it
// too (a bug worth seeing). Array values (e.g. the help table) pass through
// untouched — callers map over them.
export function makeT(lang = 'en') {
  const dict = DICTS[lang] ?? en
  return (key, params) => {
    const val = dict[key] ?? en[key]
    if (val == null) return key
    if (Array.isArray(val)) return val
    return interpolate(val, params)
  }
}

export const SUPPORTED_LANGS = Object.keys(DICTS)
