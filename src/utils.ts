import type { User } from '@/api/types'

export function clamp(number: number, min: number, max: number) {
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

export function formatUsername(user: User) {
  return [
    user.firstName,
    user.lastName,
  ].filter(Boolean).join(' ') || `@${user.username}`
}

// Token types for AST-based parsing
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

function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  let remaining = text

  while (remaining.length > 0) {
    // Match div elements first
    const divMatch = remaining.match(/^<div[^>]*>(.*?)<\/div>/s)
    if (divMatch) {
      const divContent = divMatch[1]
      const rawDiv = divMatch[0]

      // Check if it's an empty div (contains only <br>, </br>, or whitespace)
      if (/^\s*(?:<br\s*\/?>\s*|<\/br>\s*)?$/i.test(divContent)) {
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
      remaining = remaining.slice(divMatch[0].length)
    }
    else {
      // Find the next div or take the rest as text
      const nextDivIndex = remaining.search(/<div[^>]*>/i)
      if (nextDivIndex > 0) {
        const textContent = remaining.slice(0, nextDivIndex)
        tokens.push({
          type: 'text',
          content: textContent,
          raw: textContent,
        })
        remaining = remaining.slice(nextDivIndex)
      }
      else {
        // No more divs, rest is text
        tokens.push({
          type: 'text',
          content: remaining,
          raw: remaining,
        })
        remaining = ''
      }
    }
  }

  return tokens
}

function applyInlineMarkdown(text: string): string {
  let result = text

  // Apply markdown formatting with proper closing tag validation
  // Order is important: strikethrough -> bold-italic -> bold -> italic

  // Strikethrough (~~text~~ and ~text~)
  result = result.replace(/~~([^~]+)~~/g, '<s>$1</s>')
  // Use a compatible regex for single-tilde strikethrough (no lookbehind/lookahead)
  result = result.replace(/\B~([^~\s][^~]*[^~\s])~\B/g, '<s>$1</s>')

  // Bold-italic (***text***)
  result = result.replace(/\*\*\*([^*]+)\*\*\*/g, '<b><i>$1</i></b>')

  // Bold (**text** and __text__)
  result = result.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  result = result.replace(/__([^_]+)__/g, '<b>$1</b>')

  // Italic (*text* and _text_) - avoid matching inside existing tags
  result = result.split(/(<[^>]+>)/g).map((segment) => {
    // Only process segments that are not HTML tags
    if (segment.startsWith('<') && segment.endsWith('>')) return segment

    // Apply italic formatting
    // Replace *text* with <i>text</i>, but not **text** or ***text***
    let s = segment.replace(/(^|[^*])\*([^*\s][^*]*[^*\s])\*(?!\*)/g, (match, p1, p2) => {
      return `${p1}<i>${p2}</i>`
    })
    // Replace _text_ with <i>text</i>, but not __text__ or ___text___
    s = s.replace(/(^|[^_])_([^_\s][^_]*[^_\s])_(?!_)/g, (match, p1, p2) => {
      return `${p1}<i>${p2}</i>`
    })
    return s
  }).join('')

  return result
}

export function parseMarkdown(text: string): string {
  // Step 1: Tokenize the input
  const tokens = tokenize(text)

  // Step 2: Group consecutive list items only
  const result: string[] = []
  let i = 0

  while (i < tokens.length) {
    const token = tokens[i]

    if (token.type === 'div' && token.content.trim()) {
      const content = token.content.trim()
      const orderedMatch = content.match(/^(\d+)\.\s(.+)$/)
      const unorderedMatch = content.match(/^[-*]\s(.+)$/)

      if (orderedMatch || unorderedMatch) {
        // Found start of a list - collect consecutive list items of the same type
        const listItems: ListItem[] = []
        const isOrderedList = Boolean(orderedMatch)

        // Add the first item
        if (orderedMatch) {
          listItems.push({
            type: 'ordered',
            number: Number.parseInt(orderedMatch[1], 10),
            content: orderedMatch[2],
          })
        }
        else if (unorderedMatch) {
          listItems.push({
            type: 'unordered',
            content: unorderedMatch[1],
          })
        }

        // Look ahead for consecutive list items of the same type
        let j = i + 1
        while (j < tokens.length) {
          const nextToken = tokens[j]

          if (nextToken.type === 'div' && nextToken.content.trim()) {
            const nextContent = nextToken.content.trim()
            const nextOrderedMatch = nextContent.match(/^(\d+)\.\s(.+)$/)
            const nextUnorderedMatch = nextContent.match(/^[-*]\s(.+)$/)

            // Check if it's the same type of list
            if (isOrderedList && nextOrderedMatch) {
              listItems.push({
                type: 'ordered',
                number: Number.parseInt(nextOrderedMatch[1], 10),
                content: nextOrderedMatch[2],
              })
              j++
            }
            else if (!isOrderedList && nextUnorderedMatch) {
              listItems.push({
                type: 'unordered',
                content: nextUnorderedMatch[1],
              })
              j++
            }
            else {
              // Different content type - break the consecutive sequence
              break
            }
          }
          else {
            // Non-div content or empty div - break the consecutive sequence
            break
          }
        }

        // Generate the list HTML
        if (isOrderedList) {
          listItems.sort((a, b) => (a.number || 0) - (b.number || 0))
          const listHtml = listItems.map(item =>
            `<li>${applyInlineMarkdown(item.content)}</li>`,
          ).join('')
          result.push(`<ol>${listHtml}</ol>`)
        }
        else {
          const listHtml = listItems.map(item =>
            `<li>${applyInlineMarkdown(item.content)}</li>`,
          ).join('')
          result.push(`<ul>${listHtml}</ul>`)
        }

        // Move to the next unprocessed token
        i = j
        continue
      }
    }

    // Not a list item - process normally
    if (token.type === 'empty_div') {
      // Preserve empty divs as intentional empty lines
      result.push(token.raw)
    }
    else if (token.type === 'div') {
      // Regular div content with markdown formatting applied
      result.push(`<div>${applyInlineMarkdown(token.content)}</div>`)
    }
    else if (token.type === 'text' && token.content.trim()) {
      // Text content with markdown formatting applied
      result.push(applyInlineMarkdown(token.content))
    }

    i++
  }

  return result.join('')
}

export function linkify(text: string) {
  const urlRegex = /(\b(https?|ftp|file):\/\/[\w+&@#/%?=~|!:,.;-]*[\w+&@#/%=~|-])|(\bwww\.[\w+&@#/%?=~|!:,.;-]*[\w+&@#/%=~|-])/gi
  return text.replace(urlRegex, (url) => {
    const href = url.startsWith('www.') ? `http://${url}` : url
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`
  })
}

export function formatText(text: string): string {
  // First apply markdown parsing, then linkify
  return linkify(parseMarkdown(text))
}
