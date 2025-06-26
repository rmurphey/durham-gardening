import { renderHook, act } from '@testing-library/react';
import { useTaskManager } from '../useTaskManager';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('useTaskManager Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('returns all required methods', () => {
    const { result } = renderHook(() => useTaskManager());
    
    // Verify all expected methods exist
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
    
    expect(result.current.completedTasks).toBeInstanceOf(Set);
  });

  test('getTaskStatus returns correct values', () => {
    const { result } = renderHook(() => useTaskManager());
    
    // Initially pending
    expect(result.current.getTaskStatus('test-task')).toBe('pending');
    
    // Mark as complete
    act(() => {
      result.current.markTaskComplete('test-task');
    });
    
    expect(result.current.getTaskStatus('test-task')).toBe('completed');
  });

  test('interface matches component expectations', () => {
    const { result } = renderHook(() => useTaskManager());
    
    // These are the exact method names that components expect
    expect(result.current.markTaskComplete).toBeInstanceOf(Function);
    expect(result.current.getTaskStatus).toBeInstanceOf(Function);
    
    // Test that they work as expected
    act(() => {
      result.current.markTaskComplete('task-1');
    });
    
    expect(result.current.getTaskStatus('task-1')).toBe('completed');
    expect(result.current.getCompletedCount()).toBe(1);
  });
});