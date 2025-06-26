/**
 * Task Manager Hook
 * Manages garden task completion state with localStorage persistence
 */

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'garden-tasks';

export const useTaskManager = () => {
  const [completedTasks, setCompletedTasks] = useState(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setCompletedTasks(new Set(data.completedTasks || []));
      }
    } catch (error) {
      console.error('Error loading task state:', error);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      const data = {
        completedTasks: Array.from(completedTasks)
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving task state:', error);
    }
  }, [completedTasks]);

  const markTaskComplete = (taskId) => {
    const newCompleted = new Set(completedTasks);
    newCompleted.add(taskId);
    setCompletedTasks(newCompleted);
  };

  const markTaskIncomplete = (taskId) => {
    const newCompleted = new Set(completedTasks);
    newCompleted.delete(taskId);
    setCompletedTasks(newCompleted);
  };

  const clearCompletedTasks = () => {
    setCompletedTasks(new Set());
  };

  const getTaskStatus = (taskId) => {
    return completedTasks.has(taskId) ? 'completed' : 'pending';
  };

  const getCompletedCount = () => {
    return completedTasks.size;
  };

  return {
    completedTasks,
    markTaskComplete,
    markTaskIncomplete,
    clearCompletedTasks,
    getTaskStatus,
    getCompletedCount
  };
};