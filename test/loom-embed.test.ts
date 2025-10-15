import { describe, it, expect } from 'vitest'
import { convertLoomUrlToEmbed } from '../lib/utils'

describe('convertLoomUrlToEmbed', () => {
  it('should convert basic Loom share URL to embed URL', () => {
    const input = 'https://loom.com/share/abc123'
    const expected = 'https://loom.com/embed/abc123'
    expect(convertLoomUrlToEmbed(input)).toBe(expected)
  })

  it('should convert Loom share URL with www to embed URL', () => {
    const input = 'https://www.loom.com/share/xyz789'
    const expected = 'https://loom.com/embed/xyz789'
    expect(convertLoomUrlToEmbed(input)).toBe(expected)
  })

  it('should return the same URL if already an embed URL', () => {
    const input = 'https://loom.com/embed/def456'
    const expected = 'https://loom.com/embed/def456'
    expect(convertLoomUrlToEmbed(input)).toBe(expected)
  })

  it('should return null for non-Loom URLs', () => {
    const input = 'https://youtube.com/watch?v=abc123'
    expect(convertLoomUrlToEmbed(input)).toBeNull()
  })

  it('should return null for empty string', () => {
    const input = ''
    expect(convertLoomUrlToEmbed(input)).toBeNull()
  })

  it('should return null for null input', () => {
    const input = null as any
    expect(convertLoomUrlToEmbed(input)).toBeNull()
  })

  it('should return null for undefined input', () => {
    const input = undefined as any
    expect(convertLoomUrlToEmbed(input)).toBeNull()
  })

  it('should handle URLs with additional parameters', () => {
    const input = 'https://loom.com/share/abc123?t=123'
    const expected = 'https://loom.com/embed/abc123'
    expect(convertLoomUrlToEmbed(input)).toBe(expected)
  })

  it('should handle URLs with fragments', () => {
    const input = 'https://loom.com/share/abc123#section1'
    const expected = 'https://loom.com/embed/abc123'
    expect(convertLoomUrlToEmbed(input)).toBe(expected)
  })
})
