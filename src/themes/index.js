// Host-side scenario loader. Skins, front-matter, VFS build, i18n and
// compose live in rpgterm-engine — this module only globs the repo
// scenarios off disk and hands them to the engine.
import {
  THEMES as THEME_LIST,
  THEME_REGISTRY,
  parseFrontMatter,
  buildFilesystem,
  composeTheme as engineComposeTheme,
  composeCustomScenario
} from 'rpgterm-engine'
import * as engine from 'rpgterm-engine'

// A THEME is a skin (palette, font, banner, sounds, boot, locks defaults).
// A SCENARIO is a campaign that plugs into a theme. Its layout on disk:
//
//   scenarios/<theme>/<id>/scenario.json   -> motd, commands, overrides
//   scenarios/<theme>/<id>/files/**        -> the player-visible filesystem
//
// Every file under files/ becomes one node in the virtual filesystem.
// A locked file carries front-matter (a --- block) with its metadata;
// a plain file is just its text. Directories are inferred from the tree.

// --- load scenarios from disk -------------------------------------------
const metaModules = import.meta.glob('./scenarios/*/*/scenario.json', {
  eager: true
})
const fileModules = import.meta.glob('./scenarios/*/*/files/**/*', {
  eager: true,
  query: '?raw',
  import: 'default'
})
// Optional translated file trees, parallel to files/: e.g.
// scenarios/<theme>/<id>/files.pt/<same/rel/path>. Body-only — lock metadata
// always comes from the base file, so translators just retell the lore.
const transFileModules = import.meta.glob('./scenarios/*/*/files.*/**/*', {
  eager: true,
  query: '?raw',
  import: 'default'
})

const SCENARIOS = {} // SCENARIOS[themeId][scenarioId] = loaded scenario
const FILE_BUCKETS = {} // key `${theme}/${scenario}` -> [{ path, content, meta }]
// key `${theme}/${scenario}` -> { [lang]: { '/rel': translatedBody } }
const TRANS_BUCKETS = {}

for (const [key, raw] of Object.entries(fileModules)) {
  const m = key.match(/\.\/scenarios\/([^/]+)\/([^/]+)\/files\/(.+)$/)
  if (!m) continue
  const [, themeId, scenarioId, rel] = m
  const { meta, content } = parseFrontMatter(raw)
  const bucket = (FILE_BUCKETS[`${themeId}/${scenarioId}`] ??= [])
  bucket.push({ path: '/' + rel, content, meta })
}

for (const [key, raw] of Object.entries(transFileModules)) {
  const m = key.match(/\.\/scenarios\/([^/]+)\/([^/]+)\/files\.([a-z]{2})\/(.+)$/)
  if (!m) continue
  const [, themeId, scenarioId, lang, rel] = m
  const { content } = parseFrontMatter(raw) // ignore any meta — base owns it
  const byLang = (TRANS_BUCKETS[`${themeId}/${scenarioId}`] ??= {})
  ;(byLang[lang] ??= {})['/' + rel] = content
}

for (const [key, mod] of Object.entries(metaModules)) {
  const m = key.match(/\.\/scenarios\/([^/]+)\/([^/]+)\/scenario\.json$/)
  if (!m) continue
  const [, themeId, scenarioId] = m
  const data = mod.default ?? mod
  const files = FILE_BUCKETS[`${themeId}/${scenarioId}`] ?? []
  const fileI18n = TRANS_BUCKETS[`${themeId}/${scenarioId}`]
  ;(SCENARIOS[themeId] ??= {})[scenarioId] = {
    id: scenarioId,
    ...data,
    filesystem: buildFilesystem(files),
    ...(fileI18n ? { _fileI18n: fileI18n } : {})
  }
}

export function scenarioIdsFor(themeId) {
  return Object.keys(SCENARIOS[themeId] ?? {})
}

export function loadedScenario(themeId, scenarioId) {
  return SCENARIOS[themeId]?.[scenarioId] ?? null
}

// Resolve a repo scenario id (falling back to the skin's default) and let
// the engine apply i18n + merge the skin. `defaultScenarioOverrides` lets a
// private host (rpgterm) pin a table campaign without forking compose.
// Host-side alias so `?theme=dataslate` still finds Vorlanis after the
// folder moved under wh40k, even on engine 0.2.1 (no resolveThemeRef yet).
const HOST_THEME_ALIASES = {
  dataslate: { themeId: 'wh40k', device: 'dataslate' }
}

export function composeTheme(themeId, scenarioId, lang = 'en', defaultScenarioOverrides = {}, deviceId = null) {
  const resolveThemeRef = engine.resolveThemeRef
  const ref = (typeof resolveThemeRef === 'function' ? resolveThemeRef(themeId) : null)
    ?? HOST_THEME_ALIASES[themeId]
    ?? { themeId, device: null }
  if (!THEME_REGISTRY[ref.themeId]) return null
  const available = {
    ...(SCENARIOS[ref.themeId] ?? {}),
    ...(SCENARIOS[themeId] ?? {})
  }
  const override = defaultScenarioOverrides[ref.themeId] ?? defaultScenarioOverrides[themeId]
  const fallback = override && available[override] ? override : THEME_REGISTRY[ref.themeId].defaultScenario
  const sid = available[scenarioId] ? scenarioId : fallback
  const raw = available[sid] ?? {}
  return engineComposeTheme(ref.themeId, {
    ...raw,
    id: raw.id ?? sid ?? null,
    device: deviceId ?? raw.device ?? ref.device ?? null
  }, lang)
}

export { composeCustomScenario }

// Every theme is always available — no curated demo subset.
export const THEMES = THEME_LIST
export const THEME_BY_ID = THEME_REGISTRY
export const DEFAULT_THEME = THEMES[0] ?? THEME_LIST[0]
