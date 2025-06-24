/**
 * Purchase Window Panel Component Tests
 * Tests strategic timing-based grouping interface
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PurchaseWindowPanel from '../PurchaseWindowPanel';

// Mock current date for consistent testing
const originalDate = global.Date;

describe('PurchaseWindowPanel', () => {
  const mockWindow = {
    name: 'Winter Seed Ordering',
    timing: 'December - February',
    description: 'Primary seed ordering season - best selection and pricing',
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
        id: 'seed_lettuce',
        crop: 'Lettuce',
        variety: 'Jericho Romaine',
        category: 'Seeds',
        quantity: 3,
        cost: 16.50
      }
    ],
    totalCost: 24.40
  };

  const defaultProps = {
    window: mockWindow,
    onAddToShoppingList: jest.fn(),
    onMarkAsOwned: jest.fn(),
    getItemStatus: jest.fn(() => 'unselected')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset Date to original implementation before each test
    global.Date = originalDate;
    
    // Mock Date constructor to return January 15th by default
    global.Date = jest.fn(() => new originalDate('2025-01-15'));
    global.Date.now = originalDate.now;
  });
  
  afterAll(() => {
    // Restore original Date implementation
    global.Date = originalDate;
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      expect(() => {
        render(<PurchaseWindowPanel {...defaultProps} />);
      }).not.toThrow();
    });

    test('displays window name and timing', () => {
      render(<PurchaseWindowPanel {...defaultProps} />);
      
      expect(screen.getByText('Winter Seed Ordering')).toBeInTheDocument();
      expect(screen.getByText('December - February')).toBeInTheDocument();
    });

    test('displays window description', () => {
      render(<PurchaseWindowPanel {...defaultProps} />);
      
      expect(screen.getByText('Primary seed ordering season - best selection and pricing')).toBeInTheDocument();
    });

    test('shows window stats', () => {
      render(<PurchaseWindowPanel {...defaultProps} />);
      
      expect(screen.getByText('$24.4')).toBeInTheDocument();
      expect(screen.getByText('2 items')).toBeInTheDocument();
    });
  });

  describe('Status Indicators', () => {
    test('shows active status for current winter timing', () => {
      const winterWindow = {
        ...mockWindow,
        name: 'Winter Seed Ordering'
      };
      
      render(<PurchaseWindowPanel window={winterWindow} {...defaultProps} />);
      
      expect(screen.getByText('🟢 Now')).toBeInTheDocument();
    });

    test('shows upcoming status for spring timing when not in season', () => {
      // Keep January date but use spring window name
      const springWindow = {
        ...mockWindow,
        name: 'Spring Infrastructure Setup',
        timing: 'March - April'
      };
      
      const propsWithSpringWindow = {
        ...defaultProps,
        window: springWindow
      };
      
      render(<PurchaseWindowPanel {...propsWithSpringWindow} />);
      
      expect(screen.getByText('🔵 Soon')).toBeInTheDocument();
    });

    test('shows upcoming status for summer timing when not in season', () => {
      // Keep January date but use summer window name  
      const summerWindow = {
        ...mockWindow,
        name: 'Summer Support Supplies',
        timing: 'May - June'
      };
      
      const propsWithSummerWindow = {
        ...defaultProps,
        window: summerWindow
      };
      
      render(<PurchaseWindowPanel {...propsWithSummerWindow} />);
      
      expect(screen.getByText('🔵 Soon')).toBeInTheDocument();
    });

    test('applies correct CSS classes based on status', () => {
      const { container } = render(<PurchaseWindowPanel {...defaultProps} />);
      
      const panel = container.querySelector('.purchase-window-panel');
      expect(panel).toHaveClass('status-active');
    });
  });

  describe('Expand/Collapse Functionality', () => {
    test('starts collapsed by default', () => {
      render(<PurchaseWindowPanel {...defaultProps} />);
      
      expect(screen.queryByText('Kale')).not.toBeInTheDocument();
      expect(screen.queryByText('Lettuce')).not.toBeInTheDocument();
    });

    test('expands when header is clicked', () => {
      render(<PurchaseWindowPanel {...defaultProps} />);
      
      const header = screen.getByText('Winter Seed Ordering').closest('.card-header');
      fireEvent.click(header);
      
      expect(screen.getByText('Kale')).toBeInTheDocument();
      expect(screen.getByText('Lettuce')).toBeInTheDocument();
    });

    test('toggles expand button icon', () => {
      render(<PurchaseWindowPanel {...defaultProps} />);
      
      const expandButton = screen.getByText('▶');
      expect(expandButton).toBeInTheDocument();
      
      fireEvent.click(expandButton);
      expect(screen.getByText('▼')).toBeInTheDocument();
      expect(screen.queryByText('▶')).not.toBeInTheDocument();
    });
  });

  describe('Item Display', () => {
    beforeEach(() => {
      render(<PurchaseWindowPanel {...defaultProps} />);
      const header = screen.getByText('Winter Seed Ordering').closest('.card-header');
      fireEvent.click(header); // Expand to show items
    });

    test('displays all window items when expanded', () => {
      expect(screen.getByText('Kale')).toBeInTheDocument();
      expect(screen.getByText(/Red Russian Kale/)).toBeInTheDocument();
      expect(screen.getByText('Lettuce')).toBeInTheDocument();
      expect(screen.getByText(/Jericho Romaine/)).toBeInTheDocument();
    });

    test('shows packet information when available', () => {
      expect(screen.getByText('2 packets')).toBeInTheDocument();
    });

    test('shows quantity information when available', () => {
      expect(screen.getByText('Qty: 3')).toBeInTheDocument();
    });

    test('displays cost information', () => {
      expect(screen.getByText('$7.9')).toBeInTheDocument();
      expect(screen.getByText('$16.5')).toBeInTheDocument();
    });

    test('shows item notes when available', () => {
      expect(screen.getByText('Heat-tolerant variety')).toBeInTheDocument();
    });
  });

  describe('Item Actions', () => {
    beforeEach(() => {
      render(<PurchaseWindowPanel {...defaultProps} />);
      const header = screen.getByText('Winter Seed Ordering').closest('.card-header');
      fireEvent.click(header); // Expand to show items
    });

    test('calls onAddToShoppingList when Add button is clicked', () => {
      const addButtons = screen.getAllByText('+ Add');
      fireEvent.click(addButtons[0]); // Click first item's add button
      
      expect(defaultProps.onAddToShoppingList).toHaveBeenCalledWith({
        id: 'seed_kale',
        item: 'Kale',
        price: 7.90,
        category: 'Seeds',
        quantity: 2,
        notes: 'Heat-tolerant variety'
      });
    });

    test('calls onMarkAsOwned when Have It button is clicked', () => {
      const ownedButtons = screen.getAllByText('Have It');
      fireEvent.click(ownedButtons[1]); // Click second item's owned button
      
      expect(defaultProps.onMarkAsOwned).toHaveBeenCalledWith('seed_lettuce');
    });

    test('handles items with cost vs totalCost properties', () => {
      const addButtons = screen.getAllByText('+ Add');
      fireEvent.click(addButtons[1]); // Click lettuce (has cost, not totalCost)
      
      expect(defaultProps.onAddToShoppingList).toHaveBeenCalledWith({
        id: 'seed_lettuce',
        item: 'Lettuce',
        price: 16.50,
        category: 'Seeds',
        quantity: 1, // default when packetsNeeded not specified
        notes: undefined
      });
    });

    test('shows correct button states based on item status', () => {
      const mockGetItemStatus = jest.fn((id) => {
        if (id === 'seed_kale') return 'shopping'; // Kale is added
        if (id === 'seed_lettuce') return 'owned'; // Lettuce is owned
        return 'unselected';
      });
      
      render(
        <PurchaseWindowPanel 
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
        return 'unselected';
      });
      
      render(
        <PurchaseWindowPanel 
          {...defaultProps} 
          getItemStatus={mockGetItemStatus}
        />
      );
      
      const expandButton = screen.getByText('▶');
      fireEvent.click(expandButton);
      
      const addedButton = screen.getByText('✓ Added');
      expect(addedButton).toBeDisabled();
    });
  });

  describe('Timing Logic', () => {
    // Test different months to verify timing detection
    test('detects winter timing correctly in December', () => {
      global.Date = jest.fn(() => new originalDate('2025-12-15'));
      
      render(<PurchaseWindowPanel {...defaultProps} />);
      
      expect(screen.getByText('🟢 Now')).toBeInTheDocument();
    });

    test('detects spring timing correctly in March', () => {
      global.Date = jest.fn(() => new originalDate('2025-03-15'));
      
      const springWindow = {
        ...mockWindow,
        name: 'Spring Infrastructure Setup'
      };
      
      const propsWithSpringWindow = {
        ...defaultProps,
        window: springWindow
      };
      
      render(<PurchaseWindowPanel {...propsWithSpringWindow} />);
      
      expect(screen.getByText('🟢 Now')).toBeInTheDocument();
    });

    test('detects summer timing correctly in May', () => {
      global.Date = jest.fn(() => new originalDate('2025-05-15'));
      
      const summerWindow = {
        ...mockWindow,
        name: 'Summer Support Supplies'
      };
      
      const propsWithSummerWindow = {
        ...defaultProps,
        window: summerWindow
      };
      
      render(<PurchaseWindowPanel {...propsWithSummerWindow} />);
      
      expect(screen.getByText('🟢 Now')).toBeInTheDocument();
    });

    test('shows upcoming status for non-matching timing', () => {
      global.Date = jest.fn(() => new originalDate('2025-08-15'));
      
      render(<PurchaseWindowPanel {...defaultProps} />);
      
      expect(screen.getByText('🔵 Soon')).toBeInTheDocument();
    });
  });

  describe('Defensive Programming', () => {
    test('handles empty window gracefully', () => {
      const emptyWindow = {
        name: 'Empty Window',
        timing: 'Test timing',
        description: 'Test description',
        items: [],
        totalCost: 0
      };
      
      expect(() => {
        render(<PurchaseWindowPanel window={emptyWindow} />);
      }).not.toThrow();
      
      expect(screen.getByText('Empty Window')).toBeInTheDocument();
      expect(screen.getByText('0 items')).toBeInTheDocument();
    });

    test('handles missing props with defaults', () => {
      expect(() => {
        render(<PurchaseWindowPanel />);
      }).not.toThrow();
    });

    test('handles items with missing properties', () => {
      const windowWithIncompleteItems = {
        name: 'Test Window',
        timing: 'Test timing',
        description: 'Test description',
        items: [{
          id: 'incomplete_item',
          crop: 'Test Crop'
          // Missing other properties
        }],
        totalCost: 0
      };
      
      expect(() => {
        render(<PurchaseWindowPanel window={windowWithIncompleteItems} />);
      }).not.toThrow();
    });

    test('handles undefined cost values gracefully', () => {
      const windowWithUndefinedCosts = {
        name: 'Test Window',
        timing: 'Test timing',
        description: 'Test description',
        items: [{
          id: 'item_no_cost',
          crop: 'Test Crop',
          category: 'Seeds'
          // No cost property
        }],
        totalCost: 0
      };
      
      render(<PurchaseWindowPanel window={windowWithUndefinedCosts} />);
      const header = screen.getByText('Test Window').closest('.card-header');
      fireEvent.click(header);
      
      // Should not crash when displaying costs
      expect(screen.getByText('Test Crop')).toBeInTheDocument();
    });

    test('handles window name without timing keywords', () => {
      const customWindow = {
        ...mockWindow,
        name: 'Custom Purchase Window'
      };
      
      render(<PurchaseWindowPanel window={customWindow} />);
      
      expect(screen.getByText('🔵 Soon')).toBeInTheDocument(); // Should default to upcoming
    });
  });

  describe('Cost Display Logic', () => {
    test('displays totalCost when available', () => {
      render(<PurchaseWindowPanel {...defaultProps} />);
      const header = screen.getByText('Winter Seed Ordering').closest('.card-header');
      fireEvent.click(header);
      
      expect(screen.getByText('$7.9')).toBeInTheDocument(); // From totalCost
    });

    test('displays cost when totalCost not available', () => {
      render(<PurchaseWindowPanel {...defaultProps} />);
      const header = screen.getByText('Winter Seed Ordering').closest('.card-header');
      fireEvent.click(header);
      
      expect(screen.getByText('$16.5')).toBeInTheDocument(); // From cost fallback
    });
  });

  describe('Accessibility', () => {
    test('has proper button roles and interactions', () => {
      render(<PurchaseWindowPanel {...defaultProps} />);
      
      const expandButton = screen.getByRole('button');
      expect(expandButton).toBeInTheDocument();
      
      fireEvent.click(expandButton);
      
      const actionButtons = screen.getAllByRole('button');
      expect(actionButtons.length).toBeGreaterThan(1); // Expand button + item action buttons
    });

    test('expand button is keyboard accessible', () => {
      render(<PurchaseWindowPanel {...defaultProps} />);
      
      const expandButton = screen.getByText('▶');
      fireEvent.keyDown(expandButton, { key: 'Enter' });
      
      // Should still be clickable/accessible
      expect(expandButton).toBeInTheDocument();
    });
  });
});