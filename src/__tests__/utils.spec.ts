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

  // Text-based list tests (restored)
  it('parses text-based ordered lists correctly', () => {
    const result = parseMarkdown(`1. First item
2. Second item
3. Third item`)
    expect(result).toBe('<ol><li>First item</li><li>Second item</li><li>Third item</li></ol>')
  })

  it('parses text-based unordered lists correctly', () => {
    const result = parseMarkdown(`- First item
- Second item
* Third item`)
    expect(result).toBe('<ul>\n<li>First item</li>\n<li>Second item</li>\n<li>Third item</li>\n</ul>')
  })

  it('handles complex mixed content with missing line numbers correctly', () => {
    // @voqse's exact problematic case - missing line 3, mixed HTML entities and BR tags
    const input = `1. ✅ Bold with **text** or __text__ → &lt;b&gt;text&lt;/b&gt;<br>2. ✅ Italic with *text* or _text_ → &lt;i&gt;text&lt;/i&gt;<br><div><br></div>4. ✅ Bold and nested italic **_extremely_ important** → &lt;b&gt;&lt;i&gt;extremely&lt;/i&gt; important&lt;/b&gt;<br>5. ✅ All bold and italic ***text*** → &lt;b&gt;&lt;i&gt;text&lt;/i&gt;&lt;/b&gt;`
    const result = parseMarkdown(input)

    // Should create one continuous list with all found items (1, 2, 4, 5) in order
    expect(result).toContain('<ol>')
    expect(result).toContain('<li>✅ Bold with <b>text</b> or <b>text</b> → <b>text</b></li>')
    expect(result).toContain('<li>✅ Italic with <i>text</i> or <i>text</i> → <i>text</i></li>')
    expect(result).toContain('<li>✅ Bold and nested italic <b><i>extremely</i> important</b> → <b><i>extremely</i> important</b></li>')
    expect(result).toContain('<li>✅ All bold and italic <b><i>text</i></b> → <b><i>text</i></b></li>')
    expect(result).toContain('</ol>')

    // Should NOT contain multiple separate <ol> elements
    const olCount = (result.match(/<ol>/g) || []).length
    expect(olCount).toBe(1)
  })

  // Tests for div-based lists (contenteditable compatibility)
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

  // Tests for HTML entity handling and br tag normalization
  it('handles HTML entities correctly', () => {
    const result = parseMarkdown('Text with &lt;b&gt;tag&lt;/b&gt; entities')
    expect(result).toBe('Text with <b>tag</b> entities')
  })

  it('normalizes br tags to newlines', () => {
    const result = parseMarkdown('Line 1<br>Line 2<br />Line 3')
    expect(result).toBe('Line 1\nLine 2\nLine 3')
  })

  it('handles complex mixed content with entities and br tags', () => {
    const input = `1. ✅ Bold with **text** or __text__ → &lt;b&gt;text&lt;/b&gt;<br>2. ✅ Italic with *text* or _text_ → &lt;i&gt;text&lt;/i&gt;`
    const result = parseMarkdown(input)
    expect(result).toContain('<ol>')
    expect(result).toContain('<li>✅ Bold with <b>text</b> or <b>text</b> → <b>text</b></li>')
    expect(result).toContain('<li>✅ Italic with <i>text</i> or <i>text</i> → <i>text</i></li>')
    expect(result).toContain('</ol>')
  })

  // Test to prevent empty matches
  it('prevents empty HTML tags with improved regex', () => {
    const result = parseMarkdown('Text with ** and __ and * and _ and ~~ and ~')
    // Should not create empty tags
    expect(result).not.toContain('<b></b>')
    expect(result).not.toContain('<i></i>')
    expect(result).not.toContain('<s></s>')
  })

  it('formatText combines markdown and linkify correctly', () => {
    const result = formatText('Check **this** out: https://example.com')
    expect(result).toContain('<b>this</b>')
    expect(result).toContain('<a href="https://example.com"')
  })
})
