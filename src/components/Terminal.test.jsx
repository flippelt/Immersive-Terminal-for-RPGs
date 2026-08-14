// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, cleanup, fireEvent, act, screen } from '@testing-library/react'
import { composeCustomScenario } from 'rpgterm-engine'
import Terminal from './Terminal.jsx'

vi.mock('../audio/sfx.js', () => ({
  playBeep: vi.fn(),
  playWhoosh: vi.fn(),
  playKeystroke: vi.fn(),
  playGlitch: vi.fn(),
  playPowerOff: vi.fn(),
  setVolume: vi.fn(),
  setMuted: vi.fn(),
  getVolume: () => 0.4,
  isMuted: () => false,
  startHum: vi.fn(),
  stopHum: vi.fn(),
  isHumOn: () => false
}))

// Instant typewriter so smoke tests aren't gated on per-char timers.
vi.mock('../hooks/useTypewriter.js', async () => {
  const { useEffect } = await import('react')
  return {
    useTypewriter: (text, { onDone } = {}) => {
      useEffect(() => { onDone?.() }, [text, onDone])
      return { out: text, done: true }
    }
  }
})

// Progress bars use rAF + performance.now(); complete immediately in smoke.
vi.mock('./ProgressModal.jsx', async () => {
  const { useEffect } = await import('react')
  return {
    default: function ProgressModalStub({ onDone }) {
      useEffect(() => { onDone?.() }, [onDone])
      return null
    }
  }
})

const memory = new Map()
const ls = {
  getItem: (k) => (memory.has(k) ? memory.get(k) : null),
  setItem: (k, v) => memory.set(k, String(v)),
  removeItem: (k) => memory.delete(k),
  clear: () => memory.clear()
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  memory.clear()
})

beforeEach(() => {
  vi.stubGlobal('localStorage', ls)
  vi.useFakeTimers()
})

function testTheme(over = {}) {
  return composeCustomScenario({
    theme: 'ibm',
    id: 'smoke',
    name: 'Smoke',
    boot: [],
    banner: '',
    motd: [],
    crt: { typeSpeed: 1 },
    files: {
      '/readme.md': 'hello from the workstation',
      '/safe.dat':
        '---\nlocked: true\npassword: KEY\ncrackable: true\ncrackDC: 12\ncrackTime: 200\n---\nledger secret',
      '/vault.dat':
        '---\nlocked: true\npassword: OPEN\ncrackable: false\ndecryptGame: true\ndecryptTarget: CIPHER\ndecryptLuck: false\n---\nvault loot'
    },
    ...over
  })
}

async function drain() {
  // Instant/empty boot lines still settle in useEffect; nested typewriter
  // timeouts need a few turns of the fake clock.
  for (let i = 0; i < 20; i++) {
    await act(async () => {
      vi.runOnlyPendingTimers()
    })
  }
}

async function mount(theme = testTheme()) {
  const view = render(
    <Terminal
      theme={theme}
      themes={[theme]}
      lang="en"
      onSwitchTheme={() => {}}
      onSwitchScenario={() => {}}
    />
  )
  await drain()
  return view
}

function typeCommand(text) {
  const input = screen.getByLabelText('terminal input')
  fireEvent.change(input, { target: { value: text } })
  fireEvent.keyDown(input, { key: 'Enter' })
}

describe('Terminal smoke', () => {
  it('boots to a prompt and runs ls / cat', async () => {
    await mount()
    expect(screen.getByLabelText('terminal input')).toBeTruthy()

    typeCommand('ls')
    await drain()
    expect(screen.getByText('readme.md')).toBeTruthy()
    expect(screen.getByText(/safe\.dat/)).toBeTruthy()

    typeCommand('cat readme.md')
    await drain()
    expect(screen.getByText('hello from the workstation')).toBeTruthy()
  })

  it('gates the prompt behind login and accepts the password', async () => {
    await mount(
      testTheme({
        login: {
          title: 'AUTH REQUIRED',
          label: 'password:',
          password: 'HALDEN',
          granted: 'Welcome back',
          denied: 'NOPE'
        }
      })
    )
    expect(screen.queryByLabelText('terminal input')).toBeNull()
    const field = screen.getByLabelText('password:')
    fireEvent.change(field, { target: { value: 'HALDEN' } })
    fireEvent.keyDown(field, { key: 'Enter' })
    await drain()
    expect(screen.getByText('Welcome back')).toBeTruthy()
    expect(screen.getByLabelText('terminal input')).toBeTruthy()
  })

  it('passes a crack roll equal to the DC and opens the file', async () => {
    await mount()
    typeCommand('crack safe.dat')
    await drain()
    const roll = screen.getByLabelText(/roll/i)
    fireEvent.change(roll, { target: { value: '12' } })
    fireEvent.keyDown(roll, { key: 'Enter' })
    await drain()
    expect(screen.getByText('ledger secret')).toBeTruthy()
  })

  it('decrypt Esc cancels and a reopen still works', async () => {
    await mount()
    typeCommand('decrypt vault.dat')
    await drain()
    expect(screen.getByRole('dialog', { name: 'cipher minigame' })).toBeTruthy()

    fireEvent.keyDown(screen.getByLabelText('cipher input'), { key: 'Escape' })
    await drain()
    expect(screen.queryByRole('dialog', { name: 'cipher minigame' })).toBeNull()
    expect(screen.getByLabelText('terminal input')).toBeTruthy()

    typeCommand('decrypt vault.dat')
    await drain()
    expect(screen.getByRole('dialog', { name: 'cipher minigame' })).toBeTruthy()
  })
})
