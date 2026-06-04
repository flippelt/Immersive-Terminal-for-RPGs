// Theme skins (the 8 system looks) come from the shared engine — single source,
// so the editor's preview and the terminal can't drift. This module keeps only
// the repo-scenario loader (import.meta.glob) + composeTheme.
import { THEMES as THEME_LIST, THEME_REGISTRY, pickWord } from 'rpgterm-engine'

// A THEME is a skin (palette, font, banner, sounds, boot, locks defaults).
// A SCENARIO is a campaign that plugs into a theme. Its layout on disk:
//
//   scenarios/<theme>/<id>/scenario.json   -> motd, commands, overrides
//   scenarios/<theme>/<id>/files/**        -> the player-visible filesystem
//
// Every file under files/ becomes one node in the virtual filesystem.
// A locked file carries front-matter (a --- block) with its metadata;
// a plain file is just its text. Directories are inferred from the tree.

// THEME_LIST / THEME_REGISTRY are imported from rpgterm-engine above.

// --- front-matter --------------------------------------------------------
// Leading `---\n ... \n---` block of flat `key: value` lines. Unquoted
// values coerce to boolean/number; quote a value to force a string
// (e.g. a numeric-only password: `password: "12345"`).
function parseFrontMatter(raw) {
  const text = String(raw).replace(/\r\n/g, '\n')
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) return { meta: {}, content: text.replace(/\n+$/, '') }
  const [, header, body] = m
  const meta = {}
  for (const line of header.split('\n')) {
    const i = line.indexOf(':')
    if (i === -1) continue
    const key = line.slice(0, i).trim()
    const rawVal = line.slice(i + 1).trim()
    let val = rawVal
    if (/^".*"$/.test(rawVal) || /^'.*'$/.test(rawVal)) val = rawVal.slice(1, -1)
    else if (rawVal === 'true') val = true
    else if (rawVal === 'false') val = false
    else if (/^-?\d+$/.test(rawVal)) val = parseInt(rawVal, 10)
    meta[key] = val
  }
  return { meta, content: body.replace(/\n+$/, '') }
}

// --- filesystem builder --------------------------------------------------
function buildFilesystem(entries) {
  const fs = { '/': { type: 'dir', children: [] } }
  const ensureDir = (p) => (fs[p] ??= { type: 'dir', children: [] })
  const addChild = (dirPath, name) => {
    const d = ensureDir(dirPath)
    if (!d.children.includes(name)) d.children.push(name)
  }

  for (const { path, content, meta } of entries) {
    const parts = path.split('/').filter(Boolean)
    let cur = ''
    for (let i = 0; i < parts.length - 1; i++) {
      addChild(cur === '' ? '/' : cur, parts[i])
      cur = cur + '/' + parts[i]
      ensureDir(cur)
    }
    addChild(cur === '' ? '/' : cur, parts[parts.length - 1])
    const node = { type: 'file', content, ...meta }
    // Decrypt minigame availability: `decryptGame` if set, else default by
    // crackability (nocrack files get it). Pick a target keyword per file at
    // build time so it's stable and readable via `gmsheet`.
    if (node.decryptGame ?? node.crackable === false) node.decryptTarget ??= pickWord(node)
    fs[path] = node
  }

  for (const node of Object.values(fs)) {
    if (node.type === 'dir') node.children.sort()
  }
  return fs
}

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

const SCENARIOS = {} // SCENARIOS[themeId][scenarioId] = composed scenario
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
    // Directory-based translations, kept aside so localizeScenario can apply
    // them alongside any inline i18n.<lang>.files map.
    ...(fileI18n ? { _fileI18n: fileI18n } : {})
  }
}

export function scenarioIdsFor(themeId) {
  return Object.keys(SCENARIOS[themeId] ?? {})
}

// --- per-language content (Fase 3) --------------------------------------
// A theme/scenario/bundle may carry an `i18n` block:
//   "i18n": { "pt": { "motd": [...], "dialog": {...}, "files": { "/x.md": "..." } } }
// The base fields are the default language (English). When a non-default
// `lang` is active, each field in i18n[lang] overrides the base field:
// plain objects (locks, dialog, selfDestruct, login) shallow-merge so a
// translator can override just the text keys; everything else replaces
// wholesale. `files` is special — it maps a filesystem path to a translated
// body (front-matter / lock metadata stay language-agnostic on the base).
const isPlainObject = (v) =>
  v != null && typeof v === 'object' && !Array.isArray(v)

function applyI18n(obj, lang) {
  const tr = obj?.i18n?.[lang]
  // Always drop the i18n block from the composed result, even with no match.
  if (!obj?.i18n) return obj
  const out = { ...obj }
  delete out.i18n
  if (!tr) return out
  for (const [k, v] of Object.entries(tr)) {
    if (k === 'files') continue // handled against the built filesystem
    out[k] = isPlainObject(out[k]) && isPlainObject(v) ? { ...out[k], ...v } : v
  }
  return out
}

