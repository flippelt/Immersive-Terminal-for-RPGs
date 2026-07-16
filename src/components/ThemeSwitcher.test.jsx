// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import ThemeSwitcher from './ThemeSwitcher.jsx'

afterEach(cleanup)

const themes = [
  { id: 'lancer', name: 'Lancer' },
  { id: 'alien', name: 'Alien' }
]

function open() {
  fireEvent.click(screen.getByTitle('systems & language'))
}

describe('ThemeSwitcher', () => {
  it('opens the panel without a per-player toggle when GM is off', () => {
    render(
      <ThemeSwitcher
        themes={themes}
        current="lancer"
        onSelect={() => {}}
        gmMode={false}
        disabled={new Set()}
        onToggleDisabled={() => {}}
        lang="en"
        onSetLang={() => {}}
      />
    )
    open()
    expect(screen.getByText('system')).toBeTruthy()
    expect(screen.queryByLabelText('disable alien')).toBeNull()
  })

  // Regression: the theme .map() param used to shadow the `t` translation
  // function, so the GM per-player toggle's title/aria — the only spot that
  // called t() inside the map — threw "t is not a function" and blanked the
  // screen the moment the panel opened with GM on.
  it('renders the per-player toggle in GM mode without crashing', () => {
    render(
      <ThemeSwitcher
        themes={themes}
        current="lancer"
        onSelect={() => {}}
        gmMode
        disabled={new Set(['alien'])}
        onToggleDisabled={() => {}}
        lang="pt"
        onSetLang={() => {}}
      />
    )
    open()
    // Disabled theme offers "enable for players"; enabled one offers "disable".
    expect(screen.getByLabelText('enable alien')).toBeTruthy()
    expect(screen.getByLabelText('disable lancer')).toBeTruthy()
    // PT translation flows through the (no-longer-shadowed) t function.
    expect(screen.getByTitle('habilitar para jogadores')).toBeTruthy()
  })

  it('toggles a theme for players via the GM control', () => {
    const onToggleDisabled = vi.fn()
    render(
      <ThemeSwitcher
        themes={themes}
        current="lancer"
        onSelect={() => {}}
        gmMode
        disabled={new Set()}
        onToggleDisabled={onToggleDisabled}
        lang="en"
        onSetLang={() => {}}
      />
    )
    open()
    fireEvent.click(screen.getByLabelText('disable alien'))
    expect(onToggleDisabled).toHaveBeenCalledWith('alien')
  })
})
