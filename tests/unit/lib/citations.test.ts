import { describe, it, expect } from 'vitest'
import {
  generateBibTeX,
  generateRIS,
  generateAPA,
  generateMLA,
  generateChicago,
  CitationData,
} from '@/lib/citations'

describe('Citations Module', () => {
  const baseCitationData: CitationData = {
    id: 'test-post-123',
    title: 'Understanding Syrian Refugee Patterns',
    author: {
      name: 'Ahmad Hassan',
      email: 'ahmad@example.com',
      affiliation: 'Damascus University',
    },
    abstract: 'A comprehensive study on refugee movement patterns.',
    content: 'This is the main content of the research post...',
    tags: ['refugees', 'migration', 'syria'],
    created_at: '2025-06-15T10:30:00Z',
    updated_at: '2025-06-20T14:00:00Z',
    url: 'https://syriahub.org/posts/test-post-123',
    doi: '10.1234/syriahub.2025.001',
    license: 'CC-BY-4.0',
  }

  describe('generateBibTeX', () => {
    it('should generate valid BibTeX format', () => {
      const bibtex = generateBibTeX(baseCitationData)

      expect(bibtex).toContain('@article{')
      expect(bibtex).toContain('author = {Hassan, Ahmad}')
      expect(bibtex).toContain('title = {Understanding Syrian Refugee Patterns}')
      expect(bibtex).toContain('year = {2025}')
    })

    it('should generate correct cite key from author and title', () => {
      const bibtex = generateBibTeX(baseCitationData)

      // Cite key format: lastnameyeartitlewords
      expect(bibtex).toMatch(/@article\{hassan2025/)
    })

    it('should include DOI when provided', () => {
      const bibtex = generateBibTeX(baseCitationData)

      expect(bibtex).toContain('doi = {10.1234/syriahub.2025.001}')
    })

    it('should include URL when provided', () => {
      const bibtex = generateBibTeX(baseCitationData)

      expect(bibtex).toContain('url = {https://syriahub.org/posts/test-post-123}')
    })

    it('should include keywords from tags', () => {
      const bibtex = generateBibTeX(baseCitationData)

      expect(bibtex).toContain('keywords = {refugees, migration, syria}')
    })

    it('should include institution from author affiliation', () => {
      const bibtex = generateBibTeX(baseCitationData)

      expect(bibtex).toContain('institution = {Damascus University}')
    })

    it('should escape special BibTeX characters', () => {
      const dataWithSpecialChars: CitationData = {
        ...baseCitationData,
        title: 'Research & Development: 100% Success Rate',
      }

      const bibtex = generateBibTeX(dataWithSpecialChars)

      expect(bibtex).toContain('\\&')
      expect(bibtex).toContain('\\%')
    })

    it('should handle missing author gracefully', () => {
      const dataWithoutAuthor: CitationData = {
        ...baseCitationData,
        author: {},
      }

      const bibtex = generateBibTeX(dataWithoutAuthor)

      expect(bibtex).toContain('author = {Unknown Author}')
    })

    it('should handle single-word author name', () => {
      const dataSingleName: CitationData = {
        ...baseCitationData,
        author: { name: 'Anonymous' },
      }

      const bibtex = generateBibTeX(dataSingleName)

      expect(bibtex).toContain('author = {Anonymous}')
    })
  })

  describe('generateRIS', () => {
    it('should generate valid RIS format', () => {
      const ris = generateRIS(baseCitationData)

      expect(ris).toContain('TY  - ELEC')
      expect(ris).toContain('AU  - Hassan,Ahmad')
      expect(ris).toContain('TI  - Understanding Syrian Refugee Patterns')
      expect(ris).toContain('PY  - 2025')
      expect(ris).toContain('ER  - ')
    })

    it('should include date in correct format', () => {
      const ris = generateRIS(baseCitationData)

      expect(ris).toContain('DA  - 2025/06/15')
    })

    it('should include keywords as separate KW entries', () => {
      const ris = generateRIS(baseCitationData)

      expect(ris).toContain('KW  - refugees')
      expect(ris).toContain('KW  - migration')
      expect(ris).toContain('KW  - syria')
    })

    it('should include URL and DOI', () => {
      const ris = generateRIS(baseCitationData)

      expect(ris).toContain('UR  - https://syriahub.org/posts/test-post-123')
      expect(ris).toContain('DO  - 10.1234/syriahub.2025.001')
    })

    it('should include abstract', () => {
      const ris = generateRIS(baseCitationData)

      expect(ris).toContain('AB  - A comprehensive study on refugee movement patterns.')
    })

    it('should include SyriaHub as publisher', () => {
      const ris = generateRIS(baseCitationData)

      expect(ris).toContain('PB  - SyriaHub')
    })
  })

  describe('generateAPA', () => {
    it('should generate APA 7th edition format', () => {
      const apa = generateAPA(baseCitationData)

      // Format: Author, A. A. (Year, Month Day). Title. SyriaHub. URL
      expect(apa).toContain('Hassan, A.')
      expect(apa).toContain('(2025,')
      expect(apa).toContain('Understanding Syrian Refugee Patterns')
      expect(apa).toContain('SyriaHub')
      expect(apa).toContain('https://syriahub.org/posts/test-post-123')
    })

    it('should format author with initials correctly', () => {
      const dataMultipleName: CitationData = {
        ...baseCitationData,
        author: { name: 'Ahmad Ali Hassan' },
      }

      const apa = generateAPA(dataMultipleName)

      expect(apa).toContain('Hassan, A. A.')
    })

    it('should handle single-word author name', () => {
      const dataSingleName: CitationData = {
        ...baseCitationData,
        author: { name: 'Anonymous' },
      }

      const apa = generateAPA(dataSingleName)

      expect(apa).toContain('Anonymous')
    })
  })

  describe('generateMLA', () => {
    it('should generate MLA 9th edition format', () => {
      const mla = generateMLA(baseCitationData)

      // Format: Last, First. "Title." SyriaHub, Day Month Year, URL.
      expect(mla).toContain('Hassan, Ahmad')
      expect(mla).toContain('"Understanding Syrian Refugee Patterns."')
      expect(mla).toContain('SyriaHub')
      expect(mla).toContain('2025')
      expect(mla.endsWith('.')).toBe(true)
    })

    it('should include URL when provided', () => {
      const mla = generateMLA(baseCitationData)

      expect(mla).toContain('https://syriahub.org/posts/test-post-123')
    })

    it('should format date correctly', () => {
      const mla = generateMLA(baseCitationData)

      expect(mla).toMatch(/15 Jun\. 2025/)
    })
  })

  describe('generateChicago', () => {
    it('should generate Chicago 17th edition format', () => {
      const chicago = generateChicago(baseCitationData)

      // Format: Last, First. "Title." SyriaHub. Published Month Day, Year. URL.
      expect(chicago).toContain('Hassan, Ahmad')
      expect(chicago).toContain('"Understanding Syrian Refugee Patterns."')
      expect(chicago).toContain('SyriaHub')
    })

    it('should handle missing author gracefully', () => {
      const dataWithoutAuthor: CitationData = {
        ...baseCitationData,
        author: {},
      }

      const chicago = generateChicago(dataWithoutAuthor)

      // The actual implementation might use "Author, Unknown" format
      expect(chicago).toMatch(/Unknown|Author/)
    })
  })

  describe('Abstract generation', () => {
    it('should use abstract when provided', () => {
      const bibtex = generateBibTeX(baseCitationData)

      expect(bibtex).toContain('abstract = {A comprehensive study on refugee movement patterns.}')
    })

    it('should truncate long content to 300 characters for abstract', () => {
      const longContent = 'A'.repeat(500)
      const dataLongContent: CitationData = {
        ...baseCitationData,
        abstract: undefined,
        content: longContent,
      }

      const bibtex = generateBibTeX(dataLongContent)

      // Should truncate to ~300 chars with "..."
      expect(bibtex).toMatch(/abstract = \{A+\.\.\.}/)
    })

    it('should handle missing content gracefully', () => {
      const dataNoContent: CitationData = {
        ...baseCitationData,
        abstract: undefined,
        content: undefined,
      }

      const ris = generateRIS(dataNoContent)

      // Should not include AB field when no abstract available
      expect(ris).not.toMatch(/^AB {2}- $/m)
    })
  })

  describe('Edge cases', () => {
    it('should handle minimal citation data', () => {
      const minimalData: CitationData = {
        id: 'minimal-123',
        title: 'Minimal Post',
        author: {},
        created_at: '2025-01-01T00:00:00Z',
      }

      // All formats should work without throwing
      expect(() => generateBibTeX(minimalData)).not.toThrow()
      expect(() => generateRIS(minimalData)).not.toThrow()
      expect(() => generateAPA(minimalData)).not.toThrow()
      expect(() => generateMLA(minimalData)).not.toThrow()
      expect(() => generateChicago(minimalData)).not.toThrow()
    })

    it('should handle Arabic author names', () => {
      const arabicData: CitationData = {
        ...baseCitationData,
        author: { name: 'أحمد حسن' },
      }

      const bibtex = generateBibTeX(arabicData)

      expect(bibtex).toContain('author = {حسن, أحمد}')
    })

    it('should handle empty tags array', () => {
      const noTagsData: CitationData = {
        ...baseCitationData,
        tags: [],
      }

      const bibtex = generateBibTeX(noTagsData)

      expect(bibtex).not.toContain('keywords')
    })
  })
})
