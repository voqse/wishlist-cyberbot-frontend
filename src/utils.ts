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
  result = result.replace(/\*([^*]+)\*/g, '<i>$1</i>')
  result = result.replace(/_([^_]+)_/g, '<i>$1</i>')

  // Parse ordered lists (lines starting with numbers followed by a dot and space)
  const orderedListRegex = /^(\d+\.\s.+$\n?)+/gm
  result = result.replace(orderedListRegex, (match) => {
    const items = match.trim().replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
    return `<ol>${items}</ol>`
  })

  // Parse unordered lists (lines starting with - or * followed by space)
  const unorderedListRegex = /^([-*]\s.+$\n?)+/gm
  result = result.replace(unorderedListRegex, (match) => {
    const items = match.trim().replace(/^[-*]\s(.+)$/gm, '<li>$1</li>')
    return `<ul>${items}</ul>`
  })

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
