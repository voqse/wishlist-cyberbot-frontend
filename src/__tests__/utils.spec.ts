import { describe, expect, it } from 'vitest'
import { formatText, parseMarkdown } from '../utils'

describe('markdown formatting', () => {
  it('parses italic text correctly with *', () => {
    const result = parseMarkdown('This is *italic* text')
    expect(result).toBe('This is <i>italic</i> text')
  })

  it('parses italic text correctly with _', () => {
    const result = parseMarkdown('This is _italic_ text')
    expect(result).toBe('This is <i>italic</i> text')
  })

  it('parses bold text correctly with **', () => {
    const result = parseMarkdown('This is **bold** text')
    expect(result).toBe('This is <b>bold</b> text')
  })

  it('parses bold text correctly with __', () => {
    const result = parseMarkdown('This is __bold__ text')
    expect(result).toBe('This is <b>bold</b> text')
  })

  it('parses bold-italic text correctly', () => {
    const result = parseMarkdown('This is ***bold-italic*** text')
    expect(result).toBe('This is <b><i>bold-italic</i></b> text')
  })

  it('parses strikethrough text correctly with ~~', () => {
    const result = parseMarkdown('This is ~~strikethrough~~ text')
    expect(result).toBe('This is <s>strikethrough</s> text')
  })

  it('parses strikethrough text correctly with ~', () => {
    const result = parseMarkdown('This is ~strikethrough~ text')
    expect(result).toBe('This is <s>strikethrough</s> text')
  })

  it('parses bold and nested italic correctly', () => {
    const result = parseMarkdown('This text is **_extremely_ important**')
    expect(result).toBe('This text is <b><i>extremely</i> important</b>')
  })

  it('parses nested formatting with different combinations', () => {
    const result = parseMarkdown('Mix of **bold**, _italic_, ~~strikethrough~~ and ***all***')
    expect(result).toBe('Mix of <b>bold</b>, <i>italic</i>, <s>strikethrough</s> and <b><i>all</i></b>')
  })

  it('parses ordered lists correctly', () => {
    const result = parseMarkdown(`1. First item
2. Second item
3. Third item`)
    expect(result).toBe('<ol>\n<li>First item</li>\n<li>Second item</li>\n<li>Third item</li>\n</ol>')
  })

  it('parses unordered lists correctly', () => {
    const result = parseMarkdown(`- First item
- Second item
* Third item`)
    expect(result).toBe('<ul>\n<li>First item</li>\n<li>Second item</li>\n<li>Third item</li>\n</ul>')
  })

  // New tests for div-based lists (contenteditable compatibility)
  it('parses div-based ordered lists correctly', () => {
    const result = parseMarkdown('<div>1. First item</div><div>2. Second item</div><div>3. Third item</div>')
    expect(result).toBe('<ol><li>First item</li><li>Second item</li><li>Third item</li></ol>')
  })

  it('parses div-based unordered lists correctly', () => {
    const result = parseMarkdown('<div>- First item</div><div>* Second item</div><div>- Third item</div>')
    expect(result).toBe('<ul><li>First item</li><li>Second item</li><li>Third item</li></ul>')
  })

  it('handles mixed div-based and text content', () => {
    const result = parseMarkdown('Some text<div>1. First item</div><div>2. Second item</div>More text')
    expect(result).toBe('Some text<ol><li>First item</li><li>Second item</li></ol>More text')
  })

  it('handles div-based lists with formatting inside', () => {
    const result = parseMarkdown('<div>1. **Bold** item</div><div>2. _Italic_ item</div>')
    expect(result).toBe('<ol><li><b>Bold</b> item</li><li><i>Italic</i> item</li></ol>')
  })

  it('does not convert non-list divs', () => {
    const result = parseMarkdown('<div>Regular content</div><div>Another div</div>')
    expect(result).toBe('<div>Regular content</div><div>Another div</div>')
  })

  it('formatText combines markdown and linkify correctly', () => {
    const result = formatText('Check **this** out: https://example.com')
    expect(result).toContain('<b>this</b>')
    expect(result).toContain('<a href="https://example.com"')
  })
})
