import { useEffect, useRef, useState } from 'react'
import { makeT } from '../i18n/ui.js'

const LANGS = [
  ['en', 'EN'],
  ['pt', 'PT']
]

// Bottom-left control: collapsed into one trigger that opens a panel with
// the system (theme) chips and a language toggle. Players see only enabled
// themes; in GM mode every theme shows a ×/+ toggle to enable/disable it.
export default function ThemeSwitcher({
  themes,
  current,
  onSelect,
  gmMode,
  disabled,
  onToggleDisabled,
  lang,
  onSetLang
}) {
  const t = makeT(lang)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const currentTheme = themes.find((th) => th.id === current)
  const visible = gmMode
    ? themes
    : themes.filter((th) => !disabled?.has(th.id) || th.id === current)

  return (
    <div className="theme-switcher" ref={ref}>
      {open && (
        <div className="theme-switcher__menu">
          <p className="switcher__label">{t('switcher.system')}</p>
          <div className="switcher__row">
          {visible.map((th) => {
            const isOff = disabled?.has(th.id)
            return (
              <span
                key={th.id}
                className={`switcher-chip${isOff ? ' switcher-chip--off' : ''}`}
              >
                <button
                  className={th.id === current ? 'active' : ''}
                  onClick={() => {
                    onSelect(th)
                    setOpen(false)
                  }}
                  title={th.name}
                >
                  <span
                    className="switcher-chip__swatch"
                    style={{
                      background: th.palette?.fg ?? 'currentColor',
                      boxShadow: `0 0 6px ${th.palette?.fg ?? 'currentColor'}`
                    }}
                    aria-hidden="true"
                  />
                  {th.shortName ?? th.id}
                </button>
                {gmMode && (
                  <button
                    className="switcher-chip__toggle"
                    onClick={() => onToggleDisabled(th.id)}
                    title={isOff ? t('switcher.gm.enable') : t('switcher.gm.disable')}
                    aria-label={isOff ? `enable ${th.id}` : `disable ${th.id}`}
                  >
                    {isOff ? '+' : '×'}
                  </button>
                )}
              </span>
            )
          })}
          </div>
          <p className="switcher__label">{t('switcher.language')}</p>
          <div className="switcher__row">
            {LANGS.map(([code, label]) => (
              <span key={code} className="switcher-chip">
                <button
                  className={code === lang ? 'active' : ''}
                  onClick={() => onSetLang?.(code)}
                  title={code === 'pt' ? 'Português' : 'English'}
                >
                  {label}
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      <button
        className="theme-switcher__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title="systems & language"
      >
        {open ? '▾' : '▴'}
        <span
          className="switcher-chip__swatch"
          style={{
            background: currentTheme?.palette?.fg ?? 'currentColor',
            boxShadow: `0 0 6px ${currentTheme?.palette?.fg ?? 'currentColor'}`
          }}
          aria-hidden="true"
        />
        {currentTheme?.shortName ?? current} · {(lang ?? 'en').toUpperCase()}
      </button>
    </div>
  )
}
