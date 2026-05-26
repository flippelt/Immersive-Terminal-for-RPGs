import { describe, it, expect } from 'vitest'
import { renderMarkdown } from './markdown.js'

describe('renderMarkdown', () => {
  it('renders headings as accent, h1/h2 uppercased', () => {
    expect(renderMarkdown('# title')[0]).toEqual({ text: 'TITLE', type: 'ok' })
    expect(renderMarkdown('### sub')[0]).toEqual({ text: 'sub', type: 'ok' })
  })
  it('turns --- into a divider line', () => {
    const r = renderMarkdown('---')[0]
    expect(r.type).toBe('muted')
    expect(r.text.startsWith('─')).toBe(true)
  })
  it('renders blockquotes with a bar', () => {
    expect(renderMarkdown('> heed me')[0]).toEqual({ text: '▌ heed me', type: 'muted' })
  })
  it('renders list items as bullets', () => {
    expect(renderMarkdown('- one')[0]).toEqual({ text: '• one' })
  })
  it('uppercases inline bold and strips italic/code markers', () => {
    expect(renderMarkdown('a **loud** and *soft* and `code`')[0].text).toBe(
      'a LOUD and soft and code'
    )
  })
  it('passes plain lines through', () => {
    expect(renderMarkdown('just text')[0]).toEqual({ text: 'just text' })
  })
})
