/**
 * Tests for Garden-Scoped App Content
 * Tests garden-specific routing with full app functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import GardenAppContent from '../GardenAppContent';

// Mock the cloud persistence service
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

// Mock the hooks
jest.mock('../../hooks/useSimulation', () => ({
  useSimulation: jest.fn(() => ({
    simulationResults: null,
    simulating: false,
    totalInvestment: 0
  }))
}));

jest.mock('../../hooks/useLocalStorage', () => ({
  useClimateSelection: jest.fn(() => ({
    selectedSummer: 'durham_hot',
    selectedWinter: 'durham_mild',
    selectedPortfolio: 'conservative',
    setSelectedSummer: jest.fn(),
    setSelectedWinter: jest.fn(),
    setSelectedPortfolio: jest.fn()
  })),
  useInvestmentConfig: jest.fn(() => [null, jest.fn()])
}));

jest.mock('../../hooks/useShoppingList', () => ({
  useShoppingList: jest.fn(() => ({ totalItems: 0 }))
}));

jest.mock('../../hooks/useCalendarTaskManager', () => ({
  useCalendarTaskManager: jest.fn(() => ({
    getUrgentPendingCount: jest.fn(() => 0)
  }))
}));

describe('GardenAppContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCloudPersistence.initialize.mockResolvedValue('test-garden-id');
    mockCloudPersistence.getGardenId.mockReturnValue('test-garden-id');
    mockCloudPersistence.getShareableUrl.mockReturnValue('https://example.com/garden/test-garden-id');
  });

  const renderWithRouter = (initialEntries = ['/garden/test-id/dashboard']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <GardenAppContent />
      </MemoryRouter>
    );
  };

  it('should handle garden dashboard route', async () => {
    await act(async () => {
      renderWithRouter(['/garden/test-id/dashboard']);
    });

    await waitFor(() => {
      expect(screen.getByText(/garden dashboard/i)).toBeInTheDocument();
    });

    expect(mockCloudPersistence.initialize).toHaveBeenCalledWith('test-id');
  });

  it('should handle garden analysis route', async () => {
    await act(async () => {
      renderWithRouter(['/garden/test-id/analysis']);
    });

    await waitFor(() => {
      expect(screen.getByText(/simulation results/i)).toBeInTheDocument();
    });
  });

  it('should handle garden shopping route', async () => {
    await act(async () => {
      renderWithRouter(['/garden/test-id/shopping']);
    });

    await waitFor(() => {
      expect(screen.getByText(/shopping/i)).toBeInTheDocument();
    });
  });

  it('should handle garden config route', async () => {
    await act(async () => {
      renderWithRouter(['/garden/test-id/config']);
    });

    await waitFor(() => {
      expect(screen.getByText(/garden configuration/i)).toBeInTheDocument();
    });
  });

  it('should show read-only mode for non-creator', async () => {
    // Mock this as not being the creator's garden
    mockCloudPersistence.getGardenId.mockReturnValue('different-id');

    await act(async () => {
      renderWithRouter(['/garden/test-id/dashboard']);
    });

    await waitFor(() => {
      expect(screen.getByText(/viewing garden/i)).toBeInTheDocument();
      expect(screen.getByText(/fork garden/i)).toBeInTheDocument();
    });
  });

  it('should show edit mode for creator', async () => {
    // Mock this as being the creator's garden
    localStorage.setItem('myGardens', JSON.stringify(['test-id']));

    await act(async () => {
      renderWithRouter(['/garden/test-id/dashboard']);
    });

    await waitFor(() => {
      expect(screen.queryByText(/viewing garden/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/fork garden/i)).not.toBeInTheDocument();
    });
  });

  it('should redirect garden root to dashboard', async () => {
    const mockReplace = jest.fn();
    require('react-router-dom').useNavigate = jest.fn(() => mockReplace);

    await act(async () => {
      renderWithRouter(['/garden/test-id']);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/garden/test-id/dashboard', { replace: true });
    });
  });

  it('should maintain garden context across navigation', async () => {
    await act(async () => {
      renderWithRouter(['/garden/test-id/dashboard']);
    });

    // Navigation should include garden ID in URLs
    await waitFor(() => {
      const navLinks = screen.getAllByRole('button');
      expect(navLinks.length).toBeGreaterThan(0);
    });
  });

  it('should load garden data from cloud', async () => {
    const gardenData = {
      config: { location: 'Durham' },
      settings: { theme: 'light' }
    };

    mockCloudPersistence.loadFromCloud.mockResolvedValue(gardenData);

    await act(async () => {
      renderWithRouter(['/garden/test-id/dashboard']);
    });

    await waitFor(() => {
      expect(mockCloudPersistence.loadFromCloud).toHaveBeenCalled();
    });
  });
});