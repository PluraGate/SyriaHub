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
export function inferResourceType(mimeType?: string, fileName?: string, title?: string): string | null {
  const mime = mimeType?.toLowerCase() || '';
  const ext = fileName?.split('.').pop()?.toLowerCase() || '';
  const lowerTitle = title?.toLowerCase() || '';

  // 1. Inference from MIME/Extension
  if (mime.includes('pdf') || ['doc', 'docx', 'pdf', 'txt', 'rtf'].includes(ext)) return 'paper';
  if (mime.includes('csv') || mime.includes('excel') || mime.includes('spreadsheet') || mime.includes('json') || ['csv', 'xlsx', 'xls', 'json', 'tsv'].includes(ext)) return 'dataset';
  if (mime.includes('image') || mime.includes('video') || mime.includes('audio') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'mp4', 'mov', 'mp3', 'wav'].includes(ext)) return 'media';
  if (['zip', 'tar', 'gz', 'exe', 'sh', 'py', 'js', 'ipynb'].includes(ext)) return 'tool';

  // 2. Inference from Title keywords
  if (['report', 'study', 'paper', 'article', 'document', 'research', 'guide', 'publication'].some(k => lowerTitle.includes(k))) return 'paper';
  if (['dataset', 'data', 'statistics', 'stats', 'database', 'excel', 'spreadsheet', 'csv', 'registry'].some(k => lowerTitle.includes(k))) return 'dataset';
  if (['tool', 'app', 'software', 'script', 'plugin', 'calculator', 'utility', 'library'].some(k => lowerTitle.includes(k))) return 'tool';
  if (['kit', 'media', 'collection', 'pack', 'images', 'video', 'audio', 'visual', 'gallery'].some(k => lowerTitle.includes(k))) return 'media';
  if (['template', 'format', 'form', 'structure', 'framework', 'boilerplate'].some(k => lowerTitle.includes(k))) return 'template';

  return null;
}
