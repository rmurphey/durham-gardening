/**
 * Tests for Garden ID utilities
 */

import {
  generateGardenId,
  isValidGardenId,
  createShareableUrl
} from '../gardenId.js';

// Mock crypto.randomUUID
const mockUUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => mockUUID)
  },
  configurable: true
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('Garden ID Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
  });

  describe('generateGardenId', () => {
    it('should generate a valid UUID', () => {
      const id = generateGardenId();
      expect(id).toBe(mockUUID);
      expect(crypto.randomUUID).toHaveBeenCalled();
    });

    it('should fallback to manual UUID generation when crypto.randomUUID unavailable', () => {
      const originalCrypto = global.crypto;
      delete global.crypto;

      const id = generateGardenId();
      
      // Should be UUID format
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      
      // Restore crypto
      global.crypto = originalCrypto;
    });
  });

  describe('isValidGardenId', () => {
    it('should validate correct UUID format', () => {
      const validIds = [
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'F47AC10B-58CC-4372-A567-0E02B2C3D479',
        '12345678-1234-1234-1234-123456789abc'
      ];

      validIds.forEach(id => {
        expect(isValidGardenId(id)).toBe(true);
      });
    });

    it('should reject invalid formats', () => {
      const invalidIds = [
        null,
        undefined,
        '',
        'not-a-uuid',
        'f47ac10b-58cc-4372-a567',  // too short
        'f47ac10b-58cc-4372-a567-0e02b2c3d479-extra',  // too long
        'g47ac10b-58cc-4372-a567-0e02b2c3d479',  // invalid character
        123456,  // not a string
      ];

      invalidIds.forEach(id => {
        expect(isValidGardenId(id)).toBe(false);
      });
    });
  });


  describe('createShareableUrl', () => {
    it('should create URL with provided base', () => {
      const gardenId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const baseUrl = 'https://example.com';
      
      const url = createShareableUrl(gardenId, baseUrl);
      
      expect(url).toBe(`${baseUrl}/garden/${gardenId}`);
    });

    it('should use window.location.origin when no base provided', () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://localhost:3000' },
        writable: true
      });

      const gardenId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      
      const url = createShareableUrl(gardenId);
      
      expect(url).toBe(`https://localhost:3000/garden/${gardenId}`);
    });
  });

});