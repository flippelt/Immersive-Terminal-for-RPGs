import { describe, it, expect } from 'vitest'
import { normalizePath, getNode, listDir } from './filesystem.js'

const fs = {
  '/': { type: 'dir', children: ['readme.txt', 'logs'] },
  '/readme.txt': { type: 'file', content: 'hello' },
  '/logs': { type: 'dir', children: ['a.log', 'b.log'] },
  '/logs/a.log': { type: 'file', content: 'A' },
  '/logs/b.log': { type: 'file', content: 'B' }
}

describe('normalizePath', () => {
  it('resolves relative names against cwd', () => {
    expect(normalizePath('/', 'readme.txt')).toBe('/readme.txt')
    expect(normalizePath('/logs', 'a.log')).toBe('/logs/a.log')
  })
  it('honors absolute targets', () => {
    expect(normalizePath('/logs', '/readme.txt')).toBe('/readme.txt')
  })
  it('collapses . and ..', () => {
    expect(normalizePath('/logs', '..')).toBe('/')
    expect(normalizePath('/logs', '../readme.txt')).toBe('/readme.txt')
    expect(normalizePath('/logs', './a.log')).toBe('/logs/a.log')
  })
  it('clamps .. at root', () => {
    expect(normalizePath('/', '../../x')).toBe('/x')
  })
  it('returns cwd for empty / dot target', () => {
    expect(normalizePath('/logs', '')).toBe('/logs')
    expect(normalizePath('/logs', '.')).toBe('/logs')
  })
})

describe('getNode', () => {
  it('returns nodes and null for misses', () => {
    expect(getNode(fs, '/readme.txt')).toEqual({ type: 'file', content: 'hello' })
    expect(getNode(fs, '/nope')).toBeNull()
    expect(getNode(null, '/x')).toBeNull()
  })
})

describe('listDir', () => {
  it('lists a directory with types and sizes', () => {
    const entries = listDir(fs, '/')
    expect(entries).toEqual([
      { name: 'readme.txt', type: 'file', size: 5 },
      { name: 'logs', type: 'dir', size: null }
    ])
  })
  it('returns null for files / missing paths', () => {
    expect(listDir(fs, '/readme.txt')).toBeNull()
    expect(listDir(fs, '/nope')).toBeNull()
  })
})
