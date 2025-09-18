import type { User } from '@/api/types'

// Simple utility functions - already optimal
export function clamp(number: number, min: number, max: number): number {
  return Math.min(Math.max(number, min), max)
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export function formatUsername(user: User): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || `@${user.username}`
}

// Optimized tokenization with single-pass parsing
interface Token {
  type: 'div' | 'text' | 'empty_div'
  content: string
  raw: string
}

interface ListItem {
  type: 'ordered' | 'unordered'
  number?: number
  content: string
}

// Precompiled regex patterns for better performance
const DIV_REGEX = /<div[^>]*>(.*?)<\/div>/gs
const EMPTY_DIV_REGEX = /^\s*(?:<br\s*\/?>\s*|<\/br>\s*)?$/i
const ORDER_LIST_REGEX = /^(\d+)\.\s(.+)$/
const UNORDER_LIST_REGEX = /^[-*]\s(.+)$/

function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // Reset regex lastIndex for global regex
  DIV_REGEX.lastIndex = 0

  // eslint-disable-next-line no-cond-assign
  while ((match = DIV_REGEX.exec(text)) !== null) {
    // Add text before this div if any
    if (match.index > lastIndex) {
      const textContent = text.slice(lastIndex, match.index)
      if (textContent.trim()) {
        tokens.push({
          type: 'text',
          content: textContent,
          raw: textContent,
        })
      }
    }

    const divContent = match[1]
    const rawDiv = match[0]

    // Check if it's an empty div using precompiled regex
    if (EMPTY_DIV_REGEX.test(divContent)) {
      tokens.push({
        type: 'empty_div',
        content: '',
        raw: rawDiv,
      })
    }
    else {
      tokens.push({
        type: 'div',
        content: divContent,
        raw: rawDiv,
      })
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text if any
  if (lastIndex < text.length) {
    const textContent = text.slice(lastIndex)
    if (textContent.trim()) {
      tokens.push({
        type: 'text',
        content: textContent,
        raw: textContent,
      })
    }
  }

  return tokens
}

// Optimized inline markdown with compiled patterns and reduced operations
const MARKDOWN_PATTERNS = [
  // Strikethrough (order matters)
  { regex: /~~([^~]+)~~/g, replacement: '<s>$1</s>' },
  { regex: /\B~([^~\s][^~]*[^~\s])~\B/g, replacement: '<s>$1</s>' },
  // Bold-italic
  { regex: /\*\*\*([^*]+)\*\*\*/g, replacement: '<b><i>$1</i></b>' },
  // Bold
  { regex: /\*\*([^*]+)\*\*/g, replacement: '<b>$1</b>' },
  { regex: /__([^_]+)__/g, replacement: '<b>$1</b>' },
] as const

function applyInlineMarkdown(text: string): string {
  let result = text

  // Apply patterns in order
  for (const pattern of MARKDOWN_PATTERNS) {
    result = result.replace(pattern.regex, pattern.replacement)
  }

  // Italic patterns require special handling to avoid conflicts with HTML tags
  result = result.split(/(<[^>]+>)/g).map((segment) => {
    if (segment.startsWith('<') && segment.endsWith('>')) return segment

    // Apply italic formatting with single replace operation
    return segment
      .replace(/(^|[^*])\*([^*\s][^*]*[^*\s])\*(?!\*)/g, '$1<i>$2</i>')
      .replace(/(^|[^_])_([^_\s][^_]*[^_\s])_(?!_)/g, '$1<i>$2</i>')
  }).join('')

  return result
}

// Recursive helper function for processing consecutive list items
function processConsecutiveListItems(tokens: Token[], startIndex: number): {
  listHtml: string
  nextIndex: number
} {
  const listItems: ListItem[] = []
  let i = startIndex
  let isOrderedList: boolean | null = null

  while (i < tokens.length) {
    const token = tokens[i]

    if (token.type !== 'div' || !token.content.trim()) {
      break
    }

    const content = token.content.trim()
    const orderedMatch = ORDER_LIST_REGEX.exec(content)
    const unorderedMatch = UNORDER_LIST_REGEX.exec(content)

    // Determine list type from first item or check consistency
    if (orderedMatch) {
      if (isOrderedList === null) {
        isOrderedList = true
      }
      else if (!isOrderedList) {
        break // Different list type - stop grouping
      }

      listItems.push({
        type: 'ordered',
        number: Number.parseInt(orderedMatch[1], 10),
        content: orderedMatch[2],
      })
    }
    else if (unorderedMatch) {
      if (isOrderedList === null) {
        isOrderedList = false
      }
      else if (isOrderedList) {
        break // Different list type - stop grouping
      }

      listItems.push({
        type: 'unordered',
        content: unorderedMatch[1],
      })
    }
    else {
      break // Not a list item - stop grouping
    }

    i++
  }

  if (listItems.length === 0) {
    return { listHtml: '', nextIndex: startIndex }
  }

  // Generate list HTML efficiently
  if (isOrderedList) {
    // Sort by number for ordered lists
    listItems.sort((a, b) => (a.number || 0) - (b.number || 0))
  }

  const listItemsHtml = listItems
    .map(item => `<li>${applyInlineMarkdown(item.content)}</li>`)
    .join('')

  const listHtml = isOrderedList
    ? `<ol>${listItemsHtml}</ol>`
    : `<ul>${listItemsHtml}</ul>`

  return { listHtml, nextIndex: i }
}

export function parseMarkdown(text: string): string {
  const tokens = tokenize(text)
  const result: string[] = []
  let i = 0

  while (i < tokens.length) {
    const token = tokens[i]

    // Check for list items using optimized helper
    if (token.type === 'div' && token.content.trim()) {
      const content = token.content.trim()

      if (ORDER_LIST_REGEX.test(content) || UNORDER_LIST_REGEX.test(content)) {
        const { listHtml, nextIndex } = processConsecutiveListItems(tokens, i)
        if (listHtml) {
          result.push(listHtml)
          i = nextIndex
          continue
        }
      }
    }

    // Process non-list tokens
    if (token.type === 'empty_div') {
      result.push(token.raw)
    }
    else if (token.type === 'div') {
      result.push(`<div>${applyInlineMarkdown(token.content)}</div>`)
    }
    else if (token.type === 'text' && token.content.trim()) {
      result.push(applyInlineMarkdown(token.content))
    }

    i++
  }

  return result.join('')
}

// Optimized linkify with single regex operation
const URL_REGEX = /(\b(?:https?|ftp|file):\/\/[\w+&@#/%?=~|!:,.;-]*[\w+&@#/%=~|-])|(\bwww\.[\w+&@#/%?=~|!:,.;-]*[\w+&@#/%=~|-])/gi

export function linkify(text: string): string {
  return text.replace(URL_REGEX, (url) => {
    const href = url.startsWith('www.') ? `http://${url}` : url
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`
  })
}

export function formatText(text: string): string {
  return linkify(parseMarkdown(text))
}
