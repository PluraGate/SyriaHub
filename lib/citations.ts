/**
 * Academic Citation Export Module
 * Generates BibTeX, RIS, and other citation formats from post data
 */

export interface CitationData {
    id: string
    title: string
    author: {
        name?: string
        email?: string
        affiliation?: string
    }
    abstract?: string
    content?: string
    tags?: string[]
    created_at: string
    updated_at?: string
    url?: string
    doi?: string
    license?: string
}

/**
 * Generate a citation key from title and author
 */
function generateCiteKey(data: CitationData): string {
    const authorPart = (data.author?.name || 'unknown')
        .split(' ')
        .pop()
        ?.toLowerCase()
        .replace(/[^a-z]/g, '') || 'unknown'

    const year = new Date(data.created_at).getFullYear()

    const titlePart = (data.title || 'untitled')
        .split(' ')
        .slice(0, 2)
        .join('')
        .toLowerCase()
        .replace(/[^a-z]/g, '')
        .slice(0, 10)

    return `${authorPart}${year}${titlePart}`
}

/**
 * Format author name for BibTeX (Last, First)
 */
function formatAuthorBibTeX(author: CitationData['author']): string {
    if (!author?.name) return 'Unknown Author'

    const parts = author.name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0]

    const lastName = parts.pop()
    const firstName = parts.join(' ')
    return `${lastName}, ${firstName}`
}

/**
 * Format author name for RIS (Last,First)
 */
function formatAuthorRIS(author: CitationData['author']): string {
    if (!author?.name) return 'Unknown Author'

    const parts = author.name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0]

    const lastName = parts.pop()
    const firstName = parts.join(' ')
    return `${lastName},${firstName}`
}

/**
 * Escape special characters for BibTeX
 */
function escapeBibTeX(text: string): string {
    return text
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/&/g, '\\&')
        .replace(/%/g, '\\%')
        .replace(/\$/g, '\\$')
        .replace(/#/g, '\\#')
        .replace(/_/g, '\\_')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}')
}

/**
 * Get abstract from content (first 300 chars of content)
 */
