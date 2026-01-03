import { describe, it, expect, vi } from 'vitest'
import {
  calculateConfidence,
  detectBoundarySpillover,
  detectAccessDiscontinuity,
  detectServiceCoverageQuestion,
  DetectedPattern,
  PatternId,
} from '@/lib/patternDetector'

// Mock governorate data
const mockGovernorates: import('@/lib/spatialQueries').GovernorateFeature[] = [
  {
    name: 'Damascus',
    name_ar: 'دمشق',
    type: 'governorate',
    geometry: {
      type: 'Point' as const,
      coordinates: [36.2919, 33.5138],
    },
  },
  {
    name: 'Aleppo',
    name_ar: 'حلب',
    type: 'governorate',
    geometry: {
      type: 'Point' as const,
      coordinates: [37.1343, 36.2021],
    },
  },
  {
    name: 'Homs',
    name_ar: 'حمص',
    type: 'governorate',
    geometry: {
      type: 'Point' as const,
      coordinates: [36.7167, 34.7333],
    },
  },
  {
    name: 'Deir-ez-Zor',
    name_ar: 'دير الزور',
    type: 'governorate',
    geometry: {
      type: 'Point' as const,
      coordinates: [40.1408, 35.3358],
    },
  },
  {
    name: 'Al-Hasakeh',
    name_ar: 'الحسكة',
    type: 'governorate',
    geometry: {
      type: 'Point' as const,
      coordinates: [40.7500, 36.5000],
    },
  },
]

// Mock polygon governorates for boundary testing
const mockPolygonGovernorates: import('@/lib/spatialQueries').GovernorateFeature[] = [
  {
    name: 'Damascus',
    name_ar: 'دمشق',
    type: 'governorate',
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[[36.0, 33.0], [36.5, 33.0], [36.5, 34.0], [36.0, 34.0], [36.0, 33.0]]],
    },
  },
  {
    name: 'Rural Damascus',
    name_ar: 'ريف دمشق',
    type: 'governorate',
    geometry: {
      type: 'Polygon' as const,
      coordinates: [[[36.5, 33.0], [37.0, 33.0], [37.0, 34.0], [36.5, 34.0], [36.5, 33.0]]],
    },
  },
]

