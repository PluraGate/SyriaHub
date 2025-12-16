import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripMarkdown(markdown: string): string {
  if (!markdown) return ''
  return markdown
    // Remove headers
    .replace(/^#+\s+/gm, '')
    // Remove images
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove links (keep text)
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove bold/italic
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove horizontal rules
    .replace(/^-{3,}$/gm, '')
    // Simplify whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

export function getInitials(name?: string, email?: string): string {
  if (name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }
  if (email) {
    return email[0].toUpperCase()
  }
  return 'U'
}

export function getAvatarGradient(id?: string): string {
  if (!id) return 'avatar-gradient-1'
  const gradients = [
    'avatar-gradient-1', 'avatar-gradient-2', 'avatar-gradient-3', 'avatar-gradient-4',
    'avatar-gradient-5', 'avatar-gradient-6', 'avatar-gradient-7', 'avatar-gradient-8',
  ]
  const index = id.charCodeAt(0) % gradients.length
  return gradients[index]
}
