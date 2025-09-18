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

export function parseMarkdown(text: string): string {
  let result = text

  // Handle HTML entities and normalize <br> tags to newlines first
  result = result.replace(/<br\s*\/?>/gi, '\n')
  result = result.replace(/&lt;/g, '<')
  result = result.replace(/&gt;/g, '>')
  result = result.replace(/&amp;/g, '&')

  // Clean up empty divs and normalize whitespace
  result = result.replace(/<div>\s*<\/div>/g, '')
  result = result.replace(/<div>\s*<\/div>/g, '')

  // Parse div-based lists first (for contenteditable compatibility)
  // Handle consecutive div elements that contain list patterns

  // Parse div-based ordered lists: <div>1. item</div><div>2. item</div> -> <ol><li>item</li><li>item</li></ol>
  result = result.replace(/(?:<div[^>]*>(\d+\.[^<]+)<\/div>\s*)+/g, (match) => {
    // Extract all div contents that match ordered list pattern
    const divMatches = match.match(/<div[^>]*>(\d+\.[^<]+)<\/div>/g)
    if (!divMatches) return match

    let hasOrderedItems = false
    const listItems = divMatches.map((divMatch) => {
      const content = divMatch.match(/<div[^>]*>(\d+\.([^<]+))<\/div>/)
      if (content && content[2]) {
        hasOrderedItems = true
        return `<li>${content[2].trim()}</li>`
      }
      return null
    }).filter(Boolean)

    if (hasOrderedItems && listItems.length > 0) {
      return `<ol>${listItems.join('')}</ol>`
    }
    return match
  })

  // Parse div-based unordered lists: <div>- item</div><div>* item</div> -> <ul><li>item</li><li>item</li></ul>
  result = result.replace(/(?:<div[^>]*>[-*][^<]+<\/div>\s*)+/g, (match) => {
    // Extract all div contents that match unordered list pattern
    const divMatches = match.match(/<div[^>]*>[-*][^<]+<\/div>/g)
    if (!divMatches) return match

    let hasUnorderedItems = false
    const listItems = divMatches.map((divMatch) => {
      const content = divMatch.match(/<div[^>]*>[-*]([^<]+)<\/div>/)
      if (content && content[1]) {
        hasUnorderedItems = true
        return `<li>${content[1].trim()}</li>`
      }
      return null
    }).filter(Boolean)

    if (hasUnorderedItems && listItems.length > 0) {
      return `<ul>${listItems.join('')}</ul>`
    }
    return match
  })

  // Enhanced text-based ordered list parsing - handle complex content better
  // Simple approach: find all numbered list items and create one list
  const orderedListItems: Array<{ number: number, content: string }> = []
  const lines = result.split('\n')

  for (const line of lines) {
    const trimmedLine = line.trim()
    const match = trimmedLine.match(/^(\d+)\.\s(.+)$/)
    if (match) {
      const number = Number.parseInt(match[1], 10)
      const content = match[2]
      orderedListItems.push({ number, content })
    }
  }

  if (orderedListItems.length > 0) {
    // Sort by number to ensure proper order
    orderedListItems.sort((a, b) => a.number - b.number)

    // Create the complete ordered list
    const listItemsHtml = orderedListItems.map(item => `<li>${item.content}</li>`).join('')
    const completeList = `<ol>${listItemsHtml}</ol>`

    // Remove all individual list items and replace with the complete list
    let hasReplaced = false
    const newLines = lines.map((line) => {
      const trimmedLine = line.trim()
      if (/^\d+\.\s/.test(trimmedLine)) {
        if (!hasReplaced) {
          hasReplaced = true
          return completeList
        }
        return '' // Remove subsequent list items
      }
      return line
    })

    result = newLines.filter(line => line !== '').join('\n')
  }

  // Parse text-based unordered lists (lines starting with - or * followed by space)
  {
    const lines = result.split('\n')
    let inList = false
    const newLines: string[] = []
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (/^[-*]\s/.test(line)) {
        if (!inList) {
          inList = true
          newLines.push('<ul>')
        }
        newLines.push(line.replace(/^[-*]\s(.+)$/, '<li>$1</li>'))
        // If next line is not a list item, close the list
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : ''
        if (!nextLine || !/^[-*]\s/.test(nextLine)) {
          newLines.push('</ul>')
          inList = false
        }
      }
      else {
        if (inList) {
          newLines.push('</ul>')
          inList = false
        }
        newLines.push(line)
      }
    }
    result = newLines.join('\n')
  }

  // Parse strikethrough first (fix regex to prevent empty matches)
  result = result.replace(/~~([^~]+)~~/g, '<s>$1</s>')
  result = result.replace(/~([^~]+)~/g, '<s>$1</s>')

  // Parse bold-italic first (must be before bold and italic)
  result = result.replace(/\*\*\*([^*]+)\*\*\*/g, '<b><i>$1</i></b>')

  // Parse bold (both ** and __)
  result = result.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  result = result.replace(/__([^_]+)__/g, '<b>$1</b>')

  // Parse italic (both * and _), but handle nested italic in bold
  // To avoid matching inside HTML tags, split by tags and only process text nodes
  result = result.split(/(<[^>]+>)/g).map((segment) => {
    // Only process segments that are not HTML tags
    if (segment.startsWith('<') && segment.endsWith('>')) return segment
    // Replace *italic* and _italic_ only outside tags (fix regex to prevent empty matches)
    let s = segment.replace(/\*([^*]+)\*/g, '<i>$1</i>')
    s = s.replace(/_([^_]+)_/g, '<i>$1</i>')
    return s
  }).join('')

  return result
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
