/**
 * Tests for recurringTaskScheduler.js
 * Validates task scheduling, timer management, and async behavior
 */

import { RecurringTaskScheduler } from '../recurringTaskScheduler';

jest.useFakeTimers();

describe('RecurringTaskScheduler', () => {
  let mockTaskManager;
  let mockOnTasksAvailable;
  let scheduler;

  beforeEach(() => {
    mockTaskManager = {
      taskStates: {
        recurringSchedules: {}
      }
    };
    
    mockOnTasksAvailable = jest.fn();
    
    scheduler = new RecurringTaskScheduler(mockTaskManager, mockOnTasksAvailable);
  });

  afterEach(() => {
    scheduler.stop();
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  test('constructor initializes with correct properties', () => {
    expect(scheduler.taskManager).toBe(mockTaskManager);
    expect(scheduler.onTasksBecomeAvailable).toBe(mockOnTasksAvailable);
    expect(scheduler.activeTimers).toBeInstanceOf(Map);
    expect(scheduler.isRunning).toBe(false);
  });

  test('constructor allows missing callback parameter', () => {
    const schedulerWithoutCallback = new RecurringTaskScheduler(mockTaskManager);
    expect(schedulerWithoutCallback.onTasksBecomeAvailable).toBeUndefined();
  });

  test('start sets running state and logs message', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    
    scheduler.start();
    
    expect(scheduler.isRunning).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith('🔄 Recurring task scheduler started');
    
    consoleSpy.mockRestore();
  });

  test('start does nothing if already running', () => {
    scheduler.start();
    const initialTimerCount = scheduler.activeTimers.size;
    
    scheduler.start();
    
    expect(scheduler.activeTimers.size).toBe(initialTimerCount);
  });

  test('start schedules timer', () => {
    scheduler.start();
    expect(scheduler.activeTimers.size).toBe(1);
  });

  test('stop clears running state and logs message', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    
    scheduler.start();
    scheduler.stop();
    
    expect(scheduler.isRunning).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('⏹️ Recurring task scheduler stopped');
    
    consoleSpy.mockRestore();
  });

  test('stop clears all active timers', () => {
    scheduler.start();
    expect(scheduler.activeTimers.size).toBeGreaterThan(0);
    
    scheduler.stop();
    expect(scheduler.activeTimers.size).toBe(0);
  });

  test('scheduleRecurringTask schedules individual task with correct delay', () => {
    const activityId = 'test-activity';
    const futureTime = Date.now() + 60000;
    
    scheduler.start();
    scheduler.scheduleRecurringTask(activityId, futureTime);
    
    expect(scheduler.activeTimers.has(activityId)).toBe(true);
  });

  test('scheduleRecurringTask replaces existing timer for same activity', () => {
    const activityId = 'test-activity';
    
    scheduler.start();
    scheduler.scheduleRecurringTask(activityId, Date.now() + 60000);
    const firstTimerCount = scheduler.activeTimers.size;
    
    scheduler.scheduleRecurringTask(activityId, Date.now() + 120000);
    
    expect(scheduler.activeTimers.size).toBe(firstTimerCount);
  });

  test('scheduleRecurringTask does not schedule if not running', () => {
    const activityId = 'test-activity';
    
    scheduler.scheduleRecurringTask(activityId, Date.now() + 60000);
    
    expect(scheduler.activeTimers.has(activityId)).toBe(false);
  });

  test('checkForDueTasks detects due tasks and calls callback', () => {
    const now = Date.now();
    mockTaskManager.taskStates.recurringSchedules = {
      'task1': { nextDue: now - 1000 },
      'task2': { nextDue: now + 60000 }
    };
    
    scheduler.start();
    scheduler.checkForDueTasks();
    
    expect(mockOnTasksAvailable).toHaveBeenCalledWith(1);
  });

  test('checkForDueTasks does not call callback when no tasks due', () => {
    const now = Date.now();
    mockTaskManager.taskStates.recurringSchedules = {
      'task1': { nextDue: now + 60000 }
    };
    
    scheduler.start();
    scheduler.checkForDueTasks();
    
    expect(mockOnTasksAvailable).not.toHaveBeenCalled();
  });

  test('checkForDueTasks handles missing callback gracefully', () => {
    const schedulerWithoutCallback = new RecurringTaskScheduler(mockTaskManager);
    const now = Date.now();
    mockTaskManager.taskStates.recurringSchedules = {
      'task1': { nextDue: now - 1000 }
    };
    
    schedulerWithoutCallback.start();
    schedulerWithoutCallback.checkForDueTasks();
    schedulerWithoutCallback.stop();
    
    expect(schedulerWithoutCallback).toBeDefined();
  });

  test('cancelTaskScheduling removes timer for specified task', () => {
    const activityId = 'test-activity';
    
    scheduler.start();
    scheduler.scheduleRecurringTask(activityId, Date.now() + 60000);
    expect(scheduler.activeTimers.has(activityId)).toBe(true);
    
    scheduler.cancelTaskScheduling(activityId);
    expect(scheduler.activeTimers.has(activityId)).toBe(false);
  });

  test('cancelTaskScheduling handles non-existent task gracefully', () => {
    scheduler.cancelTaskScheduling('non-existent');
    expect(scheduler.activeTimers.has('non-existent')).toBe(false);
  });

  test('getSchedulingSummary returns correct summary information', () => {
    scheduler.start();
    scheduler.scheduleRecurringTask('task1', Date.now() + 60000);
    
    const summary = scheduler.getSchedulingSummary();
    
    expect(summary.isRunning).toBe(true);
    expect(summary.activeTimers).toBeGreaterThan(0);
    expect(summary.scheduledTasks).toContain('task1');
  });
});