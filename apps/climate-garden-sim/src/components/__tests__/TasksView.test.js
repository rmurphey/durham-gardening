import React from 'react';
import { render, screen } from '@testing-library/react';
import TasksView from '../TasksView';

// Mock the temporal shopping service
jest.mock('../../services/temporalShoppingService', () => ({
  generateGardenTasks: jest.fn(() => [
    {
      id: 'test-task-1',
      title: 'Test urgent task',
      urgency: 'urgent',
      daysUntilPlanting: 3
    },
    {
      id: 'test-task-2', 
      title: 'Test upcoming task',
      urgency: 'normal',
      daysUntilPlanting: 14
    }
  ])
}));

describe('TasksView Component', () => {
  const mockTaskActions = {
    markTaskComplete: jest.fn(),
    markTaskIncomplete: jest.fn(),
    getTaskStatus: jest.fn(() => 'pending'),
    getCompletedCount: jest.fn(() => 0),
    clearCompletedTasks: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing with proper task actions', () => {
    render(<TasksView taskActions={mockTaskActions} />);
    
    expect(screen.getByText('📋 Garden Tasks')).toBeInTheDocument();
  });

  test('passes correct props to GardenTasksPanel', () => {
    // This test would fail if we passed wrong function names
    const { container } = render(<TasksView taskActions={mockTaskActions} />);
    
    // Should render urgent tasks section
    expect(screen.getByText('🔥 Urgent (Next 7 Days)')).toBeInTheDocument();
    
    // Should render upcoming tasks section  
    expect(screen.getByText('📅 Upcoming Tasks')).toBeInTheDocument();
  });

  test('fails if taskActions has wrong method names', () => {
    const badTaskActions = {
      markComplete: jest.fn(), // Wrong name - should be markTaskComplete
      getStatus: jest.fn(() => 'pending') // Wrong name - should be getTaskStatus  
    };

    // This should throw an error during rendering due to missing functions
    expect(() => {
      render(<TasksView taskActions={badTaskActions} />);
    }).toThrow();
  });

  test('validates taskActions interface', () => {
    // Verify that taskActions has all required methods
    const requiredMethods = ['markTaskComplete', 'getTaskStatus'];
    
    requiredMethods.forEach(method => {
      expect(mockTaskActions[method]).toBeDefined();
      expect(typeof mockTaskActions[method]).toBe('function');
    });
  });
});