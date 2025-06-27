/**
 * Variety Recommendation Service Tests
 * Tests the zone-specific variety recommendation functionality
 */

import varietyRecommendationService from '../varietyRecommendationService.js';

// Mock the regional variety recommendations service
jest.mock('../regionalVarietyRecommendations.js', () => ({
  getBestVarietyForZone: jest.fn(),
  getZoneSpecificVarieties: jest.fn()
}));

import regionalVarietyRecommendations from '../regionalVarietyRecommendations.js';

describe('Variety Recommendation Service', () => {
  const mockLocationConfig = {
    hardiness: '7b',
    name: 'Test Location',
    coordinates: { lat: 35.7796, lon: -78.6382 }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBestVarietyRecommendation', () => {
    test('returns variety recommendation when available', async () => {
      const mockVariety = {
        varietyName: 'Cherokee Purple',
        recommendation: 'Excellent heat tolerance',
        zoneSuitability: 'Excellent',
        daysToMaturity: 85,
        price: 4.95,
        vendorName: 'True Leaf Market',
        isOrganic: true,
        isHeirloom: true,
        zoneScore: 0.95
      };

      regionalVarietyRecommendations.getBestVarietyForZone.mockResolvedValue(mockVariety);

      const result = await varietyRecommendationService.getBestVarietyRecommendation('tomato', mockLocationConfig);

      expect(result).toEqual({
        plantKey: 'tomato',
        varietyName: 'Cherokee Purple',
        recommendation: 'Excellent heat tolerance',
        zoneSuitability: 'Excellent',
        daysToMaturity: 85,
        price: 4.95,
        vendor: 'True Leaf Market',
        isOrganic: true,
        isHeirloom: true,
        zoneScore: 0.95
      });

      expect(regionalVarietyRecommendations.getBestVarietyForZone).toHaveBeenCalledWith('tomato', mockLocationConfig);
    });

    test('returns null when no variety available', async () => {
      regionalVarietyRecommendations.getBestVarietyForZone.mockResolvedValue(null);

      const result = await varietyRecommendationService.getBestVarietyRecommendation('unknown-plant', mockLocationConfig);

      expect(result).toBeNull();
    });

    test('handles service errors gracefully', async () => {
      regionalVarietyRecommendations.getBestVarietyForZone.mockRejectedValue(new Error('Service error'));

      const result = await varietyRecommendationService.getBestVarietyRecommendation('tomato', mockLocationConfig);

      expect(result).toBeNull();
    });
  });

  describe('getVarietyRecommendationSummary', () => {
    test('returns recommendations for multiple plants', async () => {
      const mockVariety1 = {
        varietyName: 'Cherokee Purple',
        recommendation: 'Heat tolerant',
        zoneSuitability: 'Excellent',
        daysToMaturity: 85
      };

      const mockVariety2 = {
        varietyName: 'Provider Bush',
        recommendation: 'Good for containers',
        zoneSuitability: 'Good',
        daysToMaturity: 55
      };

      regionalVarietyRecommendations.getBestVarietyForZone
        .mockResolvedValueOnce(mockVariety1)
        .mockResolvedValueOnce(mockVariety2);

      const result = await varietyRecommendationService.getVarietyRecommendationSummary(['tomato', 'beans'], mockLocationConfig);

      expect(Object.keys(result)).toHaveLength(2);
      expect(result.tomato.varietyName).toBe('Cherokee Purple');
      expect(result.beans.varietyName).toBe('Provider Bush');
    });

    test('handles empty plant list', async () => {
      const result = await varietyRecommendationService.getVarietyRecommendationSummary([], mockLocationConfig);

      expect(result).toEqual({});
    });

    test('handles undefined plant list', async () => {
      const result = await varietyRecommendationService.getVarietyRecommendationSummary(undefined, mockLocationConfig);

      expect(result).toEqual({});
    });
  });

  describe('getVarietyEnhancedRecommendation', () => {
    test('generates enhanced text for excellent variety', async () => {
      const mockVariety = {
        varietyName: 'Cherokee Purple',
        zoneSuitability: 'Excellent',
        daysToMaturity: 85,
        vendor: 'True Leaf Market',
        price: 4.95
      };

      regionalVarietyRecommendations.getBestVarietyForZone.mockResolvedValue(mockVariety);

      const result = await varietyRecommendationService.getVarietyEnhancedRecommendation('tomato', mockLocationConfig);

      expect(result).toContain('Cherokee Purple');
      expect(result).toContain('perfect for Zone 7b');
      expect(result).toContain('harvest in 85 days');
      expect(result).toContain('True Leaf Market');
      expect(result).toContain('$4.95');
    });

    test('generates fallback text when no variety available', async () => {
      regionalVarietyRecommendations.getBestVarietyForZone.mockResolvedValue(null);

      const result = await varietyRecommendationService.getVarietyEnhancedRecommendation('unknown-plant', mockLocationConfig);

      expect(result).toContain('variety recommendations unavailable');
    });
  });

  describe('hasGoodVarietyOptions', () => {
    test('returns true when good varieties exist', async () => {
      const mockVarieties = [
        { zoneScore: 0.8 },
        { zoneScore: 0.7 }
      ];

      regionalVarietyRecommendations.getZoneSpecificVarieties.mockResolvedValue(mockVarieties);

      const result = await varietyRecommendationService.hasGoodVarietyOptions('tomato', mockLocationConfig);

      expect(result).toBe(true);
    });

    test('returns false when no good varieties exist', async () => {
      const mockVarieties = [
        { zoneScore: 0.4 },
        { zoneScore: 0.3 }
      ];

      regionalVarietyRecommendations.getZoneSpecificVarieties.mockResolvedValue(mockVarieties);

      const result = await varietyRecommendationService.hasGoodVarietyOptions('difficult-plant', mockLocationConfig);

      expect(result).toBe(false);
    });

    test('handles service errors gracefully', async () => {
      regionalVarietyRecommendations.getZoneSpecificVarieties.mockRejectedValue(new Error('Service error'));

      const result = await varietyRecommendationService.hasGoodVarietyOptions('tomato', mockLocationConfig);

      expect(result).toBe(false);
    });
  });

  describe('getZoneCompatibilitySummary', () => {
    test('returns comprehensive summary when varieties exist', async () => {
      const mockVarieties = [
        { varietyName: 'Cherokee Purple', zoneScore: 0.9, zoneSuitability: 'Excellent' },
        { varietyName: 'Better Boy', zoneScore: 0.7, zoneSuitability: 'Good' },
        { varietyName: 'Early Girl', zoneScore: 0.6, zoneSuitability: 'Good' }
      ];

      regionalVarietyRecommendations.getZoneSpecificVarieties.mockResolvedValue(mockVarieties);

      const result = await varietyRecommendationService.getZoneCompatibilitySummary('tomato', mockLocationConfig);

      expect(result.plantKey).toBe('tomato');
      expect(result.hasVarieties).toBe(true);
      expect(result.averageCompatibility).toBeCloseTo(0.73, 2);
      expect(result.bestVariety).toBe('Cherokee Purple');
      expect(result.totalVarieties).toBe(3);
      expect(result.excellentCount).toBe(1);
      expect(result.goodCount).toBe(2);
    });

    test('returns empty summary when no varieties exist', async () => {
      regionalVarietyRecommendations.getZoneSpecificVarieties.mockResolvedValue([]);

      const result = await varietyRecommendationService.getZoneCompatibilitySummary('unknown-plant', mockLocationConfig);

      expect(result.plantKey).toBe('unknown-plant');
      expect(result.hasVarieties).toBe(false);
      expect(result.averageCompatibility).toBe(0);
      expect(result.bestVariety).toBeNull();
      expect(result.totalVarieties).toBe(0);
    });
  });
});