// Return a filesystem with translated file bodies. Nodes are cloned so the
// shared (English) filesystem is never mutated; metadata is preserved.
function translateFilesystem(fs, fileOverrides) {
  if (!isPlainObject(fileOverrides)) return fs
  const next = { ...fs }
  for (const [path, content] of Object.entries(fileOverrides)) {
    const p = path.startsWith('/') ? path : '/' + path
    if (next[p]?.type === 'file') next[p] = { ...next[p], content: String(content) }
  }
  return next
}

// Apply i18n to a scenario, including translating file bodies. File overrides
// come from a parallel files.<lang>/ tree (_fileI18n) and/or an inline
// i18n.<lang>.files map; the inline map wins on a conflicting path.
function localizeScenario(scenario, lang) {
  const fileOverrides = {
    ...(scenario?._fileI18n?.[lang] ?? {}),
    ...(scenario?.i18n?.[lang]?.files ?? {})
  }
  const out = applyI18n(scenario, lang)
  delete out._fileI18n
  if (Object.keys(fileOverrides).length) {
    out.filesystem = translateFilesystem(scenario.filesystem, fileOverrides)
  }
  return out
}

// Merge a theme skin with a scenario's content. Scenario fields override
// theme defaults; `commands` and `locks` shallow-merge.
function mergeScenario(theme, scenario) {
  return {
    ...theme,
    scenarioId: scenario.id ?? null,
    scenarioName: scenario.name ?? null,
    user: scenario.user ?? theme.user,
    header: scenario.header ?? theme.header,
    prompt: scenario.prompt ?? theme.prompt,
    boot: scenario.boot ?? theme.boot ?? [],
    motd: scenario.motd ?? theme.motd ?? [],
    login: scenario.login ?? theme.login ?? null,
    selfDestruct: scenario.selfDestruct ?? theme.selfDestruct ?? null,
    tracer: scenario.tracer ?? theme.tracer ?? null,
    dialog: scenario.dialog ?? theme.dialog ?? null,
    checkMisleadsOnFail: scenario.checkMisleadsOnFail ?? theme.checkMisleadsOnFail ?? false,
    events: scenario.events ?? {},
    aliases: { ...theme.aliases, ...scenario.aliases },
    locks: { ...theme.locks, ...scenario.locks },
    commands: { ...theme.commands, ...scenario.commands },
    filesystem: scenario.filesystem ?? {}
  }
}

export function composeTheme(themeId, scenarioId, lang = 'en') {
  const base = THEME_REGISTRY[themeId]
  if (!base) return null
  const theme = applyI18n(base, lang)
  const available = SCENARIOS[themeId] ?? {}
  const sid = available[scenarioId] ? scenarioId : base.defaultScenario
  const scenario = localizeScenario(available[sid] ?? {}, lang)
  return mergeScenario(theme, { ...scenario, id: scenario.id ?? sid ?? null })
}

// Skin fields a custom bundle may override for a fully bespoke look.
const SKIN_KEYS = [
  'palette', 'font', 'fontSize', 'crt', 'banner', 'screensaver',
  'sounds', 'unknownHint', 'extraHelp'
]

// Build a runtime theme from an inline scenario bundle — GM-authored
// content loaded from a URL or pasted JSON, no repo edit required. The
// bundle mirrors a scenario.json plus a `files` map (path -> raw text,
// front-matter and all) and an optional base `theme` id to skin it.
export function composeCustomScenario(bundle, lang = 'en') {
  if (!bundle || typeof bundle !== 'object' || Array.isArray(bundle)) {
    throw new Error('scenario bundle must be a JSON object')
  }
  const baseId =
    bundle.theme && THEME_REGISTRY[bundle.theme]
      ? bundle.theme
      : THEME_REGISTRY.ibm
        ? 'ibm'
        : THEME_LIST[0].id
  const theme = applyI18n(THEME_REGISTRY[baseId], lang)

  const filesObj = bundle.files ?? {}
  if (typeof filesObj !== 'object' || Array.isArray(filesObj)) {
    throw new Error('`files` must be an object of path -> text')
  }
  const files = Object.entries(filesObj).map(([path, raw]) => {
    const p = path.startsWith('/') ? path : '/' + path
    const { meta, content } = parseFrontMatter(String(raw))
    return { path: p, content, meta }
  })

  // Localize after building the filesystem (bundle i18n may translate
  // file bodies and shell fields, exactly like a repo scenario).
  const scenario = localizeScenario(
    { ...bundle, id: bundle.id ?? 'custom', filesystem: buildFilesystem(files) },
    lang
  )
  const merged = mergeScenario(theme, scenario)
  const skin = applyI18n(bundle, lang)
  for (const k of SKIN_KEYS) {
    if (skin[k] != null) merged[k] = skin[k]
  }
  merged.custom = true
  return merged
}

// Every theme is always available — no curated demo subset.
export const THEMES = THEME_LIST
export const THEME_BY_ID = Object.fromEntries(THEMES.map((t) => [t.id, t]))
export const DEFAULT_THEME = THEMES[0] ?? THEME_LIST[0]
