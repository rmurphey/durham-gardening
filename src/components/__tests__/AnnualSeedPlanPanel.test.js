/**
 * Annual Seed Plan Panel Component Tests
 * Tests the comprehensive seed planning interface
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AnnualSeedPlanPanel from '../AnnualSeedPlanPanel';

describe('AnnualSeedPlanPanel', () => {
  const mockSeedPlan = {
    seedOrders: [
      {
        id: 'seed_kale',
        crop: 'Kale',
        variety: 'Red Russian Kale',
        category: 'Seeds',
        packetsNeeded: 2,
        successionPlantings: 4,
        pricePerPacket: 3.95,
        totalCost: 7.90,
        vendor: 'True Leaf Market',
        vendorSku: 'KAL-RED-500',
        vendorUrl: 'https://www.trueleafmarket.com/products/kale-red-russian',
        notes: 'Most bolt-resistant kale for Durham climate',
        specificInstructions: '🛒 ORDER: 2 packets of Red Russian Kale\n🏪 VENDOR: True Leaf Market (SKU: KAL-RED-500)\n💰 COST: $7.90 total'
      },
      {
        id: 'seed_lettuce',
        crop: 'Lettuce',
        variety: 'Jericho Lettuce (Romaine)',
        category: 'Seeds',
        packetsNeeded: 3,
        successionPlantings: 6,
        pricePerPacket: 5.50,
        totalCost: 16.50,
        vendor: 'Johnny\'s Seeds',
        vendorSku: 'LET-JER-1000',
        vendorUrl: 'https://www.johnnyseeds.com/vegetables/lettuce/romaine-lettuce/jericho-lettuce',
        notes: 'Heat-tolerant romaine, essential for Durham climate',
        specificInstructions: '🛒 ORDER: 3 packets of Jericho Lettuce\n🏪 VENDOR: Johnny\'s Seeds (SKU: LET-JER-1000)\n💰 COST: $16.50 total'
      }
    ],
    infrastructure: [
      {
        id: 'infrastructure_irrigation',
        item: 'Drip Irrigation Kit',
        category: 'Infrastructure',
        cost: 85.00
      }
    ],
    supplies: [
      {
        id: 'supply_compost',
        item: 'Organic Compost',
        category: 'Supplies',
        cost: 60.00
      }
    ]
  };

  const defaultProps = {
    seedPlan: mockSeedPlan,
    onAddToShoppingList: jest.fn(),
    onMarkAsOwned: jest.fn(),
    getItemStatus: jest.fn(() => 'unselected')
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      expect(() => {
        render(<AnnualSeedPlanPanel {...defaultProps} />);
      }).not.toThrow();
    });

    test('displays plan header with progress stats', () => {
      render(<AnnualSeedPlanPanel {...defaultProps} />);
      
      expect(screen.getByText('🌱 Complete Annual Seed & Supply List')).toBeInTheDocument();
      expect(screen.getByText(/Owned/)).toBeInTheDocument();
      expect(screen.getByText(/Listed/)).toBeInTheDocument();
      expect(screen.getByText(/Needed/)).toBeInTheDocument();
    });

    test('displays all seed items', () => {
      render(<AnnualSeedPlanPanel {...defaultProps} />);
      
      expect(screen.getByText('Kale')).toBeInTheDocument();
      expect(screen.getByText('Red Russian Kale')).toBeInTheDocument();
      expect(screen.getByText('Lettuce')).toBeInTheDocument();
      expect(screen.getByText('Jericho Lettuce (Romaine)')).toBeInTheDocument();
    });

    test('displays infrastructure and supply items', () => {
      render(<AnnualSeedPlanPanel {...defaultProps} />);
      
      expect(screen.getByText('Drip Irrigation Kit')).toBeInTheDocument();
      expect(screen.getByText('Organic Compost')).toBeInTheDocument();
    });

    test('shows item details including packets and cost', () => {
      render(<AnnualSeedPlanPanel {...defaultProps} />);
      
      expect(screen.getByText('2')).toBeInTheDocument(); // Kale packets
      expect(screen.getByText('$7.90')).toBeInTheDocument(); // Kale cost
      expect(screen.getByText('3')).toBeInTheDocument(); // Lettuce packets
      expect(screen.getByText('$16.50')).toBeInTheDocument(); // Lettuce cost
    });
  });

  describe('Filtering', () => {
    test('filters by category', () => {
      render(<AnnualSeedPlanPanel {...defaultProps} />);
      
      const categorySelect = screen.getByDisplayValue('All Items');
      fireEvent.change(categorySelect, { target: { value: 'Seeds' } });
      
      expect(screen.getByText('Kale')).toBeInTheDocument();
      expect(screen.getByText('Lettuce')).toBeInTheDocument();
      expect(screen.queryByText('Drip Irrigation Kit')).not.toBeInTheDocument();
    });

    test('filters to show only needed items', () => {
      const mockGetItemStatus = jest.fn()
        .mockReturnValueOnce('shopping') // Kale is already added
        .mockReturnValue('unselected'); // Others are not added
      
      render(
        <AnnualSeedPlanPanel 
          {...defaultProps} 
          getItemStatus={mockGetItemStatus}
        />
      );
      
      const needFilter = screen.getByLabelText(/Show only needed items/);
      fireEvent.click(needFilter);
      
      // Kale should be hidden (already added), Lettuce should show (needed)
      expect(screen.queryByText('Kale')).not.toBeInTheDocument();
      expect(screen.getByText('Lettuce')).toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    test('calculates progress stats correctly', () => {
      const mockGetItemStatus = jest.fn()
        .mockReturnValueOnce('owned') // Kale is owned
        .mockReturnValueOnce('shopping') // Lettuce is in shopping list
        .mockReturnValue('unselected'); // Others are unselected
      
      render(
        <AnnualSeedPlanPanel 
          {...defaultProps} 
          getItemStatus={mockGetItemStatus}
        />
      );
      
      expect(screen.getByText('✓ 1 Owned')).toBeInTheDocument();
      expect(screen.getByText('📝 1 Listed')).toBeInTheDocument();
      expect(screen.getByText('🛒 2 Needed')).toBeInTheDocument();
    });

    test('shows "Add All Needed" button when there are needed items', () => {
      render(<AnnualSeedPlanPanel {...defaultProps} />);
      
      expect(screen.getByText(/Add All Needed/)).toBeInTheDocument();
    });

    test('hides "Add All Needed" button when no items needed', () => {
      const mockGetItemStatus = jest.fn(() => 'owned'); // All items owned
      
      render(
        <AnnualSeedPlanPanel 
          {...defaultProps} 
          getItemStatus={mockGetItemStatus}
        />
      );
      
      expect(screen.queryByText(/Add All Needed/)).not.toBeInTheDocument();
    });
  });

  describe('Item Actions', () => {
    test('calls onAddToShoppingList when Add button is clicked', () => {
      render(<AnnualSeedPlanPanel {...defaultProps} />);
      
      const addButton = screen.getAllByText('+ Add to List')[0];
      fireEvent.click(addButton);
      
      expect(defaultProps.onAddToShoppingList).toHaveBeenCalledWith({
        id: 'seed_kale',
        item: 'Kale',
        price: 7.90,
        category: 'Seeds',
        quantity: 2,
        notes: 'Most bolt-resistant kale for Durham climate',
        vendor: 'True Leaf Market'
      });
    });

    test('calls onMarkAsOwned when Have It button is clicked', () => {
      render(<AnnualSeedPlanPanel {...defaultProps} />);
      
      const ownedButton = screen.getAllByText('Have It')[0];
      fireEvent.click(ownedButton);
      
      expect(defaultProps.onMarkAsOwned).toHaveBeenCalledWith('seed_kale');
    });

    test('calls onAddToShoppingList for all needed items when Add All Needed is clicked', () => {
      render(<AnnualSeedPlanPanel {...defaultProps} />);
      
      const addAllButton = screen.getByText(/Add All Needed/);
      fireEvent.click(addAllButton);
      
      expect(defaultProps.onAddToShoppingList).toHaveBeenCalledTimes(4); // 2 seeds + 1 infrastructure + 1 supply
    });

    test('disables buttons based on item status', () => {
      const mockGetItemStatus = jest.fn()
        .mockReturnValueOnce('shopping') // Kale is in shopping list
        .mockReturnValueOnce('owned') // Lettuce is owned
        .mockReturnValue('unselected');
      
      render(
        <AnnualSeedPlanPanel 
          {...defaultProps} 
          getItemStatus={mockGetItemStatus}
        />
      );
      
      const buttons = screen.getAllByRole('button');
      const kaleAddButton = buttons.find(btn => btn.textContent === '✓ Added');
      const lettuceOwnedButton = buttons.find(btn => btn.textContent === '✓ Own It');
      
      expect(kaleAddButton).toBeDisabled();
      expect(lettuceOwnedButton).toBeDisabled();
    });
  });

  describe('Specific Ordering Instructions', () => {
    test('shows expandable instructions section for items with specific instructions', () => {
      render(<AnnualSeedPlanPanel {...defaultProps} />);
      
      expect(screen.getAllByText('📋 Specific Ordering Instructions')).toHaveLength(2);
    });

    test('expands and shows detailed instructions when clicked', () => {
      render(<AnnualSeedPlanPanel {...defaultProps} />);
      
      const instructionsToggle = screen.getAllByText('📋 Specific Ordering Instructions')[0];
      fireEvent.click(instructionsToggle);
      
      expect(screen.getByText(/🛒 ORDER: 2 packets of Red Russian Kale/)).toBeInTheDocument();
      expect(screen.getByText(/🏪 VENDOR: True Leaf Market/)).toBeInTheDocument();
      expect(screen.getByText(/💰 COST: \$7\.90 total/)).toBeInTheDocument();
    });

    test('shows vendor links when available', () => {
      render(<AnnualSeedPlanPanel {...defaultProps} />);
      
      const instructionsToggle = screen.getAllByText('📋 Specific Ordering Instructions')[0];
      fireEvent.click(instructionsToggle);
      
      const vendorLink = screen.getByText(/View on True Leaf Market website/);
      expect(vendorLink.closest('a')).toHaveAttribute('href', 
        'https://www.trueleafmarket.com/products/kale-red-russian');
      expect(vendorLink.closest('a')).toHaveAttribute('target', '_blank');
    });
  });

  describe('Defensive Programming', () => {
    test('handles empty seed plan gracefully', () => {
      const emptyPlan = {
        seedOrders: [],
        infrastructure: [],
        supplies: []
      };
      
      expect(() => {
        render(<AnnualSeedPlanPanel seedPlan={emptyPlan} />);
      }).not.toThrow();
      
      expect(screen.getByText(/All set! You have everything you need/)).toBeInTheDocument();
    });

    test('handles missing props with defaults', () => {
      expect(() => {
        render(<AnnualSeedPlanPanel />);
      }).not.toThrow();
    });

    test('handles undefined item properties', () => {
      const planWithIncompleteItems = {
        seedOrders: [{
          id: 'incomplete_item',
          crop: 'Test Crop'
          // Missing other properties
        }],
        infrastructure: [],
        supplies: []
      };
      
      expect(() => {
        render(<AnnualSeedPlanPanel seedPlan={planWithIncompleteItems} />);
      }).not.toThrow();
    });
  });

  describe('No Items State', () => {
    test('shows appropriate message when no items match filters', () => {
      render(<AnnualSeedPlanPanel {...defaultProps} />);
      
      // Filter to category with no items
      const categorySelect = screen.getByDisplayValue('All Items');
      fireEvent.change(categorySelect, { target: { value: 'Perennials' } });
      
      expect(screen.getByText('No items match the current filters.')).toBeInTheDocument();
    });

    test('shows success message when showing only needed but all items are handled', () => {
      const mockGetItemStatus = jest.fn(() => 'owned'); // All items owned
      
      render(
        <AnnualSeedPlanPanel 
          {...defaultProps} 
          getItemStatus={mockGetItemStatus}
        />
      );
      
      const needFilter = screen.getByLabelText(/Show only needed items/);
      fireEvent.click(needFilter);
      
      expect(screen.getByText(/🎉 All set! You have everything you need/)).toBeInTheDocument();
    });
  });
});