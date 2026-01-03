import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  moderateContent,
  moderateContentWithOpenAI,
  moderateContentWithPerspective,
  generateModerationWarning,
  ModerationResult,
} from '@/lib/moderation'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Moderation Module', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Reset environment variables
    vi.stubEnv('OPENAI_API_KEY', '')
    vi.stubEnv('PERSPECTIVE_API_KEY', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('moderateContentWithOpenAI', () => {
    it('should return safe result when API key is not configured', async () => {
      const result = await moderateContentWithOpenAI('Test content')
      
      expect(result.flagged).toBe(false)
      expect(result.details).toContain('AI moderation disabled - API key not configured')
    })

    it('should call OpenAI API when key is configured', async () => {
      vi.stubEnv('OPENAI_API_KEY', 'test-api-key')
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [{
            flagged: false,
            categories: {},
            category_scores: {},
          }],
        }),
      })

      const result = await moderateContentWithOpenAI('Hello world')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/moderations',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        })
      )
      expect(result.flagged).toBe(false)
    })

    it('should flag content when OpenAI detects violations', async () => {
      vi.stubEnv('OPENAI_API_KEY', 'test-api-key')
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [{
            flagged: true,
            categories: {
              hate: true,
              violence: false,
            },
            category_scores: {
              hate: 0.95,
              violence: 0.1,
            },
          }],
        }),
      })

      const result = await moderateContentWithOpenAI('Hateful content')

      expect(result.flagged).toBe(true)
      expect(result.categories.hate).toBe(true)
      expect(result.categoryScores.hate).toBe(0.95)
      expect(result.details).toContain('hate')
    })

    it('should handle API errors gracefully (fail open)', async () => {
      vi.stubEnv('OPENAI_API_KEY', 'test-api-key')
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      })

      const result = await moderateContentWithOpenAI('Test content')

      expect(result.flagged).toBe(false)
      expect(result.details).toContain('Moderation service error - content allowed by default')
    })

    it('should handle network errors gracefully', async () => {
      vi.stubEnv('OPENAI_API_KEY', 'test-api-key')
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await moderateContentWithOpenAI('Test content')

      expect(result.flagged).toBe(false)
    })
  })

  describe('moderateContentWithPerspective', () => {
    it('should return safe result when API key is not configured', async () => {
      const result = await moderateContentWithPerspective('Test content')
      
      expect(result.flagged).toBe(false)
      expect(result.details).toContain('Perspective API disabled - API key not configured')
    })

    it('should call Perspective API when key is configured', async () => {
      vi.stubEnv('PERSPECTIVE_API_KEY', 'test-perspective-key')
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          attributeScores: {
            TOXICITY: { summaryScore: { value: 0.1 } },
            SEVERE_TOXICITY: { summaryScore: { value: 0.05 } },
            THREAT: { summaryScore: { value: 0.02 } },
            IDENTITY_ATTACK: { summaryScore: { value: 0.03 } },
          },
        }),
      })

      const result = await moderateContentWithPerspective('Hello world')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('commentanalyzer.googleapis.com'),
        expect.any(Object)
      )
      expect(result.flagged).toBe(false)
    })

    it('should flag toxic content above threshold', async () => {
      vi.stubEnv('PERSPECTIVE_API_KEY', 'test-perspective-key')
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          attributeScores: {
            TOXICITY: { summaryScore: { value: 0.85 } },
            SEVERE_TOXICITY: { summaryScore: { value: 0.2 } },
            THREAT: { summaryScore: { value: 0.1 } },
            IDENTITY_ATTACK: { summaryScore: { value: 0.1 } },
          },
        }),
      })

      const result = await moderateContentWithPerspective('Toxic content')

      expect(result.flagged).toBe(true)
      expect(result.categories.harassment).toBe(true)
    })
  })

  describe('moderateContent (main function)', () => {
    it('should try OpenAI first when configured', async () => {
      vi.stubEnv('OPENAI_API_KEY', 'test-openai-key')
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [{
            flagged: false,
            categories: {},
            category_scores: {},
          }],
        }),
      })

      const result = await moderateContent('Test content')

      expect(result.flagged).toBe(false)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should fall back to Perspective when OpenAI not configured', async () => {
      vi.stubEnv('PERSPECTIVE_API_KEY', 'test-perspective-key')
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          attributeScores: {
            TOXICITY: { summaryScore: { value: 0.1 } },
            SEVERE_TOXICITY: { summaryScore: { value: 0.05 } },
            THREAT: { summaryScore: { value: 0.02 } },
            IDENTITY_ATTACK: { summaryScore: { value: 0.03 } },
          },
        }),
      })

      const result = await moderateContent('Test content')

      expect(result.flagged).toBe(false)
    })

    it('should return safe default when no APIs configured', async () => {
      const result = await moderateContent('Test content')

      expect(result.flagged).toBe(false)
      expect(result.details).toContain('No moderation APIs configured - content allowed by default')
    })
  })

  describe('generateModerationWarning', () => {
    it('should return empty string for unflagged content', () => {
      const result: ModerationResult = {
        flagged: false,
        categories: {},
        categoryScores: {},
      }

      expect(generateModerationWarning(result)).toBe('')
    })

    it('should return generic warning when flagged without details', () => {
      const result: ModerationResult = {
        flagged: true,
        categories: { hate: true },
        categoryScores: { hate: 0.9 },
        details: [],
      }

      expect(generateModerationWarning(result)).toBe(
        'Your content may violate community guidelines.'
      )
    })

    it('should list flagged categories in warning', () => {
      const result: ModerationResult = {
        flagged: true,
        categories: { hate: true, violence: true },
        categoryScores: { hate: 0.9, violence: 0.8 },
        details: ['hate', 'violence'],
      }

      const warning = generateModerationWarning(result)

      expect(warning).toContain('hate')
      expect(warning).toContain('violence')
      expect(warning).toContain('community guidelines')
    })

    it('should format nested categories properly', () => {
      const result: ModerationResult = {
        flagged: true,
        categories: { 'hate/threatening': true },
        categoryScores: { 'hate/threatening': 0.95 },
        details: ['hate/threatening'],
      }

      const warning = generateModerationWarning(result)

      expect(warning).toContain('Hate / Threatening')
    })
  })
})
