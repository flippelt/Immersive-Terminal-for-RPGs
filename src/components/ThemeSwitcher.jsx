// Players see only enabled themes. In GM mode every theme is shown with
// a small toggle to enable/disable it for players.
export default function ThemeSwitcher({
  themes,
  current,
  onSelect,
  gmMode,
  disabled,
  onToggleDisabled
}) {
  const visible = gmMode
    ? themes
    : themes.filter((t) => !disabled?.has(t.id) || t.id === current)

  if (visible.length === 0) return null

  return (
    <div className="theme-switcher">
      {visible.map((t) => {
        const isOff = disabled?.has(t.id)
        return (
          <span
            key={t.id}
            className={`switcher-chip${isOff ? ' switcher-chip--off' : ''}`}
          >
            <button
              className={t.id === current ? 'active' : ''}
              onClick={() => onSelect(t)}
              title={t.name}
            >
              {t.id}
            </button>
            {gmMode && (
              <button
                className="switcher-chip__toggle"
                onClick={() => onToggleDisabled(t.id)}
                title={isOff ? 'enable for players' : 'disable for players'}
                aria-label={isOff ? `enable ${t.id}` : `disable ${t.id}`}
              >
                {isOff ? '+' : '×'}
              </button>
            )}
          </span>
        )
      })}
    </div>
  )
}
