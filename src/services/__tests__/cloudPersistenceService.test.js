/**
 * Tests for CloudPersistenceService
 */

import { CloudPersistenceService } from '../cloudPersistenceService.js';
import { generateGardenId, isValidGardenId } from '../../utils/gardenId.js';

// Mock fetch globally
global.fetch = jest.fn();

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

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-1234-5678-abcd')
  }
});

describe('CloudPersistenceService', () => {
  let service;

  beforeEach(() => {
    service = new CloudPersistenceService();
    fetch.mockClear();
    Object.values(mockLocalStorage).forEach(mock => mock.mockClear());
  });

  describe('initialize', () => {
    it('should generate new garden ID when none provided', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const gardenId = await service.initialize();
      
      expect(isValidGardenId(gardenId)).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('currentGardenId', gardenId);
    });

    it('should use provided garden ID', async () => {
      const providedId = generateGardenId();
      
      const gardenId = await service.initialize(providedId);
      
      expect(gardenId).toBe(providedId);
      expect(service.getGardenId()).toBe(providedId);
    });

    it('should use current garden ID from localStorage', async () => {
      const existingId = generateGardenId();
      mockLocalStorage.getItem.mockReturnValue(existingId);
      
      const gardenId = await service.initialize();
      
      expect(gardenId).toBe(existingId);
    });
  });

  describe('saveToCloud', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should save garden data successfully', async () => {
      const gardenData = { 
        config: { location: 'Durham' },
        tasks: [],
        settings: { theme: 'light' }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, gardenId: service.getGardenId() })
      });

      const result = await service.saveToCloud(gardenData);

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(`/api/garden/${service.getGardenId()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gardenData)
      });
    });

    it('should handle save errors gracefully', async () => {
      const gardenData = { config: { location: 'Durham' } };

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' })
      });

      const result = await service.saveToCloud(gardenData);

      expect(result).toBe(false);
    });

    it('should notify sync listeners', async () => {
      const mockListener = jest.fn();
      service.addSyncListener(mockListener);

      const gardenData = { config: { location: 'Durham' } };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await service.saveToCloud(gardenData);

      expect(mockListener).toHaveBeenCalledWith({ type: 'sync_start', operation: 'save' });
      expect(mockListener).toHaveBeenCalledWith(expect.objectContaining({ 
        type: 'sync_success', 
        operation: 'save' 
      }));
    });
  });

  describe('loadFromCloud', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should load garden data successfully', async () => {
      const gardenData = { 
        config: { location: 'Durham' },
        gardenId: service.getGardenId()
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => gardenData
      });

      const result = await service.loadFromCloud();

      expect(result).toEqual(gardenData);
      expect(fetch).toHaveBeenCalledWith(`/api/garden/${service.getGardenId()}`);
    });

    it('should return null when garden not found', async () => {
      fetch.mockResolvedValueOnce({
        status: 404,
        ok: false
      });

      const result = await service.loadFromCloud();

      expect(result).toBeNull();
    });

    it('should handle load errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.loadFromCloud();

      expect(result).toBeNull();
    });
  });

  describe('sync status', () => {
    it('should track sync status correctly', async () => {
      await service.initialize();
      
      expect(service.isSyncing()).toBe(false);

      // Mock a slow response to test sync status
      let resolvePromise;
      const slowPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      fetch.mockReturnValueOnce(slowPromise);

      const savePromise = service.saveToCloud({ test: 'data' });
      
      expect(service.isSyncing()).toBe(true);

      resolvePromise({
        ok: true,
        json: async () => ({ success: true })
      });

      await savePromise;
      
      expect(service.isSyncing()).toBe(false);
    });

    it('should track last sync time', async () => {
      await service.initialize();
      
      expect(service.getLastSyncTime()).toBeNull();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await service.saveToCloud({ test: 'data' });

      expect(service.getLastSyncTime()).toBeTruthy();
      expect(new Date(service.getLastSyncTime())).toBeInstanceOf(Date);
    });
  });

  describe('shareable URLs', () => {
    it('should generate shareable URL', async () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com' },
        writable: true
      });

      await service.initialize();
      
      const url = service.getShareableUrl();
      
      expect(url).toBe(`https://example.com/garden/${service.getGardenId()}`);
    });

    it('should return null when no garden ID', () => {
      const url = service.getShareableUrl();
      expect(url).toBeNull();
    });
  });
});