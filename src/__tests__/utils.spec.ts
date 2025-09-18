import { describe, expect, it } from 'vitest'
import { formatText, parseMarkdown } from '../utils'

describe('markdown formatting', () => {
  it('parses italic text correctly', () => {
    const result = parseMarkdown('This is *italic* text')
    expect(result).toBe('This is <em>italic</em> text')
  })

  it('parses bold text correctly', () => {
    const result = parseMarkdown('This is **bold** text')
    expect(result).toBe('This is <strong>bold</strong> text')
  })

  it('parses bold-italic text correctly', () => {
    const result = parseMarkdown('This is ***bold-italic*** text')
    expect(result).toBe('This is <strong><em>bold-italic</em></strong> text')
  })

  it('parses ordered lists correctly', () => {
    const result = parseMarkdown(`1. First item
2. Second item
3. Third item`)
    expect(result).toBe('<ol><li>First item</li>\n<li>Second item</li>\n<li>Third item</li></ol>')
  })

  it('parses unordered lists correctly', () => {
    const result = parseMarkdown(`- First item
- Second item
* Third item`)
    expect(result).toBe('<ul><li>First item</li>\n<li>Second item</li>\n<li>Third item</li></ul>')
  })

  it('formatText combines markdown and linkify correctly', () => {
    const result = formatText('Check **this** out: https://example.com')
    expect(result).toContain('<strong>this</strong>')
    expect(result).toContain('<a href="https://example.com"')
  })
})