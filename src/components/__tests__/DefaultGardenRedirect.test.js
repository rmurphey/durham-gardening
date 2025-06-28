/**
 * Tests for DefaultGardenRedirect Component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DefaultGardenRedirect from '../DefaultGardenRedirect';

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock garden ID utilities
jest.mock('../../utils/gardenId', () => ({
  generateGardenId: jest.fn(() => 'generated-garden-id')
}));

// Get the mocked function
const { generateGardenId: mockGenerateGardenId } = require('../../utils/gardenId');

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

describe('DefaultGardenRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockGenerateGardenId.mockReturnValue('generated-garden-id');
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <DefaultGardenRedirect />
      </MemoryRouter>
    );
  };

  it('should redirect to existing default garden', async () => {
    const existingGardenId = 'existing-garden-123';
    mockLocalStorage.getItem.mockReturnValue(existingGardenId);

    renderComponent();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `/garden/${existingGardenId}/dashboard`,
        { replace: true }
      );
    });

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('defaultGardenId');
  });

  it('should use first owned garden as default when no default set', async () => {
    const ownedGardens = ['garden-1', 'garden-2', 'garden-3'];
    
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'defaultGardenId') return null;
      if (key === 'myGardens') return JSON.stringify(ownedGardens);
      return null;
    });

    renderComponent();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `/garden/garden-1/dashboard`,
        { replace: true }
      );
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('defaultGardenId', 'garden-1');
  });

  it('should create new garden when no existing gardens', async () => {
    const newGardenId = 'generated-garden-id';
    
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'defaultGardenId') return null;
      if (key === 'myGardens') return '[]';
      return null;
    });

    renderComponent();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `/garden/${newGardenId}/dashboard`,
        { replace: true }
      );
    }, { timeout: 100 });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('defaultGardenId', newGardenId);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('myGardens', JSON.stringify([newGardenId]));
  });

  it('should handle localStorage errors gracefully', async () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('LocalStorage error');
    });

    renderComponent();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `/garden/generated-garden-id/dashboard`,
        { replace: true }
      );
    }, { timeout: 100 });
  });

  it('should handle invalid JSON in myGardens', async () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'defaultGardenId') return null;
      if (key === 'myGardens') return 'invalid-json';
      return null;
    });

    renderComponent();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `/garden/generated-garden-id/dashboard`,
        { replace: true }
      );
    }, { timeout: 100 });
  });

  it('should display loading message while redirecting', () => {
    renderComponent();

    expect(screen.getByText(/loading your garden/i)).toBeInTheDocument();
    expect(screen.getByText(/setting up your personalized garden dashboard/i)).toBeInTheDocument();
  });

  it('should only call navigate once', async () => {
    mockLocalStorage.getItem.mockReturnValue('test-garden-id');

    renderComponent();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });
});