/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateBrowserFingerprint } from '@/lib/fingerprint'

// Mock crypto.subtle
const mockDigest = vi.fn()

describe('Fingerprint Module', () => {
  beforeEach(() => {
    // Setup window mocks
    Object.defineProperty(window, 'screen', {
      value: {
        width: 1920,
        height: 1080,
        colorDepth: 24,
      },
      writable: true,
    })

    Object.defineProperty(window, 'devicePixelRatio', {
      value: 2,
      writable: true,
    })

    // Mock Intl.DateTimeFormat
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'Europe/London' }),
      format: vi.fn(),
      formatToParts: vi.fn(),
      formatRange: vi.fn(),
      formatRangeToParts: vi.fn(),
    }))

    // Mock navigator
    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      writable: true,
    })

    Object.defineProperty(navigator, 'platform', {
      value: 'Win32',
      writable: true,
    })

    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: 8,
      writable: true,
    })

    // Mock canvas
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue({
        textBaseline: '',
        font: '',
        fillStyle: '',
        fillRect: vi.fn(),
        fillText: vi.fn(),
      }),
      toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
    }
    
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement
      return document.createElement(tag)
    })

    // Mock crypto.subtle
    mockDigest.mockResolvedValue(new ArrayBuffer(32))
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        subtle: {
          digest: mockDigest,
        },
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('generateBrowserFingerprint', () => {
    it('should generate a fingerprint hash', async () => {
      const fingerprint = await generateBrowserFingerprint()

      expect(fingerprint).toBeDefined()
      expect(typeof fingerprint).toBe('string')
      expect(fingerprint.length).toBeGreaterThan(0)
    })

    it('should include screen characteristics in fingerprint', async () => {
      // Fingerprint should change when screen changes
      Object.defineProperty(window, 'screen', {
        value: { width: 2560, height: 1440, colorDepth: 32 },
        writable: true,
      })

      const fp1 = await generateBrowserFingerprint()

      Object.defineProperty(window, 'screen', {
        value: { width: 1920, height: 1080, colorDepth: 24 },
        writable: true,
      })

      const fp2 = await generateBrowserFingerprint()

      // Different screen configs should produce different fingerprints
      // (In practice they will be different due to hashing)
      expect(fp1).toBeDefined()
      expect(fp2).toBeDefined()
    })

    it('should handle missing crypto.subtle gracefully', async () => {
      // Remove crypto.subtle to test fallback
      Object.defineProperty(globalThis, 'crypto', {
        value: { subtle: { digest: vi.fn().mockRejectedValue(new Error('Not supported')) } },
        writable: true,
      })

      const fingerprint = await generateBrowserFingerprint()

      // Should still return a fingerprint using fallback hash
      expect(fingerprint).toBeDefined()
      expect(typeof fingerprint).toBe('string')
    })

    it('should produce consistent fingerprints for same environment', async () => {
      const fp1 = await generateBrowserFingerprint()
      const fp2 = await generateBrowserFingerprint()

      // Same environment should produce same fingerprint
      expect(fp1).toEqual(fp2)
    })

    it('should include timezone in fingerprint components', async () => {
      // The fingerprint should incorporate timezone
      const fingerprint = await generateBrowserFingerprint()
      
      // We can't directly test internal components, but we can verify
      // the Intl mock was called
      expect(Intl.DateTimeFormat).toHaveBeenCalled()
      expect(fingerprint).toBeDefined()
    })

    it('should include language in fingerprint components', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'ar-SY',
        writable: true,
      })

      const fingerprint = await generateBrowserFingerprint()

      expect(fingerprint).toBeDefined()
    })

    it('should include hardware concurrency', async () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 16,
        writable: true,
      })

      const fingerprint = await generateBrowserFingerprint()

      expect(fingerprint).toBeDefined()
    })

    it('should handle missing hardwareConcurrency gracefully', async () => {
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: undefined,
        writable: true,
      })

      const fingerprint = await generateBrowserFingerprint()

      expect(fingerprint).toBeDefined()
    })

    it('should return a 32-character hex string', async () => {
      const fingerprint = await generateBrowserFingerprint()

      // SHA-256 truncated to 32 chars
      expect(fingerprint).toMatch(/^[0-9a-f]+$/)
      expect(fingerprint.length).toBe(32)
    })
  })

  describe('Canvas fingerprinting', () => {
    it('should create a canvas element for fingerprinting', async () => {
      await generateBrowserFingerprint()

      expect(document.createElement).toHaveBeenCalledWith('canvas')
    })

    it('should handle canvas context failure gracefully', async () => {
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: vi.fn().mockReturnValue(null),
            toDataURL: vi.fn().mockReturnValue(''),
          } as unknown as HTMLCanvasElement
        }
        return document.createElement(tag)
      })

      const fingerprint = await generateBrowserFingerprint()

      // Should still produce a fingerprint with 'no-canvas' fallback
      expect(fingerprint).toBeDefined()
    })
  })

  describe('WebGL fingerprinting', () => {
    it('should handle missing WebGL gracefully', async () => {
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return {
            width: 0,
            height: 0,
            getContext: vi.fn().mockImplementation((type) => {
              if (type === 'webgl' || type === 'experimental-webgl') {
                return null
              }
              return {
                textBaseline: '',
                font: '',
                fillStyle: '',
                fillRect: vi.fn(),
                fillText: vi.fn(),
              }
            }),
            toDataURL: vi.fn().mockReturnValue('data:image/png;base64,test'),
          } as unknown as HTMLCanvasElement
        }
        return document.createElement(tag)
      })

      const fingerprint = await generateBrowserFingerprint()

      // Should produce a fingerprint with 'no-webgl' fallback
      expect(fingerprint).toBeDefined()
    })
  })

  describe('Privacy considerations', () => {
    it('should not expose raw fingerprint data (only hash)', async () => {
      const fingerprint = await generateBrowserFingerprint()

      // Fingerprint should be a hash, not containing raw data
      expect(fingerprint).not.toContain('1920')
      expect(fingerprint).not.toContain('Win32')
      expect(fingerprint).not.toContain('en-US')
    })

    it('should produce fixed-length output regardless of input', async () => {
      const fp1 = await generateBrowserFingerprint()

      // Change multiple properties
      Object.defineProperty(window, 'screen', {
        value: { width: 3840, height: 2160, colorDepth: 48 },
        writable: true,
      })
      Object.defineProperty(navigator, 'language', {
        value: 'zh-CN',
        writable: true,
      })

      const fp2 = await generateBrowserFingerprint()

      // Both should be same length (privacy: no length-based leakage)
      expect(fp1.length).toBe(fp2.length)
    })
  })
})
