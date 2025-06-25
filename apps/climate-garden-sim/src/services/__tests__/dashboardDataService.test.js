/**
 * Dashboard Data Service Tests
 * Tests Durham-specific dashboard functionality and recommendations
 */

import {
  getDurhamWeatherAlerts,
  getReadyToHarvest,
  getCriticalTimingWindows,
  getInvestmentPerformance,
  getTodaysActionableGuidance
} from '../dashboardDataService';

// Mock Date for consistent testing
const originalDate = global.Date;

describe('Dashboard Data Service', () => {
  beforeEach(() => {
    // Reset Date to original implementation before each test
    global.Date = originalDate;
  });

  afterAll(() => {
    // Restore original Date implementation
    global.Date = originalDate;
  });

  describe('getDurhamWeatherAlerts', () => {
    test('returns summer heat alerts during summer months', () => {
      global.Date = jest.fn(() => new originalDate('2025-07-15'));
      
      const alerts = getDurhamWeatherAlerts();
      
      expect(alerts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'heat-warning',
            icon: '🌡️',
            title: 'Summer Heat Active',
            urgency: 'high'
          })
        ])
      );
    });

    test('returns clay soil alerts during summer rain season', () => {
      // Mock Date constructor to return July 1st consistently
      global.Date = jest.fn().mockImplementation((...args) => {
        if (args.length === 0) {
          return new originalDate('2025-07-01');
        }
        return new originalDate(...args);
      });
      
      const alerts = getDurhamWeatherAlerts();
      
      // July 1st should include both heat and clay soil alerts
      expect(alerts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'heat-warning',
            icon: '🌡️',
            title: 'Summer Heat Active',
            urgency: 'high'
          }),
          expect.objectContaining({
            type: 'clay-soil',
            icon: '🏔️',
            title: 'Clay Soil Alert',
            urgency: 'medium'
          })
        ])
      );
    });

    test('returns spring transition alerts during March-April', () => {
      global.Date = jest.fn(() => new originalDate('2025-03-20'));
      
      const alerts = getDurhamWeatherAlerts();
      
      expect(alerts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'transition-season',
            icon: '🌱',
            title: 'Spring Transition Window',
            urgency: 'high'
          })
        ])
      );
    });

    test('returns fall planting alerts during September-October', () => {
      global.Date = jest.fn(() => new originalDate('2025-09-15'));
      
      const alerts = getDurhamWeatherAlerts();
      
      expect(alerts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'fall-window',
            icon: '🍂',
            title: 'Fall Planting Active',
            urgency: 'high'
          })
        ])
      );
    });

    test('returns seed ordering alerts during winter months', () => {
      global.Date = jest.fn(() => new originalDate('2025-01-15'));
      
      const alerts = getDurhamWeatherAlerts();
      
      expect(alerts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'seed-ordering',
            icon: '📦',
            title: 'Seed Ordering Season',
            urgency: 'medium'
          })
        ])
      );
    });

    test('returns empty array during months with no specific alerts', () => {
      global.Date = jest.fn(() => new originalDate('2025-05-15'));
      
      const alerts = getDurhamWeatherAlerts();
      
      // May might have fewer alerts than peak seasons
      expect(Array.isArray(alerts)).toBe(true);
    });

    test('alert objects have required properties', () => {
      global.Date = jest.fn(() => new originalDate('2025-07-15'));
      
      const alerts = getDurhamWeatherAlerts();
      
      alerts.forEach(alert => {
        expect(alert).toHaveProperty('type');
        expect(alert).toHaveProperty('icon');
        expect(alert).toHaveProperty('title');
        expect(alert).toHaveProperty('message');
        expect(alert).toHaveProperty('action');
        expect(alert).toHaveProperty('urgency');
        
        expect(typeof alert.type).toBe('string');
        expect(typeof alert.icon).toBe('string');
        expect(typeof alert.title).toBe('string');
        expect(typeof alert.message).toBe('string');
        expect(typeof alert.action).toBe('string');
        expect(['high', 'medium', 'low']).toContain(alert.urgency);
      });
    });
  });

  describe('getReadyToHarvest', () => {
    test('returns winter crops during January-February', () => {
      global.Date = jest.fn(() => new originalDate('2025-01-15'));
      
      const harvest = getReadyToHarvest();
      
      expect(harvest).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            crop: 'Kale',
            variety: 'Red Russian',
            daysReady: 0,
            value: '$8/lb'
          })
        ])
      );
    });

    test('returns spring crops during March-April', () => {
      global.Date = jest.fn(() => new originalDate('2025-03-15'));
      
      const harvest = getReadyToHarvest();
      
      expect(harvest).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            crop: 'Lettuce',
            variety: 'Jericho',
            value: '$6/head'
          })
        ])
      );
    });

    test('returns summer crops during July-August', () => {
      global.Date = jest.fn(() => new originalDate('2025-07-15'));
      
      const harvest = getReadyToHarvest();
      
      expect(harvest).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            crop: 'Okra',
            variety: 'Clemson Spineless',
            daysReady: 0,
            value: '$3/lb'
          })
        ])
      );
    });

    test('returns fall crops during September-October', () => {
      global.Date = jest.fn(() => new originalDate('2025-09-15'));
      
      const harvest = getReadyToHarvest();
      
      expect(harvest).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            crop: 'Fall Lettuce',
            variety: 'Jericho',
            daysReady: 0,
            value: '$6/head'
          })
        ])
      );
    });

    test('harvest items have required properties', () => {
      global.Date = jest.fn(() => new originalDate('2025-07-15'));
      
      const harvest = getReadyToHarvest();
      
      harvest.forEach(item => {
        expect(item).toHaveProperty('crop');
        expect(item).toHaveProperty('variety');
        expect(item).toHaveProperty('daysReady');
        expect(item).toHaveProperty('value');
        expect(item).toHaveProperty('note');
        
        expect(typeof item.crop).toBe('string');
        expect(typeof item.variety).toBe('string');
        expect(typeof item.daysReady).toBe('number');
        expect(typeof item.value).toBe('string');
        expect(typeof item.note).toBe('string');
        expect(item.daysReady).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getCriticalTimingWindows', () => {
    test('returns cool season deadline during late March', () => {
      global.Date = jest.fn(() => new originalDate('2025-03-20'));
      
      const windows = getCriticalTimingWindows();
      
      expect(windows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'planting-deadline',
            icon: '⏰',
            title: 'Cool Season Deadline',
            daysLeft: expect.any(Number)
          })
        ])
      );
    });

    test('returns transplant window during late April', () => {
      global.Date = jest.fn(() => new originalDate('2025-04-20'));
      
      const windows = getCriticalTimingWindows();
      
      expect(windows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'transplant-window',
            icon: '🌱',
            title: 'Warm Crop Transplant Window',
            daysLeft: 15
          })
        ])
      );
    });

    test('returns fall prep window during late August', () => {
      global.Date = jest.fn(() => new originalDate('2025-08-20'));
      
      const windows = getCriticalTimingWindows();
      
      expect(windows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'fall-prep',
            icon: '🍂',
            title: 'Fall Planting Prep',
            daysLeft: 15
          })
        ])
      );
    });

    test('returns seed ordering window during winter', () => {
      global.Date = jest.fn(() => new originalDate('2025-01-15'));
      
      const windows = getCriticalTimingWindows();
      
      expect(windows).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'seed-ordering',
            icon: '📦',
            title: 'Annual Seed Ordering',
            daysLeft: 60
          })
        ])
      );
    });

    test('timing windows have required properties', () => {
      global.Date = jest.fn(() => new originalDate('2025-03-20'));
      
      const windows = getCriticalTimingWindows();
      
      windows.forEach(window => {
        expect(window).toHaveProperty('type');
        expect(window).toHaveProperty('icon');
        expect(window).toHaveProperty('title');
        expect(window).toHaveProperty('message');
        expect(window).toHaveProperty('daysLeft');
        expect(window).toHaveProperty('action');
        
        expect(typeof window.type).toBe('string');
        expect(typeof window.icon).toBe('string');
        expect(typeof window.title).toBe('string');
        expect(typeof window.message).toBe('string');
        expect(typeof window.daysLeft).toBe('number');
        expect(typeof window.action).toBe('string');
        expect(window.daysLeft).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getInvestmentPerformance', () => {
    test('calculates performance with shopping list data', () => {
      const mockShoppingActions = {
        shoppingList: [
          { id: 'item1', price: 10, quantity: 2 },
          { id: 'item2', price: 15, quantity: 1 }
        ]
      };
      
      global.Date = jest.fn(() => new originalDate('2025-07-15')); // Summer peak
      
      const performance = getInvestmentPerformance(mockShoppingActions);
      
      expect(performance.totalSpent).toBe(35); // (10*2) + (15*1)
      expect(performance.estimatedValue).toBe(77); // 35 * 2.2 (summer multiplier)
      expect(performance.roi).toBeCloseTo(120, 0); // ((77-35)/35) * 100
    });

    test('handles empty shopping list', () => {
      const mockShoppingActions = {
        shoppingList: []
      };
      
      const performance = getInvestmentPerformance(mockShoppingActions);
      
      expect(performance.totalSpent).toBe(0);
      expect(performance.estimatedValue).toBe(0);
      expect(performance.roi).toBe(0);
    });

    test('calculates different ROI for different seasons', () => {
      const mockShoppingActions = {
        shoppingList: [{ id: 'item1', price: 100, quantity: 1 }]
      };
      
      // Test spring season (multiplier 1.5)
      global.Date = jest.fn(() => new originalDate('2025-04-15'));
      const springPerformance = getInvestmentPerformance(mockShoppingActions);
      
      // Test summer season (multiplier 2.2)
      global.Date = jest.fn(() => new originalDate('2025-07-15'));
      const summerPerformance = getInvestmentPerformance(mockShoppingActions);
      
      expect(springPerformance.estimatedValue).toBe(150); // 100 * 1.5
      expect(summerPerformance.estimatedValue).toBeCloseTo(220, 2); // 100 * 2.2
      expect(summerPerformance.roi).toBeGreaterThan(springPerformance.roi);
    });

    test('handles missing shopping actions gracefully', () => {
      const performance = getInvestmentPerformance(null);
      
      expect(performance.totalSpent).toBe(0);
      expect(performance.estimatedValue).toBe(0);
      expect(performance.roi).toBe(0);
    });

    test('performance object has required properties', () => {
      const mockShoppingActions = {
        shoppingList: [{ id: 'item1', price: 50, quantity: 1 }]
      };
      
      const performance = getInvestmentPerformance(mockShoppingActions);
      
      expect(performance).toHaveProperty('totalSpent');
      expect(performance).toHaveProperty('estimatedValue');
      expect(performance).toHaveProperty('roi');
      expect(performance).toHaveProperty('breakEvenMonth');
      
      expect(typeof performance.totalSpent).toBe('number');
      expect(typeof performance.estimatedValue).toBe('number');
      expect(typeof performance.roi).toBe('number');
      expect(typeof performance.breakEvenMonth).toBe('number');
    });
  });

  describe('getTodaysActionableGuidance', () => {
    test('returns morning guidance during morning hours', () => {
      global.Date = jest.fn(() => {
        const mockDate = new originalDate('2025-07-15');
        mockDate.getHours = () => 8; // 8 AM
        return mockDate;
      });
      
      const guidance = getTodaysActionableGuidance();
      
      expect(guidance).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'morning-tasks',
            icon: '🌅',
            title: 'Morning Garden Time'
          })
        ])
      );
    });

    test('returns evening guidance during evening hours', () => {
      global.Date = jest.fn(() => {
        const mockDate = new originalDate('2025-07-15');
        mockDate.getHours = () => 18; // 6 PM
        return mockDate;
      });
      
      const guidance = getTodaysActionableGuidance();
      
      expect(guidance).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'evening-tasks',
            icon: '🌆',
            title: 'Evening Garden Time'
          })
        ])
      );
    });

    test('returns summer strategy during summer months', () => {
      global.Date = jest.fn(() => new originalDate('2025-07-15'));
      
      const guidance = getTodaysActionableGuidance();
      
      expect(guidance).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'summer-priority',
            icon: '☀️',
            title: 'Summer Heat Strategy'
          })
        ])
      );
    });

    test('returns spring guidance during spring months', () => {
      global.Date = jest.fn(() => new originalDate('2025-03-15'));
      
      const guidance = getTodaysActionableGuidance();
      
      expect(guidance).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'spring-transition',
            icon: '🌱',
            title: 'Spring Transition Focus'
          })
        ])
      );
    });

    test('returns fall guidance during fall months', () => {
      global.Date = jest.fn(() => new originalDate('2025-09-15'));
      
      const guidance = getTodaysActionableGuidance();
      
      expect(guidance).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'fall-opportunity',
            icon: '🍂',
            title: 'Fall Growing Window'
          })
        ])
      );
    });

    test('guidance objects have required properties', () => {
      global.Date = jest.fn(() => new originalDate('2025-07-15'));
      
      const guidance = getTodaysActionableGuidance();
      
      guidance.forEach(guide => {
        expect(guide).toHaveProperty('type');
        expect(guide).toHaveProperty('icon');
        expect(guide).toHaveProperty('title');
        expect(guide).toHaveProperty('actions');
        
        expect(typeof guide.type).toBe('string');
        expect(typeof guide.icon).toBe('string');
        expect(typeof guide.title).toBe('string');
        expect(Array.isArray(guide.actions)).toBe(true);
        
        guide.actions.forEach(action => {
          expect(typeof action).toBe('string');
        });
      });
    });
  });

  describe('Integration and Edge Cases', () => {
    test('all functions return consistent data types', () => {
      global.Date = jest.fn(() => new originalDate('2025-07-15'));
      
      const alerts = getDurhamWeatherAlerts();
      const harvest = getReadyToHarvest();
      const windows = getCriticalTimingWindows();
      const performance = getInvestmentPerformance({ shoppingList: [] });
      const guidance = getTodaysActionableGuidance();
      
      expect(Array.isArray(alerts)).toBe(true);
      expect(Array.isArray(harvest)).toBe(true);
      expect(Array.isArray(windows)).toBe(true);
      expect(typeof performance).toBe('object');
      expect(Array.isArray(guidance)).toBe(true);
    });

    test('functions handle leap year dates correctly', () => {
      global.Date = jest.fn(() => new originalDate('2024-02-29')); // Leap year
      
      expect(() => {
        getDurhamWeatherAlerts();
        getReadyToHarvest();
        getCriticalTimingWindows();
        getTodaysActionableGuidance();
      }).not.toThrow();
    });

    test('functions handle year boundaries correctly', () => {
      global.Date = jest.fn(() => new originalDate('2025-12-31')); // End of year
      
      expect(() => {
        getDurhamWeatherAlerts();
        getReadyToHarvest();
        getCriticalTimingWindows();
        getTodaysActionableGuidance();
      }).not.toThrow();
    });
  });
});