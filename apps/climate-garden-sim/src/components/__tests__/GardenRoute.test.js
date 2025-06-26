/**
 * Tests for Garden Route Component
 * Tests React Router integration for garden-specific URLs
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import GardenRoute from '../GardenRoute';

// Mock the cloud persistence service
const mockCloudPersistence = {
  initialize: jest.fn(),
  loadFromCloud: jest.fn(),
  getGardenId: jest.fn(),
  addSyncListener: jest.fn(),
  removeSyncListener: jest.fn(),
  isSyncing: jest.fn(() => false),
  getLastSyncTime: jest.fn(() => null)
};

jest.mock('../../services/cloudPersistenceService', () => ({
  cloudPersistence: mockCloudPersistence
}));

// Mock the main app content
jest.mock('../AppContent', () => {
  const React = require('react');
  return function MockAppContent({ gardenId, onGardenLoad }) {
    React.useEffect(() => {
      onGardenLoad && onGardenLoad({ config: { location: 'Durham' } });
    }, [onGardenLoad]);
    
    return React.createElement('div', { 'data-testid': 'app-content' }, `App Content - Garden ID: ${gardenId}`);
  };
});

describe('GardenRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCloudPersistence.initialize.mockResolvedValue('test-garden-id');
    mockCloudPersistence.getGardenId.mockReturnValue('test-garden-id');
  });

  const renderWithRouter = (initialEntries = ['/garden/test-id']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <GardenRoute />
      </MemoryRouter>
    );
  };

  it('should initialize cloud persistence with garden ID from URL', async () => {
    const gardenId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    
    renderWithRouter([`/garden/${gardenId}`]);

    await waitFor(() => {
      expect(mockCloudPersistence.initialize).toHaveBeenCalledWith(gardenId);
    });
  });

  it('should display loading state while initializing', () => {
    mockCloudPersistence.initialize.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithRouter();

    expect(screen.getByText(/loading garden/i)).toBeInTheDocument();
  });

  it('should display error state for invalid garden ID', async () => {
    const invalidId = 'invalid-garden-id';
    
    renderWithRouter([`/garden/${invalidId}`]);

    await waitFor(() => {
      expect(screen.getByText(/invalid garden id/i)).toBeInTheDocument();
    });
  });

  it('should load garden data from cloud when available', async () => {
    const gardenData = {
      config: { location: 'Durham' },
      tasks: [],
      settings: { theme: 'light' }
    };

    mockCloudPersistence.loadFromCloud.mockResolvedValue(gardenData);

    await act(async () => {
      renderWithRouter();
    });

    await waitFor(() => {
      expect(mockCloudPersistence.loadFromCloud).toHaveBeenCalled();
      expect(screen.getByTestId('app-content')).toBeInTheDocument();
    });
  });

  it('should handle cloud load errors gracefully', async () => {
    mockCloudPersistence.loadFromCloud.mockRejectedValue(new Error('Network error'));

    await act(async () => {
      renderWithRouter();
    });

    await waitFor(() => {
      // Should still render app content even if cloud load fails
      expect(screen.getByTestId('app-content')).toBeInTheDocument();
    });
  });

  it('should display sync status', async () => {
    mockCloudPersistence.isSyncing.mockReturnValue(true);

    await act(async () => {
      renderWithRouter();
    });

    await waitFor(() => {
      expect(screen.getByText(/syncing/i)).toBeInTheDocument();
    });
  });

  it('should display last sync time when available', async () => {
    const lastSync = '2024-01-01T12:00:00.000Z';
    mockCloudPersistence.getLastSyncTime.mockReturnValue(lastSync);

    await act(async () => {
      renderWithRouter();
    });

    await waitFor(() => {
      expect(screen.getByText(/last synced/i)).toBeInTheDocument();
    });
  });

  it('should cleanup sync listeners on unmount', async () => {
    const { unmount } = await act(async () => {
      return renderWithRouter();
    });

    await act(async () => {
      unmount();
    });

    expect(mockCloudPersistence.removeSyncListener).toHaveBeenCalled();
  });
});