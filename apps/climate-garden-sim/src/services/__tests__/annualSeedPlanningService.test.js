/**
 * Annual Seed Planning Service Tests
 * Tests database-driven seed ordering functionality
 */

import { generateAnnualSeedPlan } from '../annualSeedPlanningService';
import { GLOBAL_CROP_DATABASE } from '../../config';

// Mock the config to isolate our tests
jest.mock('../../config', () => ({
  GLOBAL_CROP_DATABASE: {
    heatTolerant: {
      okra: {
        name: { en: 'Okra' },
        key: 'okra',
        plantingSeasons: { temperate: [4, 5, 6] }
      },
      peppers: {
        name: { en: 'Hot Peppers' },
        key: 'peppers',
        plantingSeasons: { temperate: [3, 4, 5] }
      }
    },
    coolSeason: {
      kale: {
        name: { en: 'Kale' },
        key: 'kale',
        plantingSeasons: { temperate: [8, 9, 1, 2, 3] }
      },
      lettuce: {
        name: { en: 'Lettuce' },
        key: 'lettuce',
        plantingSeasons: { temperate: [9, 10, 1, 2, 3] }
      }
    }
  }
}));

describe('Annual Seed Planning Service', () => {
  const mockPortfolioStrategy = {
    heatSpecialists: 0.3,
    coolSeason: 0.4,
    perennials: 0.2,
    experimental: 0.1
  };

  const mockGardenConfig = {
    gardenSizeActual: 100,
    location: 'Durham, NC'
  };

  describe('generateAnnualSeedPlan', () => {
    test('returns comprehensive plan structure', async () => {
      const plan = await generateAnnualSeedPlan(mockPortfolioStrategy, mockGardenConfig);
      
      expect(plan).toHaveProperty('seedOrders');
      expect(plan).toHaveProperty('infrastructure');
      expect(plan).toHaveProperty('supplies');
      expect(plan).toHaveProperty('totalBudget');
      expect(plan).toHaveProperty('purchaseWindows');
      expect(plan).toHaveProperty('vendorGroups');
      
      expect(Array.isArray(plan.seedOrders)).toBe(true);
      expect(Array.isArray(plan.infrastructure)).toBe(true);
      expect(Array.isArray(plan.supplies)).toBe(true);
      expect(Array.isArray(plan.purchaseWindows)).toBe(true);
      expect(typeof plan.vendorGroups).toBe('object');
    });

    test('generates seed orders for allocated categories', async () => {
      const plan = await generateAnnualSeedPlan(mockPortfolioStrategy, mockGardenConfig);
      
      // Should have seeds for heatSpecialists and coolSeason (non-zero allocations)
      expect(plan.seedOrders.length).toBeGreaterThan(0);
      
      // Each seed order should have required properties
      plan.seedOrders.forEach(seed => {
        expect(seed).toHaveProperty('id');
        expect(seed).toHaveProperty('crop');
        expect(seed).toHaveProperty('variety');
        expect(seed).toHaveProperty('vendor');
        expect(seed).toHaveProperty('vendorSku');
        expect(seed).toHaveProperty('pricePerPacket');
        expect(seed).toHaveProperty('totalCost');
        expect(seed).toHaveProperty('specificInstructions');
        
        expect(typeof seed.totalCost).toBe('number');
        expect(seed.totalCost).toBeGreaterThan(0);
      });
    });

    test('handles different garden sizes correctly', async () => {
      const smallGarden = { ...mockGardenConfig, gardenSizeActual: 50 };
      const largeGarden = { ...mockGardenConfig, gardenSizeActual: 200 };
      
      const smallPlan = await generateAnnualSeedPlan(mockPortfolioStrategy, smallGarden);
      const largePlan = await generateAnnualSeedPlan(mockPortfolioStrategy, largeGarden);
      
      // Larger garden should generally need more packets
      // This is a heuristic test - exact numbers may vary based on crop types
      const smallTotalPackets = smallPlan.seedOrders.reduce((sum, seed) => sum + seed.packetsNeeded, 0);
      const largeTotalPackets = largePlan.seedOrders.reduce((sum, seed) => sum + seed.packetsNeeded, 0);
      
      expect(largeTotalPackets).toBeGreaterThanOrEqual(smallTotalPackets);
    });

    test('includes vendor-specific information from database', async () => {
      const plan = await generateAnnualSeedPlan(mockPortfolioStrategy, mockGardenConfig);
      
      const seedWithVendorInfo = plan.seedOrders.find(seed => seed.vendorSku);
      expect(seedWithVendorInfo).toBeDefined();
      
      if (seedWithVendorInfo) {
        expect(seedWithVendorInfo.vendor).toBeTruthy();
        expect(seedWithVendorInfo.vendorSku).toBeTruthy();
        expect(seedWithVendorInfo.specificInstructions).toBeTruthy();
        expect(seedWithVendorInfo.specificInstructions).toContain('ORDER:');
        expect(seedWithVendorInfo.specificInstructions).toContain('VENDOR:');
        expect(seedWithVendorInfo.specificInstructions).toContain('COST:');
      }
    });

    test('generates infrastructure recommendations', async () => {
      const plan = await generateAnnualSeedPlan(mockPortfolioStrategy, mockGardenConfig);
      
      expect(plan.infrastructure.length).toBeGreaterThan(0);
      
      plan.infrastructure.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('item');
        expect(item).toHaveProperty('cost');
        expect(item).toHaveProperty('category');
        expect(typeof item.cost).toBe('number');
      });
    });

    test('generates seasonal supplies', async () => {
      const plan = await generateAnnualSeedPlan(mockPortfolioStrategy, mockGardenConfig);
      
      expect(plan.supplies.length).toBeGreaterThan(0);
      
      plan.supplies.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('item');
        expect(item).toHaveProperty('cost');
        expect(item).toHaveProperty('category');
        expect(typeof item.cost).toBe('number');
      });
    });

    test('organizes items into purchase windows', async () => {
      const plan = await generateAnnualSeedPlan(mockPortfolioStrategy, mockGardenConfig);
      
      expect(plan.purchaseWindows.length).toBeGreaterThan(0);
      
      plan.purchaseWindows.forEach(window => {
        expect(window).toHaveProperty('name');
        expect(window).toHaveProperty('timing');
        expect(window).toHaveProperty('items');
        expect(window).toHaveProperty('totalCost');
        
        expect(Array.isArray(window.items)).toBe(true);
        expect(typeof window.totalCost).toBe('number');
      });
    });

    test('groups items by vendor', async () => {
      const plan = await generateAnnualSeedPlan(mockPortfolioStrategy, mockGardenConfig);
      
      expect(Object.keys(plan.vendorGroups).length).toBeGreaterThan(0);
      
      Object.values(plan.vendorGroups).forEach(vendor => {
        expect(vendor).toHaveProperty('name');
        expect(vendor).toHaveProperty('items');
        expect(vendor).toHaveProperty('totalCost');
        
        expect(Array.isArray(vendor.items)).toBe(true);
        expect(typeof vendor.totalCost).toBe('number');
      });
    });

    test('handles zero allocation categories gracefully', async () => {
      const zeroAllocationStrategy = {
        heatSpecialists: 0,
        coolSeason: 0,
        perennials: 0,
        experimental: 0
      };
      
      const plan = await generateAnnualSeedPlan(zeroAllocationStrategy, mockGardenConfig);
      
      // Should still return valid structure even with no seed allocations
      expect(plan.seedOrders).toEqual([]);
      expect(plan.infrastructure.length).toBeGreaterThan(0); // Infrastructure still needed
      expect(plan.supplies.length).toBeGreaterThan(0); // Supplies still needed
    });

    test('calculates total budget correctly', async () => {
      const plan = await generateAnnualSeedPlan(mockPortfolioStrategy, mockGardenConfig);
      
      const calculatedTotal = [
        ...plan.seedOrders,
        ...plan.infrastructure,
        ...plan.supplies
      ].reduce((sum, item) => sum + (item.totalCost || item.cost), 0);
      
      expect(plan.totalBudget).toBeCloseTo(calculatedTotal, 2);
    });
  });

  describe('Database Fallback Behavior', () => {
    test('handles missing database data gracefully', async () => {
      // This tests the fallback when database doesn't have specific crop data
      const planWithUnknownCrops = await generateAnnualSeedPlan(
        { unknownCategory: 0.5 },
        mockGardenConfig
      );
      
      // Should not crash and should return valid structure
      expect(planWithUnknownCrops).toHaveProperty('seedOrders');
      expect(Array.isArray(planWithUnknownCrops.seedOrders)).toBe(true);
    });
  });

  describe('Durham-Specific Recommendations', () => {
    test('includes Durham climate considerations in seed selection', async () => {
      const plan = await generateAnnualSeedPlan(mockPortfolioStrategy, mockGardenConfig);
      
      // Should have heat-tolerant varieties mentioned in instructions
      const hasHeatConsiderations = plan.seedOrders.some(seed => 
        seed.specificInstructions && (
          seed.specificInstructions.includes('heat') ||
          seed.specificInstructions.includes('Durham') ||
          seed.specificInstructions.includes('bolt-resistant')
        )
      );
      
      expect(hasHeatConsiderations).toBe(true);
    });

    test('includes succession planting calculations', async () => {
      const plan = await generateAnnualSeedPlan(mockPortfolioStrategy, mockGardenConfig);
      
      // Should have some crops with succession plantings > 1
      const hasSuccessionPlanting = plan.seedOrders.some(seed => 
        seed.successionPlantings > 1
      );
      
      expect(hasSuccessionPlanting).toBe(true);
    });
  });
});