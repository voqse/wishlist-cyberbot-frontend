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

  // Parse strikethrough first
  result = result.replace(/~~([^~]+)~~/g, '<s>$1</s>')
  result = result.replace(/~([^~]+)~/g, '<s>$1</s>')

  // Parse bold-italic first (must be before bold and italic)
  result = result.replace(/\*\*\*([^*]+)\*\*\*/g, '<b><i>$1</i></b>')

  // Parse bold (both ** and __)
  result = result.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
  result = result.replace(/__([^_]+)__/g, '<b>$1</b>')

  // Parse italic (both * and _), but handle nested italic in bold
  // To avoid matching inside HTML tags, split by tags and only process text nodes
  result = result.split(/(<[^>]+>)/g).map((segment, idx) => {
    // Only process segments that are not HTML tags
    if (segment.startsWith('<') && segment.endsWith('>')) return segment;
    // Replace *italic* and _italic_ only outside tags
    let s = segment.replace(/\*([^*]+)\*/g, '<i>$1</i>');
    s = s.replace(/_([^_]+)_/g, '<i>$1</i>');
    return s;
  }).join('');

  // Parse ordered lists (lines starting with numbers followed by a dot and space)
  {
    const lines = result.split('\n');
    let inList = false;
    let newLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\d+\.\s+/.test(line)) {
        if (!inList) {
          inList = true;
          newLines.push('<ol>');
        }
        newLines.push(line.replace(/^\d+\.\s+(.+)$/, '<li>$1</li>'));
        // If next line is not a list item, close the list
        if (i + 1 >= lines.length || !/^\d+\.\s+/.test(lines[i + 1])) {
          newLines.push('</ol>');
          inList = false;
        }
      } else {
        newLines.push(line);
      }
    }
    result = newLines.join('\n');
  }

  // Parse unordered lists (lines starting with - or * followed by space)
  // Group consecutive unordered list items into a single <ul>
  result = result.split('\n').reduce<{ lines: string[], inList: boolean }>((acc, line) => {
    const unorderedListItem = /^(\s*)[-*]\s+(.+)$/.exec(line);
    if (unorderedListItem) {
      if (!acc.inList) {
        acc.lines.push('<ul>');
        acc.inList = true;
      }
      acc.lines.push(`<li>${unorderedListItem[2]}</li>`);
    } else {
      if (acc.inList) {
        acc.lines.push('</ul>');
        acc.inList = false;
      }
      acc.lines.push(line);
    }
    return acc;
  }, { lines: [], inList: false }).lines.concat(
    // Close list if file ends with a list
    (result.endsWith('\n') ? [] : (result.match(/^(\s*)[-*]\s+(.+)$/) ? ['</ul>'] : []))
  ).join('\n');
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
