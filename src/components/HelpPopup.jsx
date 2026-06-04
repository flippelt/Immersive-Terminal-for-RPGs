import { useMemo } from 'react'
import { makeT } from '../i18n/ui.js'
import { useIsMobile } from '../hooks/useIsMobile.js'
import FloatingWindow from './FloatingWindow.jsx'

// Cheat-sheet the `help` command opens. The window chrome (drag/resize on
// desktop, modal on mobile) lives in FloatingWindow; this component only
// builds the rows shown inside it.
//
// The rows are derived from `help.lines` (already translated by the i18n
// layer) plus the active theme's `extraHelp` lines. Anywhere the current
// scenario has aliased a canonical command (`auspex` → `check`, etc.) we
// surface those aliases under the row, so the cheat sheet teaches the
// scenario's verbs instead of just the defaults.

const DESKTOP_DEFAULTS = { w: 480, h: 420 }
const MIN_SIZE = { w: 320, h: 200 }

function parseHelpLine(line) {
  if (!line) return null
  const trimmed = line.trim()
  if (!trimmed) return null
  const parts = trimmed.split(/\s{2,}/)
  if (parts.length < 2) return { kind: 'section', text: trimmed }
  const sigPart = parts[0]
  const desc = parts.slice(1).join(' ').trim()
  const cmdMatch = sigPart.match(/^(\S+)/)
  const cmd = cmdMatch ? cmdMatch[1] : sigPart
  const sig = sigPart.slice(cmd.length).trim()
  return { kind: 'row', cmd, sig, desc }
}

// Invert { aliasName: canonicalName } -> { canonicalName: [aliasName, ...] }
function aliasesByCanonical(aliases) {
  const out = {}
  for (const [name, canonical] of Object.entries(aliases ?? {})) {
    if (!out[canonical]) out[canonical] = []
    out[canonical].push(name)
  }
  return out
}

export default function HelpPopup({ theme, t = makeT('en'), onClose }) {
  const isMobile = useIsMobile()
  const aliasMap = useMemo(() => aliasesByCanonical(theme?.aliases), [theme?.aliases])

  const rows = useMemo(() => {
    const lines = t('help.lines')
    if (!Array.isArray(lines)) return []
    return lines.map(parseHelpLine).filter(Boolean)
  }, [t])

  const extra = useMemo(() => {
    if (!Array.isArray(theme?.extraHelp)) return []
    return theme.extraHelp
  }, [theme?.extraHelp])

  const titleText = t('help.title') ?? 'COMMANDS'

  return (
    <FloatingWindow
      title={titleText}
      t={t}
      onClose={onClose}
      className="floating-window--help"
      initialSize={DESKTOP_DEFAULTS}
      minSize={MIN_SIZE}
      anchor="top-right"
      footer={t(isMobile ? 'help.footer.mobile' : 'help.footer.desktop')}
    >
      {rows.map((row, i) => {
        if (row.kind === 'section') {
          return (
            <div key={i} className="help-popup__section">{row.text}</div>
          )
        }
        const aliases = aliasMap[row.cmd] ?? []
        const cmdDisplay = row.sig ? `${row.cmd} ${row.sig}` : row.cmd
        return (
          <div key={i} className="help-popup__row">
            <span className="help-popup__cmd">{cmdDisplay}</span>
            <span className="help-popup__desc">{row.desc}</span>
            {aliases.length > 0 && (
              <span className="help-popup__aliases">
                {t('help.aliases', { list: aliases.join(', ') })}
              </span>
            )}
          </div>
        )
      })}
      {extra.length > 0 && (
        <>
          <div className="help-popup__section">{t('help.extra')}</div>
          {extra.map((line, i) => (
            <div key={`extra-${i}`} className="help-popup__extra">{line}</div>
          ))}
        </>
      )}
    </FloatingWindow>
  )
}
