/**
 * Interface Validation Tests
 * Prevents prop interface mismatches that cause runtime errors
 */

import React from 'react';
import { render } from '@testing-library/react';
import { renderHook } from '@testing-library/react';

import App from '../App';
import DashboardView from '../components/DashboardView';
import TasksView from '../components/TasksView';
import ShoppingView from '../components/ShoppingView';
import SimpleInvestmentPanel from '../components/SimpleInvestmentPanel';
import GardenTasksPanel from '../components/GardenTasksPanel';

import { useShoppingList } from '../hooks/useShoppingList';
import { useTaskManager } from '../hooks/useTaskManager';

// Mock dependencies
jest.mock('../services/databaseCalendarService.js', () => ({
  generateDatabaseGardenCalendar: jest.fn().mockResolvedValue([])
}));

jest.mock('../services/temporalShoppingService', () => ({
  generateGardenTasks: jest.fn(() => [
    {
      id: 'test-task-1',
      title: 'Test Task',
      urgency: 'normal',
      daysUntilPlanting: 10,
      category: 'Indoor Starting'
    }
  ]),
  generatePureShoppingRecommendations: jest.fn(() => [
    {
      id: 'test-rec-1',
      item: 'Test Item',
      price: 10,
      urgency: 'normal',
      daysUntilPlanting: 20,
      category: 'Seeds'
    }
  ])
}));

jest.mock('jstat', () => ({
  normal: { sample: jest.fn(() => 100) },
  poisson: { sample: jest.fn(() => 5) }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('Interface Validation - Prevent Runtime Prop Errors', () => {
  describe('Hook Interface Contracts', () => {
    test('useShoppingList returns all expected methods', () => {
      const { result } = renderHook(() => useShoppingList());
      
      const expectedMethods = [
        'addToShoppingList',
        'markAsOwned', 
        'rejectItem',
        'removeFromShoppingList',
        'clearShoppingList',
        'getItemStatus',
        'getTotalCost'
      ];
      
      expectedMethods.forEach(method => {
        expect(result.current[method]).toBeDefined();
        expect(typeof result.current[method]).toBe('function');
      });
      
      // Check properties
      expect(result.current.shoppingList).toBeDefined();
      expect(Array.isArray(result.current.shoppingList)).toBe(true);
      expect(typeof result.current.totalItems).toBe('number');
    });

    test('useTaskManager returns all expected methods', () => {
      const { result } = renderHook(() => useTaskManager());
      
      const expectedMethods = [
        'markTaskComplete',
        'markTaskIncomplete',
        'clearCompletedTasks',
        'getTaskStatus',
        'getCompletedCount'
      ];
      
      expectedMethods.forEach(method => {
        expect(result.current[method]).toBeDefined();
        expect(typeof result.current[method]).toBe('function');
      });
      
      expect(result.current.completedTasks).toBeDefined();
      expect(result.current.completedTasks).toBeInstanceOf(Set);
    });
  });

  describe('Component Prop Interface Validation', () => {
    test('SimpleInvestmentPanel receives all required props without errors', () => {
      const { result: shoppingResult } = renderHook(() => useShoppingList());
      
      const mockRecommendations = [
        {
          id: 'test-1',
          item: 'Test Item',
          price: 10,
          category: 'test',
          urgency: 'normal'
        }
      ];
      
      // This should not throw any "function is not defined" errors
      expect(() => {
        render(
          <SimpleInvestmentPanel
            recommendations={mockRecommendations}
            onAddToShoppingList={shoppingResult.current.addToShoppingList}
            onMarkAsOwned={shoppingResult.current.markAsOwned}
            onRejectItem={shoppingResult.current.rejectItem}
            getItemStatus={shoppingResult.current.getItemStatus}
          />
        );
      }).not.toThrow();
    });

    test('GardenTasksPanel receives all required props without errors', () => {
      const { result: taskResult } = renderHook(() => useTaskManager());
      
      const mockTasks = [
        {
          id: 'test-task-1',
          title: 'Test Task',
          urgency: 'normal',
          category: 'Indoor Starting'
        }
      ];
      
      expect(() => {
        render(
          <GardenTasksPanel
            tasks={mockTasks}
            onMarkComplete={taskResult.current.markTaskComplete}
            getTaskStatus={taskResult.current.getTaskStatus}
          />
        );
      }).not.toThrow();
    });

    test('ShoppingView integrates correctly with useShoppingList hook', () => {
      const { result: shoppingResult } = renderHook(() => useShoppingList());
      
      expect(() => {
        render(<ShoppingView shoppingActions={shoppingResult.current} />);
      }).not.toThrow();
    });

    test('TasksView integrates correctly with useTaskManager hook', () => {
      const { result: taskResult } = renderHook(() => useTaskManager());
      
      expect(() => {
        render(<TasksView taskActions={taskResult.current} />);
      }).not.toThrow();
    });

    test('DashboardView integrates correctly with both hooks', () => {
      const { result: shoppingResult } = renderHook(() => useShoppingList());
      const { result: taskResult } = renderHook(() => useTaskManager());
      
      expect(() => {
        render(
          <DashboardView
            shoppingActions={shoppingResult.current}
            taskActions={taskResult.current}
            monthlyFocus="Test monthly focus"
          />
        );
      }).not.toThrow();
    });
  });

  describe('Method Name Validation', () => {
    test('shopping actions have correct method names', () => {
      const { result } = renderHook(() => useShoppingList());
      
      // These are the exact names components expect
      const requiredShoppingMethods = {
        'addToShoppingList': 'function',
        'markAsOwned': 'function',
        'rejectItem': 'function', 
        'removeFromShoppingList': 'function',
        'clearShoppingList': 'function',
        'getItemStatus': 'function',
        'getTotalCost': 'function'
      };
      
      Object.entries(requiredShoppingMethods).forEach(([method, expectedType]) => {
        expect(result.current[method]).toBeDefined();
        expect(typeof result.current[method]).toBe(expectedType);
      });
    });

    test('task actions have correct method names', () => {
      const { result } = renderHook(() => useTaskManager());
      
      const requiredTaskMethods = {
        'markTaskComplete': 'function',
        'getTaskStatus': 'function',
        'getCompletedCount': 'function'
      };
      
      Object.entries(requiredTaskMethods).forEach(([method, expectedType]) => {
        expect(result.current[method]).toBeDefined();
        expect(typeof result.current[method]).toBe(expectedType);
      });
    });
  });

  describe('Full App Integration', () => {
    test('App renders without prop interface errors', () => {
      // This is the ultimate test - if there are any prop interface mismatches,
      // this will fail with the exact same errors users see in the browser
      expect(() => {
        render(<App />);
      }).not.toThrow();
    });
  });

  describe('Error Scenarios That Should Be Caught', () => {
    test('detects when wrong method names are used', () => {
      const { result: shoppingResult } = renderHook(() => useShoppingList());
      
      // Simulate the old incorrect prop names
      const badShoppingActions = {
        ...shoppingResult.current,
        addToList: shoppingResult.current.addToShoppingList, // Wrong name
        getStatus: shoppingResult.current.getItemStatus // Wrong name
      };
      
      // Remove the correct ones
      delete badShoppingActions.addToShoppingList;
      delete badShoppingActions.getItemStatus;
      
      expect(() => {
        render(<ShoppingView shoppingActions={badShoppingActions} />);
      }).toThrow();
    });
  });
});