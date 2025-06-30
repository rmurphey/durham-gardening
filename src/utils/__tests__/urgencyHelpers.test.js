/**
 * Tests for urgencyHelpers.js
 * Validates urgency calculation logic and styling utilities
 */

import { getUrgencyLevel, getUrgencyClasses } from '../urgencyHelpers';

describe('urgencyHelpers', () => {
  describe('getUrgencyLevel', () => {
    test('returns urgent for overdue items (negative days)', () => {
      expect(getUrgencyLevel(-1)).toBe('urgent');
      expect(getUrgencyLevel(-5)).toBe('urgent');
      expect(getUrgencyLevel(-100)).toBe('urgent');
    });

    test('returns urgent for items due within 7 days', () => {
      expect(getUrgencyLevel(0)).toBe('urgent');
      expect(getUrgencyLevel(1)).toBe('urgent');
      expect(getUrgencyLevel(7)).toBe('urgent');
    });

    test('returns high for items due within 8-14 days', () => {
      expect(getUrgencyLevel(8)).toBe('high');
      expect(getUrgencyLevel(10)).toBe('high');
      expect(getUrgencyLevel(14)).toBe('high');
    });

    test('returns medium for items due within 15-30 days', () => {
      expect(getUrgencyLevel(15)).toBe('medium');
      expect(getUrgencyLevel(20)).toBe('medium');
      expect(getUrgencyLevel(30)).toBe('medium');
    });

    test('returns low for items due after 30 days', () => {
      expect(getUrgencyLevel(31)).toBe('low');
      expect(getUrgencyLevel(60)).toBe('low');
      expect(getUrgencyLevel(365)).toBe('low');
    });

    test('handles edge cases correctly', () => {
      expect(getUrgencyLevel(0)).toBe('urgent');
      expect(getUrgencyLevel(7)).toBe('urgent');
      expect(getUrgencyLevel(8)).toBe('high');
      expect(getUrgencyLevel(14)).toBe('high');
      expect(getUrgencyLevel(15)).toBe('medium');
      expect(getUrgencyLevel(30)).toBe('medium');
      expect(getUrgencyLevel(31)).toBe('low');
    });
  });

  describe('getUrgencyClasses', () => {
    test('returns correct classes for urgent level', () => {
      const classes = getUrgencyClasses(3);
      expect(classes.level).toBe('urgent');
      expect(classes.cardClass).toBe('urgency-urgent');
      expect(classes.badgeClass).toBe('urgency-badge urgent');
      expect(classes.indicatorClass).toBe('timing-indicator urgent');
    });

    test('returns correct classes for high level', () => {
      const classes = getUrgencyClasses(10);
      expect(classes.level).toBe('high');
      expect(classes.cardClass).toBe('urgency-high');
      expect(classes.badgeClass).toBe('urgency-badge high');
      expect(classes.indicatorClass).toBe('timing-indicator high');
    });

    test('returns correct classes for medium level', () => {
      const classes = getUrgencyClasses(25);
      expect(classes.level).toBe('medium');
      expect(classes.cardClass).toBe('urgency-medium');
      expect(classes.badgeClass).toBe('urgency-badge medium');
      expect(classes.indicatorClass).toBe('timing-indicator medium');
    });

    test('returns correct classes for low level', () => {
      const classes = getUrgencyClasses(45);
      expect(classes.level).toBe('low');
      expect(classes.cardClass).toBe('urgency-low');
      expect(classes.badgeClass).toBe('urgency-badge low');
      expect(classes.indicatorClass).toBe('timing-indicator low');
    });

    test('includes all required class properties', () => {
      const classes = getUrgencyClasses(15);
      expect(classes).toHaveProperty('level');
      expect(classes).toHaveProperty('cardClass');
      expect(classes).toHaveProperty('badgeClass');
      expect(classes).toHaveProperty('indicatorClass');
    });
  });

  describe('integration tests', () => {
    test('urgency level and classes are consistent', () => {
      const urgentLevel = getUrgencyLevel(5);
      const urgentClasses = getUrgencyClasses(5);
      expect(urgentLevel).toBe('urgent');
      expect(urgentClasses.level).toBe('urgent');

      const highLevel = getUrgencyLevel(10);
      const highClasses = getUrgencyClasses(10);
      expect(highLevel).toBe('high');
      expect(highClasses.level).toBe('high');

      const mediumLevel = getUrgencyLevel(25);
      const mediumClasses = getUrgencyClasses(25);
      expect(mediumLevel).toBe('medium');
      expect(mediumClasses.level).toBe('medium');

      const lowLevel = getUrgencyLevel(50);
      const lowClasses = getUrgencyClasses(50);
      expect(lowLevel).toBe('low');
      expect(lowClasses.level).toBe('low');
    });
  });
});