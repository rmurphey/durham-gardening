/**
 * ShoppingView Async Loading Tests
 * Tests the async annual seed plan loading functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ShoppingView from '../ShoppingView';

// Mock the annual seed planning service
jest.mock('../../services/annualSeedPlanningService', () => ({
  generateAnnualSeedPlan: jest.fn()
}));

// Mock other dependencies
jest.mock('../../services/temporalShoppingService', () => ({
  generatePureShoppingRecommendations: jest.fn(() => [])
}));

jest.mock('../../data/portfolioStrategies', () => ({
  getPortfolioStrategies: jest.fn(() => ({
    hedge: { heatSpecialists: 0.3, coolSeason: 0.4 }
  }))
}));

jest.mock('../../config/defaultConfig', () => ({
  DURHAM_CONFIG: { location: 'Durham, NC' }
}));

import { generateAnnualSeedPlan } from '../../services/annualSeedPlanningService';

describe('ShoppingView Async Loading', () => {
  const mockShoppingActions = {
    shoppingList: [],
    totalItems: 0,
    getTotalCost: () => 0,
    addToShoppingList: jest.fn(),
    markAsOwned: jest.fn(),
    getItemStatus: jest.fn(() => 'unselected'),
    removeFromShoppingList: jest.fn(),
    clearShoppingList: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading States', () => {
    test('shows loading state while plan is being generated', () => {
      // Mock a never-resolving promise to keep loading state visible
      generateAnnualSeedPlan.mockImplementation(() => new Promise(() => {}));
      
      render(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      expect(screen.getByText('🛒 Loading Annual Seed Plan...')).toBeInTheDocument();
      expect(screen.getByText('Querying database for specific seed ordering recommendations...')).toBeInTheDocument();
    });

    test('does not show main content during loading', () => {
      generateAnnualSeedPlan.mockImplementation(() => new Promise(() => {}));
      
      render(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      expect(screen.queryByText('🛒 Annual Seed Planning & Shopping')).not.toBeInTheDocument();
      expect(screen.queryByText('📋 Annual Plan')).not.toBeInTheDocument();
    });
  });

  describe('Successful Loading', () => {
    const mockAnnualPlan = {
      seedOrders: [
        {
          id: 'seed_kale',
          crop: 'Kale',
          variety: 'Red Russian',
          category: 'Seeds',
          totalCost: 7.90,
          vendor: 'True Leaf Market'
        }
      ],
      infrastructure: [],
      supplies: [],
      totalBudget: 7.90,
      purchaseWindows: [
        {
          name: 'Winter Ordering',
          timing: 'December - February',
          items: [],
          totalCost: 0
        }
      ],
      vendorGroups: {
        'true_leaf_market': {
          name: 'True Leaf Market',
          items: [],
          totalCost: 0
        }
      }
    };

    test('displays main content after successful loading', async () => {
      generateAnnualSeedPlan.mockResolvedValue(mockAnnualPlan);
      
      render(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      await waitFor(() => {
        expect(screen.getByText('🛒 Annual Seed Planning & Shopping')).toBeInTheDocument();
      });
      
      expect(screen.getByText('📋 Annual Plan')).toBeInTheDocument();
      expect(screen.queryByText('Loading Annual Seed Plan')).not.toBeInTheDocument();
    });

    test('passes loaded plan data to child components', async () => {
      generateAnnualSeedPlan.mockResolvedValue(mockAnnualPlan);
      
      render(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      await waitFor(() => {
        expect(screen.getByText('🎯 Complete Annual Plan')).toBeInTheDocument();
      });
      
      expect(screen.getByText('$7.9')).toBeInTheDocument(); // Total budget display
      expect(screen.getByText('1')).toBeInTheDocument(); // Seed varieties count
    });

    test('displays purchase windows from loaded plan', async () => {
      generateAnnualSeedPlan.mockResolvedValue(mockAnnualPlan);
      
      render(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      await waitFor(() => {
        expect(screen.getByText('📅 Strategic Purchase Timing')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Winter Ordering')).toBeInTheDocument();
    });

    test('displays vendor groups from loaded plan', async () => {
      generateAnnualSeedPlan.mockResolvedValue(mockAnnualPlan);
      
      render(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      await waitFor(() => {
        expect(screen.getByText('🏪 Vendor Consolidation')).toBeInTheDocument();
      });
      
      expect(screen.getByText('True Leaf Market')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('shows main content with empty plan when loading fails', async () => {
      const error = new Error('Database connection failed');
      generateAnnualSeedPlan.mockRejectedValue(error);
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      await waitFor(() => {
        expect(screen.getByText('🛒 Annual Seed Planning & Shopping')).toBeInTheDocument();
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Error loading annual seed plan:', error);
      expect(screen.queryByText('Loading Annual Seed Plan')).not.toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    test('provides fallback empty plan structure on error', async () => {
      generateAnnualSeedPlan.mockRejectedValue(new Error('Test error'));
      
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      await waitFor(() => {
        expect(screen.getByText('🎯 Complete Annual Plan')).toBeInTheDocument();
      });
      
      // Should show empty state indicators
      expect(screen.getByText('$0')).toBeInTheDocument(); // Empty budget
      expect(screen.getByText('0')).toBeInTheDocument(); // No seed varieties
      
      console.error.mockRestore();
    });

    test('continues to function with empty plan after error', async () => {
      generateAnnualSeedPlan.mockRejectedValue(new Error('Test error'));
      
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      await waitFor(() => {
        expect(screen.getByText('📋 Annual Plan')).toBeInTheDocument();
      });
      
      // Should still be able to toggle view modes
      expect(screen.getByText('⚡ Urgent Only')).toBeInTheDocument();
      
      console.error.mockRestore();
    });
  });

  describe('View Mode Integration', () => {
    test('defaults to annual view mode after loading', async () => {
      const mockPlan = {
        seedOrders: [],
        infrastructure: [],
        supplies: [],
        totalBudget: 0,
        purchaseWindows: [],
        vendorGroups: {}
      };
      
      generateAnnualSeedPlan.mockResolvedValue(mockPlan);
      
      render(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      await waitFor(() => {
        expect(screen.getByText('📋 Annual Plan')).toBeInTheDocument();
      });
      
      const annualButton = screen.getByText('📋 Annual Plan');
      expect(annualButton).toHaveClass('active');
    });

    test('shopping list panel is always visible regardless of loading state', () => {
      generateAnnualSeedPlan.mockImplementation(() => new Promise(() => {}));
      
      render(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      // Shopping list should be visible even during loading
      expect(screen.getByText('🛒 Shopping List')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    test('passes correct props to AnnualSeedPlanPanel after loading', async () => {
      const mockPlan = {
        seedOrders: [{ id: 'test', crop: 'Test', totalCost: 5 }],
        infrastructure: [],
        supplies: [],
        totalBudget: 5,
        purchaseWindows: [],
        vendorGroups: {}
      };
      
      generateAnnualSeedPlan.mockResolvedValue(mockPlan);
      
      render(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      await waitFor(() => {
        expect(screen.getByText('🌱 Complete Annual Seed & Supply List')).toBeInTheDocument();
      });
      
      // Component should receive the loaded plan
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    test('passes shopping actions to all child components', async () => {
      const mockPlan = {
        seedOrders: [],
        infrastructure: [],
        supplies: [],
        totalBudget: 0,
        purchaseWindows: [],
        vendorGroups: {}
      };
      
      generateAnnualSeedPlan.mockResolvedValue(mockPlan);
      
      render(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      await waitFor(() => {
        expect(screen.getByText('🛒 Annual Seed Planning & Shopping')).toBeInTheDocument();
      });
      
      // Shopping actions should be passed through
      expect(screen.getByText('🛒 Shopping List')).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    test('does not regenerate plan on re-renders', async () => {
      const mockPlan = {
        seedOrders: [],
        infrastructure: [],
        supplies: [],
        totalBudget: 0,
        purchaseWindows: [],
        vendorGroups: {}
      };
      
      generateAnnualSeedPlan.mockResolvedValue(mockPlan);
      
      const { rerender } = render(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      await waitFor(() => {
        expect(screen.getByText('🛒 Annual Seed Planning & Shopping')).toBeInTheDocument();
      });
      
      // Re-render with same props
      rerender(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      // Should only call generateAnnualSeedPlan once due to useEffect dependencies
      expect(generateAnnualSeedPlan).toHaveBeenCalledTimes(1);
    });

    test('cleans up properly on unmount', async () => {
      const mockPlan = {
        seedOrders: [],
        infrastructure: [],
        supplies: [],
        totalBudget: 0,
        purchaseWindows: [],
        vendorGroups: {}
      };
      
      generateAnnualSeedPlan.mockResolvedValue(mockPlan);
      
      const { unmount } = render(<ShoppingView shoppingActions={mockShoppingActions} />);
      
      await waitFor(() => {
        expect(screen.getByText('🛒 Annual Seed Planning & Shopping')).toBeInTheDocument();
      });
      
      // Should unmount without issues
      expect(() => unmount()).not.toThrow();
    });
  });
});