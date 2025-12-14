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