function getAbstract(data: CitationData): string {
    if (data.abstract) return data.abstract
    if (!data.content) return ''

    // Remove markdown formatting and truncate
    const plainText = data.content
        .replace(/[#*_`\[\]]/g, '')
        .replace(/\n+/g, ' ')
        .trim()

    if (plainText.length <= 300) return plainText
    return plainText.slice(0, 297) + '...'
}

// ==================== BibTeX Export ====================

/**
 * Generate BibTeX citation
 * @article{citekey,
 *   author = {Last, First},
 *   title = {Title},
 *   year = {2024},
 *   ...
 * }
 */
export function generateBibTeX(data: CitationData): string {
    const citeKey = generateCiteKey(data)
    const date = new Date(data.created_at)
    const abstract = getAbstract(data)

    const fields: string[] = []

    fields.push(`  author = {${formatAuthorBibTeX(data.author)}}`)
    fields.push(`  title = {${escapeBibTeX(data.title)}}`)
    fields.push(`  year = {${date.getFullYear()}}`)
    fields.push(`  month = {${date.toLocaleString('en', { month: 'short' }).toLowerCase()}}`)

    if (data.url) {
        fields.push(`  url = {${data.url}}`)
    }

    if (data.doi) {
        fields.push(`  doi = {${data.doi}}`)
    }

    if (abstract) {
        fields.push(`  abstract = {${escapeBibTeX(abstract)}}`)
    }

    if (data.tags && data.tags.length > 0) {
        fields.push(`  keywords = {${data.tags.join(', ')}}`)
    }

    if (data.author?.affiliation) {
        fields.push(`  institution = {${escapeBibTeX(data.author.affiliation)}}`)
    }

    fields.push(`  note = {Published on SyriaHub}`)

    return `@article{${citeKey},\n${fields.join(',\n')}\n}`
}

// ==================== RIS Export ====================

/**
 * Generate RIS (Research Information Systems) citation
 * Used by EndNote, Zotero, Mendeley, etc.
 */
export function generateRIS(data: CitationData): string {
    const date = new Date(data.created_at)
    const abstract = getAbstract(data)

    const lines: string[] = []

    // Type of reference (JOUR = Journal Article, ELEC = Web Page, RPRT = Report)
    lines.push('TY  - ELEC')

    // Authors
    lines.push(`AU  - ${formatAuthorRIS(data.author)}`)

    // Title
    lines.push(`TI  - ${data.title}`)

    // Publication year
    lines.push(`PY  - ${date.getFullYear()}`)

    // Date
    lines.push(`DA  - ${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`)

    // Abstract
    if (abstract) {
        lines.push(`AB  - ${abstract}`)
    }

    // Keywords
    if (data.tags && data.tags.length > 0) {
        data.tags.forEach(tag => {
            lines.push(`KW  - ${tag}`)
        })
    }

    // URL
    if (data.url) {
        lines.push(`UR  - ${data.url}`)
    }

    // DOI
    if (data.doi) {
        lines.push(`DO  - ${data.doi}`)
    }

    // Publisher
    lines.push('PB  - SyriaHub')

    // Database provider
    lines.push('DP  - SyriaHub Research Platform')

    // Unique ID
    lines.push(`ID  - ${data.id}`)

    // End of reference
    lines.push('ER  - ')

    return lines.join('\n')
}

// ==================== Other Formats ====================

/**
 * Generate APA 7th Edition citation
 */
export function generateAPA(data: CitationData): string {
    const date = new Date(data.created_at)
    const authorName = data.author?.name || 'Unknown Author'
    const year = date.getFullYear()

    // Format: Author, A. A. (Year, Month Day). Title. SyriaHub. URL
    const parts = authorName.split(' ')
    let formattedAuthor: string

    if (parts.length === 1) {
        formattedAuthor = parts[0]
    } else {
        const lastName = parts.pop()
        const initials = parts.map(n => `${n[0]}.`).join(' ')
        formattedAuthor = `${lastName}, ${initials}`
    }

    const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

    let citation = `${formattedAuthor} (${year}, ${monthDay}). ${data.title}. SyriaHub.`

    if (data.url) {
        citation += ` ${data.url}`
    }

    return citation
}

/**
 * Generate MLA 9th Edition citation
 */
export function generateMLA(data: CitationData): string {
    const date = new Date(data.created_at)
    const authorName = data.author?.name || 'Unknown Author'

    // Format: Last, First. "Title." SyriaHub, Day Month Year, URL.
    const parts = authorName.split(' ')
    let formattedAuthor: string

    if (parts.length === 1) {
        formattedAuthor = parts[0]
    } else {
        const lastName = parts.pop()
        const firstName = parts.join(' ')
        formattedAuthor = `${lastName}, ${firstName}`
    }

    const day = date.getDate()
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()

    let citation = `${formattedAuthor}. "${data.title}." SyriaHub, ${day} ${month}. ${year}`

    if (data.url) {
        citation += `, ${data.url}`
    }

    citation += '.'

    return citation
}

/**
 * Generate Chicago 17th Edition citation
 */
export function generateChicago(data: CitationData): string {
    const date = new Date(data.created_at)
    const authorName = data.author?.name || 'Unknown Author'

    // Format: Last, First. "Title." SyriaHub. Published Month Day, Year. URL.
    const parts = authorName.split(' ')
    let formattedAuthor: string

    if (parts.length === 1) {
        formattedAuthor = parts[0]
    } else {
        const lastName = parts.pop()
        const firstName = parts.join(' ')
        formattedAuthor = `${lastName}, ${firstName}`
    }

    const publishedDate = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    })

    let citation = `${formattedAuthor}. "${data.title}." SyriaHub. Published ${publishedDate}.`

    if (data.url) {
        citation += ` ${data.url}.`
    }

    return citation
}

// ==================== Export Helpers ====================

export type CitationFormat = 'bibtex' | 'ris' | 'apa' | 'mla' | 'chicago'

/**
 * Generate citation in specified format
 */
export function generateCitation(data: CitationData, format: CitationFormat): string {
    switch (format) {
        case 'bibtex':
            return generateBibTeX(data)
        case 'ris':
            return generateRIS(data)
        case 'apa':
            return generateAPA(data)
        case 'mla':
            return generateMLA(data)
        case 'chicago':
            return generateChicago(data)
        default:
            throw new Error(`Unknown citation format: ${format}`)
    }
}

/**
 * Get MIME type for citation format
 */
export function getCitationMimeType(format: CitationFormat): string {
    switch (format) {
        case 'bibtex':
            return 'application/x-bibtex'
        case 'ris':
            return 'application/x-research-info-systems'
        default:
            return 'text/plain'
    }
}

/**
 * Get file extension for citation format
 */
export function getCitationFileExtension(format: CitationFormat): string {
    switch (format) {
        case 'bibtex':
            return '.bib'
        case 'ris':
            return '.ris'
        default:
            return '.txt'
    }
}

/**
 * Download citation as file
 */
export function downloadCitation(data: CitationData, format: CitationFormat): void {
    const citation = generateCitation(data, format)
    const mimeType = getCitationMimeType(format)
    const extension = getCitationFileExtension(format)

    const blob = new Blob([citation], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${generateCiteKey(data)}${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
