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

  // Tests for div-based lists (contenteditable compatibility)
  it('parses div-based ordered lists correctly', () => {
    const result = parseMarkdown('<div>1. First item</div><div>2. Second item</div><div>3. Third item</div>')
    expect(result).toBe('<ol><li>First item</li><li>Second item</li><li>Third item</li></ol>')
  })

  it('parses div-based unordered lists correctly with -', () => {
    const result = parseMarkdown('<div>- First item</div><div>- Second item</div><div>- Third item</div>')
    expect(result).toBe('<ul><li>First item</li><li>Second item</li><li>Third item</li></ul>')
  })

  it('parses div-based unordered lists correctly with *', () => {
    const result = parseMarkdown('<div>* First item</div><div>* Second item</div><div>* Third item</div>')
    expect(result).toBe('<ul><li>First item</li><li>Second item</li><li>Third item</li></ul>')
  })

  it('handles mixed div-based unordered lists (- and *)', () => {
    const result = parseMarkdown('<div>- First item</div><div>* Second item</div><div>- Third item</div>')
    expect(result).toBe('<ul><li>First item</li><li>Second item</li><li>Third item</li></ul>')
  })

  it('handles div-based lists with formatting inside', () => {
    const result = parseMarkdown('<div>1. **Bold** item</div><div>2. _Italic_ item</div>')
    expect(result).toBe('<ol><li><b>Bold</b> item</li><li><i>Italic</i> item</li></ol>')
  })

  it('does not convert non-list divs', () => {
    const result = parseMarkdown('<div>Regular content</div><div>Another div</div>')
    expect(result).toBe('<div>Regular content</div><div>Another div</div>')
  })

  it('ignores empty divs with <br>', () => {
    const result = parseMarkdown('<div>Content</div><div><br></div><div>More content</div>')
    expect(result).toBe('<div>Content</div><div>More content</div>')
  })

  it('ignores empty divs with </br>', () => {
    const result = parseMarkdown('<div>Content</div><div></br></div><div>More content</div>')
    expect(result).toBe('<div>Content</div><div>More content</div>')
  })

  it('handles div lists separated by empty divs', () => {
    const result = parseMarkdown('<div>1. First item</div><div><br></div><div>2. Second item</div>')
    expect(result).toBe('<ol><li>First item</li><li>Second item</li></ol>')
  })

  it('applies markdown formatting to div content', () => {
    const result = parseMarkdown('<div>This **bold** text in div</div>')
    expect(result).toBe('<div>This <b>bold</b> text in div</div>')
  })

  it('handles complex @voqse case with missing line 3', () => {
    const input = '<div>1. ✅ Bold with **text** or __text__ → <b>text</b></div><div>2. ✅ Italic with *text* or _text_ → <i>text</i></div><div><br></div><div>4. ✅ Bold and nested italic **_extremely_ important** → <b><i>extremely</i> important</b></div><div>5. ✅ All bold and italic ***text*** → <b><i>text</i></b></div>'
    const result = parseMarkdown(input)

    // Should create one continuous list with all items in order
    expect(result).toBe('<ol><li>✅ Bold with <b>text</b> or <b>text</b> → <b>text</b></li><li>✅ Italic with <i>text</i> or <i>text</i> → <i>text</i></li><li>✅ Bold and nested italic <b><i>extremely</i> important</b> → <b><i>extremely</i> important</b></li><li>✅ All bold and italic <b><i>text</i></b> → <b><i>text</i></b></li></ol>')
  })

  it('handles mixed content with divs and text', () => {
    const result = parseMarkdown('Some text<div>1. List item</div>More text<div>2. Another item</div>End text')
    expect(result).toBe('Some text<ol><li>List item</li><li>Another item</li></ol>More textEnd text')
  })

  it('validates closing tags for markdown elements', () => {
    expect(parseMarkdown('**bold')).toBe('**bold') // No closing, should not format
    expect(parseMarkdown('*italic')).toBe('*italic') // No closing, should not format
    expect(parseMarkdown('~~strike')).toBe('~~strike') // No closing, should not format
  })

  it('handles nested lists correctly by type separation', () => {
    const input = '<div>1. First ordered</div><div>- Unordered item</div><div>2. Second ordered</div>'
    // Should group all ordered items together and all unordered items together
    const expected = '<ol><li>First ordered</li><li>Second ordered</li></ol><ul><li>Unordered item</li></ul>'
    expect(parseMarkdown(input)).toBe(expected)
  })

  it('formatText combines markdown and linkify correctly', () => {
    const result = formatText('Check **this** out: https://example.com')
    expect(result).toContain('<b>this</b>')
    expect(result).toContain('<a href="https://example.com"')
  })

  it('handles lists with gaps in numbering correctly', () => {
    const result = parseMarkdown('<div>1. First</div><div>3. Third</div><div>5. Fifth</div>')
    expect(result).toBe('<ol><li>First</li><li>Third</li><li>Fifth</li></ol>')
  })

  it('processes markdown inside list items after list creation', () => {
    const result = parseMarkdown('<div>1. Item with **bold** and *italic*</div>')
    expect(result).toBe('<ol><li>Item with <b>bold</b> and <i>italic</i></li></ol>')
  })

  it('ignores unclosed markdown elements', () => {
    const result = parseMarkdown('**unclosed bold and *unclosed italic and ~~unclosed strike')
    expect(result).toBe('**unclosed bold and *unclosed italic and ~~unclosed strike')
  })
})
