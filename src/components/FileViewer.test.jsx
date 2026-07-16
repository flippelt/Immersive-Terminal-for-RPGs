// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import FileViewer from './FileViewer.jsx'

afterEach(cleanup)

const node = { type: 'file', content: 'line one\nline two' }

describe('FileViewer', () => {
  it('renders the file content and name', () => {
    render(<FileViewer path="/note.txt" node={node} onClose={() => {}} />)
    expect(screen.getByText('line one')).toBeTruthy()
    expect(screen.getByText('line two')).toBeTruthy()
    expect(screen.getByText('/note.txt')).toBeTruthy()
  })

  it('closes via the × button', () => {
    const onClose = vi.fn()
    render(<FileViewer path="/note.txt" node={node} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('closes on Escape', () => {
    const onClose = vi.fn()
    render(<FileViewer path="/note.txt" node={node} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})

const imageNode = {
  type: 'file',
  content: 'dossier body',
  image: '/art/pic.png',
  imageAlt: 'a recon picture'
}

describe('FileViewer with image front-matter (desktop)', () => {
  it('opens the picture in a companion window beside the reader', () => {
    render(<FileViewer path="/intel.dat" node={imageNode} onClose={() => {}} />)
    const dialogs = screen.getAllByRole('dialog')
    expect(dialogs.length).toBe(2)
    // Picture lives in the companion, not inline in the reader.
    const reader = dialogs.find((d) => !d.className.includes('floating-window--image'))
    expect(reader.querySelector('.crt-img')).toBeNull()
    const companion = screen.getByRole('dialog', { name: 'a recon picture' })
    expect(companion.querySelector('.crt-img')?.getAttribute('src')).toBe('/art/pic.png')
    expect(screen.getByText('dossier body')).toBeTruthy()
  })

  it('companion × dismisses only the picture', () => {
    const onClose = vi.fn()
    render(<FileViewer path="/intel.dat" node={imageNode} onClose={onClose} />)
    const companion = screen.getByRole('dialog', { name: 'a recon picture' })
    fireEvent.click(within(companion).getByLabelText('close'))
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getAllByRole('dialog').length).toBe(1)
    expect(screen.getByText('dossier body')).toBeTruthy()
  })
})

describe('FileViewer with image front-matter (mobile)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      })
    )
  })
  afterEach(() => vi.unstubAllGlobals())

  it('keeps the picture inline inside the single modal', () => {
    render(<FileViewer path="/intel.dat" node={imageNode} onClose={() => {}} />)
    const dialogs = screen.getAllByRole('dialog')
    expect(dialogs.length).toBe(1)
    expect(dialogs[0].querySelector('.crt-img')?.getAttribute('src')).toBe('/art/pic.png')
    expect(screen.getByText('dossier body')).toBeTruthy()
  })
})
