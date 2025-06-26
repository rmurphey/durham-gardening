/**
 * Tests for Shopping Suggestion Modal Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShoppingSuggestionModal from '../ShoppingSuggestionModal.js';

describe('ShoppingSuggestionModal', () => {
  const mockActivity = {
    id: 'test-activity',
    type: 'indoor-starting',
    crop: 'Tomatoes',
    action: 'Start tomato seeds indoors'
  };

  const mockSuggestions = [
    {
      id: 'suggestion-1',
      item: 'Seed starting kit with heat mat',
      price: 67,
      category: 'Equipment',
      urgency: 'high',
      suggestionReason: 'Essential for indoor starting',
      why: 'Need to start peppers/tomatoes indoors soon',
      timing: 'Buy immediately',
      consequences: 'Late start reduces growing season'
    },
    {
      id: 'suggestion-2',
      item: 'Cherokee Purple tomato seeds',
      price: 4,
      category: 'Seeds',
      urgency: 'medium',
      suggestionReason: 'Related to tomato activity',
      why: 'Order now for best variety selection'
    },
    {
      id: 'suggestion-3',
      item: 'Grow light system',
      price: 89,
      category: 'Equipment',
      urgency: 'urgent',
      suggestionReason: 'Needed for indoor growing'
    }
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    suggestions: mockSuggestions,
    activity: mockActivity,
    onAddToShoppingList: jest.fn(),
    onAddAllToShoppingList: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should not render when isOpen is false', () => {
    render(<ShoppingSuggestionModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Shopping Suggestions')).not.toBeInTheDocument();
  });

  test('should not render when suggestions are empty', () => {
    render(<ShoppingSuggestionModal {...defaultProps} suggestions={[]} />);
    
    expect(screen.queryByText('Shopping Suggestions')).not.toBeInTheDocument();
  });

  test('should render modal with activity context', () => {
    render(<ShoppingSuggestionModal {...defaultProps} />);
    
    expect(screen.getByText('🛒 Shopping Suggestions')).toBeInTheDocument();
    expect(screen.getByText(/Completed:/)).toBeInTheDocument();
    expect(screen.getByText('Tomatoes - Start tomato seeds indoors')).toBeInTheDocument();
  });

  test('should render all suggestions', () => {
    render(<ShoppingSuggestionModal {...defaultProps} />);
    
    expect(screen.getByText('Seed starting kit with heat mat')).toBeInTheDocument();
    expect(screen.getByText('Cherokee Purple tomato seeds')).toBeInTheDocument();
    expect(screen.getByText('Grow light system')).toBeInTheDocument();
  });

  test('should display suggestion details correctly', () => {
    render(<ShoppingSuggestionModal {...defaultProps} />);
    
    // Check first suggestion details
    expect(screen.getByText('$67')).toBeInTheDocument();
    expect(screen.getAllByText('Equipment').length).toBeGreaterThan(0);
    expect(screen.getByText('Essential for indoor starting')).toBeInTheDocument();
    expect(screen.getByText('Need to start peppers/tomatoes indoors soon')).toBeInTheDocument();
    expect(screen.getByText(/Timing:/)).toBeInTheDocument();
    expect(screen.getByText('Buy immediately')).toBeInTheDocument();
  });

  test('should display urgency badges correctly', () => {
    render(<ShoppingSuggestionModal {...defaultProps} />);
    
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('URGENT')).toBeInTheDocument();
  });

  test('should handle suggestion selection', async () => {
    const user = userEvent.setup();
    render(<ShoppingSuggestionModal {...defaultProps} />);
    
    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    
    await user.click(firstCheckbox);
    
    expect(firstCheckbox).toBeChecked();
    expect(screen.getByText('1 of 3 selected')).toBeInTheDocument();
  });

  test('should handle suggestion deselection', async () => {
    const user = userEvent.setup();
    render(<ShoppingSuggestionModal {...defaultProps} />);
    
    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    
    // Select then deselect
    await user.click(firstCheckbox);
    await user.click(firstCheckbox);
    
    expect(firstCheckbox).not.toBeChecked();
    expect(screen.queryByText('1 of 3 selected')).not.toBeInTheDocument();
  });

  test('should handle clicking suggestion item to select', async () => {
    const user = userEvent.setup();
    render(<ShoppingSuggestionModal {...defaultProps} />);
    
    const suggestionItem = screen.getByText('Seed starting kit with heat mat').closest('.suggestion-item');
    const checkbox = screen.getAllByRole('checkbox')[0];
    
    await user.click(suggestionItem);
    
    expect(checkbox).toBeChecked();
  });

  test('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<ShoppingSuggestionModal {...defaultProps} />);
    
    const closeButton = screen.getByText('×');
    await user.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('should call onClose when Skip button is clicked', async () => {
    const user = userEvent.setup();
    render(<ShoppingSuggestionModal {...defaultProps} />);
    
    const skipButton = screen.getByText('Skip');
    await user.click(skipButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('should call onAddAllToShoppingList when Add All button is clicked', async () => {
    const user = userEvent.setup();
    render(<ShoppingSuggestionModal {...defaultProps} />);
    
    const addAllButton = screen.getByText('Add All (3)');
    await user.click(addAllButton);
    
    expect(defaultProps.onAddAllToShoppingList).toHaveBeenCalledWith(mockSuggestions);
  });

  test('should call onAddToShoppingList for selected items when Add Selected is clicked', async () => {
    const user = userEvent.setup();
    render(<ShoppingSuggestionModal {...defaultProps} />);
    
    // Select first suggestion
    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(firstCheckbox);
    
    const addSelectedButton = screen.getByText('Add Selected (1)');
    await user.click(addSelectedButton);
    
    expect(defaultProps.onAddToShoppingList).toHaveBeenCalledWith(mockSuggestions[0]);
  });

  test('should disable Add Selected button when no items are selected', () => {
    render(<ShoppingSuggestionModal {...defaultProps} />);
    
    const addSelectedButton = screen.getByText('Add Selected');
    expect(addSelectedButton).toBeDisabled();
  });

  test('should show processing state during add operations', async () => {
    const user = userEvent.setup();
    const slowAddFunction = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <ShoppingSuggestionModal 
        {...defaultProps} 
        onAddAllToShoppingList={slowAddFunction}
      />
    );
    
    const addAllButton = screen.getByText('Add All (3)');
    await user.click(addAllButton);
    
    expect(screen.getByText('Adding...')).toBeInTheDocument();
    expect(addAllButton).toBeDisabled();
    
    await waitFor(() => {
      expect(slowAddFunction).toHaveBeenCalled();
    });
  });

  test('should handle price display for free items', () => {
    const suggestionsWithFreeItem = [
      {
        id: 'free-suggestion',
        item: 'Free gardening guide',
        price: 0,
        category: 'Information'
      }
    ];
    
    render(
      <ShoppingSuggestionModal 
        {...defaultProps} 
        suggestions={suggestionsWithFreeItem}
      />
    );
    
    expect(screen.getByText('Price varies')).toBeInTheDocument();
  });

  test('should handle clicking on overlay to close modal', async () => {
    const user = userEvent.setup();
    render(<ShoppingSuggestionModal {...defaultProps} />);
    
    const overlay = screen.getByRole('dialog').parentElement;
    await user.click(overlay);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('should not close modal when clicking on modal content', async () => {
    const user = userEvent.setup();
    render(<ShoppingSuggestionModal {...defaultProps} />);
    
    const modalContent = screen.getByRole('dialog');
    await user.click(modalContent);
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  test('should handle missing optional suggestion fields gracefully', () => {
    const minimalSuggestions = [
      {
        id: 'minimal',
        item: 'Basic item'
        // Missing price, category, urgency, etc.
      }
    ];
    
    render(
      <ShoppingSuggestionModal 
        {...defaultProps} 
        suggestions={minimalSuggestions}
      />
    );
    
    expect(screen.getByText('Basic item')).toBeInTheDocument();
    expect(screen.getByText('Price varies')).toBeInTheDocument();
  });
});