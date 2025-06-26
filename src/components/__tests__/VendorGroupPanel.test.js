/**
 * Vendor Group Panel Component Tests
 * Tests vendor-based grouping and bulk ordering interface
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VendorGroupPanel from '../VendorGroupPanel';

describe('VendorGroupPanel', () => {
  const mockVendor = {
    name: 'True Leaf Market',
    items: [
      {
        id: 'seed_kale',
        crop: 'Kale',
        variety: 'Red Russian Kale',
        category: 'Seeds',
        packetsNeeded: 2,
        totalCost: 7.90,
        notes: 'Heat-tolerant variety'
      },
      {
        id: 'seed_okra',
        crop: 'Okra',
        variety: 'Clemson Spineless',
        category: 'Seeds',
        packetsNeeded: 1,
        totalCost: 4.95,
        description: 'Classic reliable variety'
      }
    ],
    totalCost: 12.85,
    shippingThreshold: 50.00,
    notes: 'Excellent selection, proven reliability'
  };

  const defaultProps = {
    vendor: mockVendor,
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
        render(<VendorGroupPanel {...defaultProps} />);
      }).not.toThrow();
    });

    test('displays vendor name and stats', () => {
      render(<VendorGroupPanel {...defaultProps} />);
      
      expect(screen.getByText('True Leaf Market')).toBeInTheDocument();
      expect(screen.getByText('$12.85')).toBeInTheDocument();
      expect(screen.getByText('2 items')).toBeInTheDocument();
    });

    test('displays vendor notes', () => {
      render(<VendorGroupPanel {...defaultProps} />);
      
      expect(screen.getByText('Excellent selection, proven reliability')).toBeInTheDocument();
    });

    test('shows shipping status below threshold', () => {
      render(<VendorGroupPanel {...defaultProps} />);
      
      expect(screen.getByText(/Add \$37\.15 for free shipping/)).toBeInTheDocument();
      expect(screen.getByText(/📦 Add/)).toBeInTheDocument();
    });

    test('shows free shipping when over threshold', () => {
      const overThresholdVendor = {
        ...mockVendor,
        totalCost: 65.00
      };
      
      render(<VendorGroupPanel {...defaultProps} vendor={overThresholdVendor} />);
      
      expect(screen.getByText(/Free shipping \(over \$50\)/)).toBeInTheDocument();
    });
  });

  describe('Expand/Collapse Functionality', () => {
    test('starts collapsed by default', () => {
      render(<VendorGroupPanel {...defaultProps} />);
      
      expect(screen.queryByText('📦 Add All to Shopping List')).not.toBeInTheDocument();
      expect(screen.queryByText('Kale')).not.toBeInTheDocument();
    });

    test('expands when header is clicked', () => {
      render(<VendorGroupPanel {...defaultProps} />);
      
      const header = screen.getByText('True Leaf Market').closest('.card-header');
      fireEvent.click(header);
      
      expect(screen.getByText('📦 Add All to Shopping List')).toBeInTheDocument();
      expect(screen.getByText('Kale')).toBeInTheDocument();
      expect(screen.getByText('Okra')).toBeInTheDocument();
    });

    test('toggles expand button icon', () => {
      render(<VendorGroupPanel {...defaultProps} />);
      
      const expandButton = screen.getByText('▶');
      expect(expandButton).toBeInTheDocument();
      
      fireEvent.click(expandButton);
      expect(screen.getByText('▼')).toBeInTheDocument();
      expect(screen.queryByText('▶')).not.toBeInTheDocument();
    });
  });

  describe('Item Display', () => {
    beforeEach(() => {
      render(<VendorGroupPanel {...defaultProps} />);
      const header = screen.getByText('True Leaf Market').closest('.card-header');
      fireEvent.click(header); // Expand to show items
    });

    test('displays all vendor items when expanded', () => {
      expect(screen.getByText('Kale')).toBeInTheDocument();
      expect(screen.getByText(/Red Russian Kale/)).toBeInTheDocument();
      expect(screen.getByText('Okra')).toBeInTheDocument();
      expect(screen.getByText(/Clemson Spineless/)).toBeInTheDocument();
    });

    test('shows item categories and costs', () => {
      expect(screen.getAllByText('Seeds')).toHaveLength(2);
      expect(screen.getByText('$7.90')).toBeInTheDocument();
      expect(screen.getByText('$4.95')).toBeInTheDocument();
    });

    test('displays packet information when available', () => {
      expect(screen.getByText('2 packets')).toBeInTheDocument();
      expect(screen.getByText('1 packets')).toBeInTheDocument();
    });

    test('shows item notes and descriptions', () => {
      expect(screen.getByText('Heat-tolerant variety')).toBeInTheDocument();
      expect(screen.getByText('Classic reliable variety')).toBeInTheDocument();
    });
  });

  describe('Individual Item Actions', () => {
    beforeEach(() => {
      render(<VendorGroupPanel {...defaultProps} />);
      const header = screen.getByText('True Leaf Market').closest('.card-header');
      fireEvent.click(header); // Expand to show items
    });

    test('calls onAddToShoppingList when individual Add button is clicked', () => {
      const addButtons = screen.getAllByText('+ Add');
      fireEvent.click(addButtons[0]); // Click first item's add button
      
      expect(defaultProps.onAddToShoppingList).toHaveBeenCalledWith({
        id: 'seed_kale',
        item: 'Kale',
        price: 7.90,
        category: 'Seeds',
        quantity: 2,
        notes: 'Heat-tolerant variety',
        vendor: 'True Leaf Market'
      });
    });

    test('calls onMarkAsOwned when Have It button is clicked', () => {
      const ownedButtons = screen.getAllByText('Have It');
      fireEvent.click(ownedButtons[1]); // Click second item's owned button
      
      expect(defaultProps.onMarkAsOwned).toHaveBeenCalledWith('seed_okra');
    });

    test('shows correct button states based on item status', () => {
      const mockGetItemStatus = jest.fn((id) => {
        if (id === 'seed_kale') return 'shopping'; // Kale is added
        if (id === 'seed_okra') return 'owned'; // Okra is owned
        return 'unselected';
      });
      
      render(
        <VendorGroupPanel 
          {...defaultProps} 
          getItemStatus={mockGetItemStatus}
        />
      );
      
      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);
      
      expect(screen.getByText('✓ Added')).toBeInTheDocument();
      expect(screen.getByText('✓ Own')).toBeInTheDocument();
    });

    test('disables buttons based on item status', () => {
      const mockGetItemStatus = jest.fn((id) => {
        if (id === 'seed_kale') return 'shopping'; // Kale is added
        if (id === 'seed_okra') return 'owned'; // Okra is owned
        return 'unselected';
      });
      
      render(
        <VendorGroupPanel 
          {...defaultProps} 
          getItemStatus={mockGetItemStatus}
        />
      );
      
      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);
      
      const addedButton = screen.getByText('✓ Added');
      const ownedButton = screen.getByText('✓ Own');
      
      expect(addedButton).toBeDisabled();
      expect(ownedButton).toBeDisabled();
    });
  });

  describe('Bulk Actions', () => {
    test('calls onAddToShoppingList for all unprocessed items when Add All is clicked', () => {
      const mockGetItemStatus = jest.fn((id) => {
        if (id === 'seed_kale') return 'unselected'; // Kale not processed
        if (id === 'seed_okra') return 'shopping'; // Okra already added
        return 'unselected';
      });
      
      render(
        <VendorGroupPanel 
          {...defaultProps} 
          getItemStatus={mockGetItemStatus}
        />
      );
      
      const header = screen.getByText('True Leaf Market').closest('.card-header');
      fireEvent.click(header);
      
      const addAllButton = screen.getByText('📦 Add All to Shopping List');
      fireEvent.click(addAllButton);
      
      // Should only add Kale (unprocessed), not Okra (already added)
      expect(defaultProps.onAddToShoppingList).toHaveBeenCalledTimes(1);
      expect(defaultProps.onAddToShoppingList).toHaveBeenCalledWith({
        id: 'seed_kale',
        item: 'Kale',
        price: 7.90,
        category: 'Seeds',
        quantity: 2,
        notes: 'Heat-tolerant variety',
        vendor: 'True Leaf Market'
      });
    });

    test('does not add items that are already owned or added', () => {
      const mockGetItemStatus = jest.fn(() => 'owned'); // All items owned
      
      render(
        <VendorGroupPanel 
          {...defaultProps} 
          getItemStatus={mockGetItemStatus}
        />
      );
      
      const header = screen.getByText('True Leaf Market').closest('.card-header');
      fireEvent.click(header);
      
      const addAllButton = screen.getByText('📦 Add All to Shopping List');
      fireEvent.click(addAllButton);
      
      expect(defaultProps.onAddToShoppingList).not.toHaveBeenCalled();
    });
  });

  describe('Defensive Programming', () => {
    test('handles empty vendor gracefully', () => {
      const emptyVendor = {
        name: 'Empty Vendor',
        items: [],
        totalCost: 0,
        shippingThreshold: 50,
        notes: ''
      };
      
      expect(() => {
        render(<VendorGroupPanel vendor={emptyVendor} />);
      }).not.toThrow();
      
      expect(screen.getByText('Empty Vendor')).toBeInTheDocument();
      expect(screen.getByText('0 items')).toBeInTheDocument();
    });

    test('handles missing props with defaults', () => {
      expect(() => {
        render(<VendorGroupPanel />);
      }).not.toThrow();
    });

    test('handles items with missing properties', () => {
      const vendorWithIncompleteItems = {
        name: 'Test Vendor',
        items: [{
          id: 'incomplete_item',
          crop: 'Test Crop'
          // Missing other properties
        }],
        totalCost: 0,
        shippingThreshold: 50,
        notes: ''
      };
      
      expect(() => {
        render(<VendorGroupPanel vendor={vendorWithIncompleteItems} />);
      }).not.toThrow();
    });

    test('handles undefined cost values', () => {
      const vendorWithUndefinedCosts = {
        name: 'Test Vendor',
        items: [{
          id: 'item_no_cost',
          crop: 'Test Crop',
          category: 'Seeds'
          // No cost property
        }],
        totalCost: 0,
        shippingThreshold: 50,
        notes: ''
      };
      
      render(<VendorGroupPanel vendor={vendorWithUndefinedCosts} />);
      const header = screen.getByText('Test Vendor').closest('.card-header');
      fireEvent.click(header);
      
      // Should not crash when displaying costs
      expect(screen.getByText('Test Crop')).toBeInTheDocument();
    });
  });

  describe('Shipping Threshold Logic', () => {
    test('calculates shipping difference correctly', () => {
      const vendor = { ...mockVendor, totalCost: 25.50, shippingThreshold: 40.00 };
      
      render(<VendorGroupPanel vendor={vendor} />);
      
      expect(screen.getByText(/Add \$14\.50 for free shipping/)).toBeInTheDocument();
    });

    test('handles zero shipping threshold', () => {
      const vendor = { ...mockVendor, shippingThreshold: 0 };
      
      render(<VendorGroupPanel vendor={vendor} />);
      
      expect(screen.getByText(/Free shipping/)).toBeInTheDocument();
    });

    test('handles exactly at threshold', () => {
      const vendor = { ...mockVendor, totalCost: 50.00, shippingThreshold: 50.00 };
      
      render(<VendorGroupPanel vendor={vendor} />);
      
      expect(screen.getByText(/Free shipping \(over \$50\)/)).toBeInTheDocument();
    });
  });
});