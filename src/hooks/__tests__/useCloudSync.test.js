/**
 * Tests for useCloudSync hook
 * Tests React hook for managing cloud persistence with React Router
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import useCloudSync from '../useCloudSync';

// Mock React Router
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(() => jest.fn())
}));

// Mock cloud persistence service
const mockCloudPersistence = {
  initialize: jest.fn(),
  loadFromCloud: jest.fn(),
  saveToCloud: jest.fn(),
  getGardenId: jest.fn(),
  getShareableUrl: jest.fn(),
  addSyncListener: jest.fn(),
  removeSyncListener: jest.fn(),
  isSyncing: jest.fn(() => false),
  getLastSyncTime: jest.fn(() => null)
};

jest.mock('../../services/cloudPersistenceService', () => ({
  cloudPersistence: mockCloudPersistence
}));

// Mock garden ID utilities
jest.mock('../../utils/gardenId', () => ({
  generateGardenId: jest.fn(() => 'generated-id'),
  isValidGardenId: jest.fn((id) => /^[0-9a-f-]{36}$/.test(id))
}));

describe('useCloudSync', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ id: 'test-garden-id' });
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
    mockCloudPersistence.initialize.mockResolvedValue('test-garden-id');
    mockCloudPersistence.getGardenId.mockReturnValue('test-garden-id');
    mockCloudPersistence.getShareableUrl.mockReturnValue('https://example.com/garden/test-garden-id');
  });

  it('should initialize with garden ID from URL params', async () => {
    const gardenId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    useParams.mockReturnValue({ id: gardenId });

    const { result } = renderHook(() => useCloudSync());

    await waitFor(() => {
      expect(mockCloudPersistence.initialize).toHaveBeenCalledWith(gardenId);
    });

    expect(result.current.gardenId).toBe('test-garden-id');
  });

  it('should generate new garden ID when none provided in URL', async () => {
    useParams.mockReturnValue({});
    mockCloudPersistence.initialize.mockResolvedValue('generated-id');

    const { result } = renderHook(() => useCloudSync());

    await waitFor(() => {
      expect(mockCloudPersistence.initialize).toHaveBeenCalledWith(undefined);
    });

    // Should navigate to new garden URL
    expect(mockNavigate).toHaveBeenCalledWith('/garden/generated-id', { replace: true });
  });

  it('should handle invalid garden ID in URL', async () => {
    useParams.mockReturnValue({ id: 'invalid-id' });
    require('../../utils/gardenId').isValidGardenId.mockReturnValue(false);

    const { result } = renderHook(() => useCloudSync());

    await waitFor(() => {
      expect(result.current.error).toMatch(/invalid garden id/i);
    });
  });

  it('should load garden data from cloud on initialization', async () => {
    const gardenData = {
      config: { location: 'Durham' },
      tasks: [],
      settings: { theme: 'light' }
    };

    mockCloudPersistence.loadFromCloud.mockResolvedValue(gardenData);

    const { result } = renderHook(() => useCloudSync());

    await waitFor(() => {
      expect(mockCloudPersistence.loadFromCloud).toHaveBeenCalled();
      expect(result.current.gardenData).toEqual(gardenData);
    });
  });

  it('should handle cloud load errors gracefully', async () => {
    mockCloudPersistence.loadFromCloud.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCloudSync());

    await waitFor(() => {
      expect(result.current.error).toBe(null); // Should not set error for load failures
      expect(result.current.gardenData).toBe(null);
    });
  });

  it('should provide saveGardenData function', async () => {
    mockCloudPersistence.saveToCloud.mockResolvedValue(true);

    const { result } = renderHook(() => useCloudSync());

    await waitFor(() => {
      expect(result.current.saveGardenData).toBeInstanceOf(Function);
    });

    const testData = { config: { location: 'Durham' } };

    await act(async () => {
      await result.current.saveGardenData(testData);
    });

    expect(mockCloudPersistence.saveToCloud).toHaveBeenCalledWith(testData);
  });

  it('should track sync status', async () => {
    mockCloudPersistence.isSyncing.mockReturnValue(true);

    const { result } = renderHook(() => useCloudSync());

    await waitFor(() => {
      expect(result.current.isSyncing).toBe(true);
    });
  });

  it('should provide shareable URL', async () => {
    const { result } = renderHook(() => useCloudSync());

    await waitFor(() => {
      expect(result.current.shareableUrl).toBe('https://example.com/garden/test-garden-id');
    });
  });

  it('should handle sync events from cloud persistence service', async () => {
    let syncListener;
    mockCloudPersistence.addSyncListener.mockImplementation((listener) => {
      syncListener = listener;
    });

    const { result } = renderHook(() => useCloudSync());

    await waitFor(() => {
      expect(mockCloudPersistence.addSyncListener).toHaveBeenCalled();
    });

    // Simulate sync event
    act(() => {
      syncListener({ type: 'sync_success', operation: 'save' });
    });

    // Should update sync status
    expect(result.current.lastSyncTime).toBeTruthy();
  });

  it('should cleanup sync listeners on unmount', async () => {
    const { unmount } = renderHook(() => useCloudSync());

    await waitFor(() => {
      expect(mockCloudPersistence.addSyncListener).toHaveBeenCalled();
    });

    unmount();

    expect(mockCloudPersistence.removeSyncListener).toHaveBeenCalled();
  });

  it('should handle loading states correctly', async () => {
    // Mock slow initialization
    let resolveInit;
    mockCloudPersistence.initialize.mockImplementation(() => 
      new Promise(resolve => { resolveInit = resolve; })
    );

    const { result } = renderHook(() => useCloudSync());

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveInit('test-garden-id');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});