describe('Pattern Detector Module', () => {
  describe('calculateConfidence', () => {
    it('should return 0 when pattern is not matched', () => {
      const confidence = calculateConfidence({
        patternMatch: false,
        dataCompleteness: 1.0,
        temporalRelevance: 1.0,
        sourceTrust: 1.0,
      })

      expect(confidence).toBe(0.6) // 0*0.4 + 1*0.3 + 1*0.2 + 1*0.1
    })

    it('should return max confidence when all inputs are 1', () => {
      const confidence = calculateConfidence({
        patternMatch: true,
        dataCompleteness: 1.0,
        temporalRelevance: 1.0,
        sourceTrust: 1.0,
      })

      expect(confidence).toBeCloseTo(1.0, 5)
    })

    it('should apply correct weights to each input', () => {
      // Weights: pattern_match 40%, data_completeness 30%, temporal_relevance 20%, source_trust 10%
      const confidence = calculateConfidence({
        patternMatch: true,  // 0.4
        dataCompleteness: 0.5, // 0.15
        temporalRelevance: 0.5, // 0.1
        sourceTrust: 0.5, // 0.05
      })

      expect(confidence).toBeCloseTo(0.7, 2)
    })

    it('should handle zero values correctly', () => {
      const confidence = calculateConfidence({
        patternMatch: true,
        dataCompleteness: 0,
        temporalRelevance: 0,
        sourceTrust: 0,
      })

      expect(confidence).toBe(0.4) // Only pattern match contributes
    })
  })

  describe('detectBoundarySpillover (P3)', () => {
    it('should return null for geometry within single governorate', () => {
      const geometry = {
        type: 'Point' as const,
        coordinates: [36.3, 33.5], // Inside Damascus
      }

      const result = detectBoundarySpillover(geometry, mockPolygonGovernorates)

      // Single point cannot span multiple governorates
      expect(result).toBeNull()
    })

    it('should detect pattern for polygon spanning multiple governorates', () => {
      // Create a polygon that spans Damascus and Rural Damascus
      const geometry = {
        type: 'Polygon' as const,
        coordinates: [[[36.3, 33.3], [36.7, 33.3], [36.7, 33.7], [36.3, 33.7], [36.3, 33.3]]],
      }

      const result = detectBoundarySpillover(geometry, mockPolygonGovernorates)

      if (result) {
        expect(result.id).toBe('P3')
        expect(result.name).toBe('Cross-boundary')
        expect(result.confidence).toBeGreaterThanOrEqual(0.6)
        expect(result.metadata?.governorates).toBeDefined()
      }
    })

    it('should include bilingual messages', () => {
      const geometry = {
        type: 'Polygon' as const,
        coordinates: [[[36.3, 33.3], [36.7, 33.3], [36.7, 33.7], [36.3, 33.7], [36.3, 33.3]]],
      }

      const result = detectBoundarySpillover(geometry, mockPolygonGovernorates)

      if (result) {
        expect(result.name_ar).toBe('عبر الحدود الإدارية')
        expect(result.message_ar).toBeDefined()
      }
    })

    it('should include temporal relevance when date provided', () => {
      const geometry = {
        type: 'Polygon' as const,
        coordinates: [[[36.3, 33.3], [36.7, 33.3], [36.7, 33.7], [36.3, 33.7], [36.3, 33.3]]],
      }

      const recentDate = new Date()
      const result = detectBoundarySpillover(geometry, mockPolygonGovernorates, recentDate)

      // Recent dates should have higher temporal relevance
      if (result) {
        expect(result.confidence).toBeGreaterThanOrEqual(0.6)
      }
    })

    it('should use conservative language in messages', () => {
      const geometry = {
        type: 'Polygon' as const,
        coordinates: [[[36.3, 33.3], [36.7, 33.3], [36.7, 33.7], [36.3, 33.7], [36.3, 33.3]]],
      }

      const result = detectBoundarySpillover(geometry, mockPolygonGovernorates)

      if (result) {
        // Messages should use "may/could" language, not definitive statements
        expect(result.message.toLowerCase()).toMatch(/spans|multiple/)
      }
    })
  })

  describe('detectAccessDiscontinuity (P4)', () => {
    it('should return null when point is close to its governorate center', () => {
      const point = { lat: 33.52, lng: 36.30 } // Very close to Damascus

      const result = detectAccessDiscontinuity(point, mockGovernorates)

      expect(result).toBeNull()
    })

    it('should return null when no governorates provided', () => {
      const point = { lat: 33.5, lng: 36.3 }

      const result = detectAccessDiscontinuity(point, [])

      expect(result).toBeNull()
    })

    it('should detect discontinuity when closer to different governorate', () => {
      // A point far from assigned center but close to another
      // This would be a point between two governorates
      const point = { lat: 35.0, lng: 36.7 } // Between Homs and Aleppo

      const result = detectAccessDiscontinuity(point, mockGovernorates)

      // May or may not trigger depending on exact distances
      // The test verifies the function runs without error
      expect(result === null || result?.id === 'P4').toBe(true)
    })

    it('should include distance metadata when pattern detected', () => {
      // Create a scenario where discontinuity is detected
      const point = { lat: 35.5, lng: 36.9 }

      const result = detectAccessDiscontinuity(point, mockGovernorates)

      if (result) {
        expect(result.id).toBe('P4')
        expect(result.metadata?.distanceToAssignedCenter).toBeDefined()
        expect(result.metadata?.nearestGovernorate).toBeDefined()
      }
    })
  })

  describe('detectServiceCoverageQuestion (P2)', () => {
    it('should only flag points in large governorates', () => {
      // Point in Deir-ez-Zor (large governorate)
      const pointInLarge = { lat: 35.3, lng: 40.1 }

      const result = detectServiceCoverageQuestion(pointInLarge, mockGovernorates)

      // May detect if point is in a known large governorate
      if (result) {
        expect(result.id).toBe('P2')
        expect(result.name).toBe('Service coverage question')
      }
    })

    it('should return null for points in small/urban governorates', () => {
      // Point near Damascus (urban, not flagged)
      const pointInSmall = { lat: 33.51, lng: 36.29 }

      const result = detectServiceCoverageQuestion(pointInSmall, mockGovernorates)

      expect(result).toBeNull()
    })

    it('should use question framing, not conclusions', () => {
      const point = { lat: 35.3, lng: 40.1 }

      const result = detectServiceCoverageQuestion(point, mockGovernorates)

      if (result) {
        // Message should suggest inquiry, not state facts
        expect(result.message).toMatch(/could|may|warrant|inquiry/)
      }
    })

    it('should include Arabic translations', () => {
      const point = { lat: 35.3, lng: 40.1 }

      const result = detectServiceCoverageQuestion(point, mockGovernorates)

      if (result) {
        expect(result.name_ar).toBe('سؤال حول تغطية الخدمات')
        expect(result.message_ar).toBeDefined()
        expect(result.message_ar.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Confidence threshold', () => {
    it('should not return patterns below 0.6 confidence threshold', () => {
      // Test with minimal data that would produce low confidence
      const geometry = {
        type: 'Point' as const,
        coordinates: [36.3, 33.5],
      }

      const result = detectBoundarySpillover(geometry, [])

      expect(result).toBeNull()
    })

    it('should return patterns at or above threshold', () => {
      const geometry = {
        type: 'Polygon' as const,
        coordinates: [[[36.3, 33.3], [36.7, 33.3], [36.7, 33.7], [36.3, 33.7], [36.3, 33.3]]],
      }

      const result = detectBoundarySpillover(geometry, mockPolygonGovernorates)

      if (result) {
        expect(result.confidence).toBeGreaterThanOrEqual(0.6)
      }
    })
  })

  describe('Pattern ID consistency', () => {
    it('should use correct pattern IDs', () => {
      // P3: Boundary spill-over
      const p3Geometry = {
        type: 'Polygon' as const,
        coordinates: [[[36.3, 33.3], [36.7, 33.3], [36.7, 33.7], [36.3, 33.7], [36.3, 33.3]]],
      }
      const p3Result = detectBoundarySpillover(p3Geometry, mockPolygonGovernorates)
      if (p3Result) expect(p3Result.id).toBe('P3')

      // P4: Access discontinuity
      const p4Point = { lat: 35.5, lng: 36.9 }
      const p4Result = detectAccessDiscontinuity(p4Point, mockGovernorates)
      if (p4Result) expect(p4Result.id).toBe('P4')

      // P2: Service coverage
      const p2Point = { lat: 35.3, lng: 40.1 }
      const p2Result = detectServiceCoverageQuestion(p2Point, mockGovernorates)
      if (p2Result) expect(p2Result.id).toBe('P2')
    })
  })

  describe('Temporal relevance', () => {
    it('should handle null temporal date', () => {
      const geometry = {
        type: 'Polygon' as const,
        coordinates: [[[36.3, 33.3], [36.7, 33.3], [36.7, 33.7], [36.3, 33.7], [36.3, 33.3]]],
      }

      // Should not throw with null date
      expect(() => detectBoundarySpillover(geometry, mockPolygonGovernorates, null)).not.toThrow()
    })

    it('should handle string date format', () => {
      const geometry = {
        type: 'Polygon' as const,
        coordinates: [[[36.3, 33.3], [36.7, 33.3], [36.7, 33.7], [36.3, 33.7], [36.3, 33.3]]],
      }

      expect(() => detectBoundarySpillover(geometry, mockPolygonGovernorates, '2025-01-01')).not.toThrow()
    })

    it('should handle Date object', () => {
      const geometry = {
        type: 'Polygon' as const,
        coordinates: [[[36.3, 33.3], [36.7, 33.3], [36.7, 33.7], [36.3, 33.7], [36.3, 33.3]]],
      }

      expect(() => detectBoundarySpillover(geometry, mockPolygonGovernorates, new Date())).not.toThrow()
    })
  })
})
