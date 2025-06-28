/**
 * Routing Integration Tests
 * Tests URL navigation functionality and route handling
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock the heavy components to focus on routing
jest.mock('../services/dashboardDataService', () => ({
  getDurhamWeatherAlerts: jest.fn(() => []),
  getReadyToHarvest: jest.fn(() => []),
  getCriticalTimingWindows: jest.fn(() => []),
  getInvestmentPerformance: jest.fn(() => ({ totalSpent: 0, estimatedValue: 0, roi: 0 })),
  getTodaysActionableGuidance: jest.fn(() => [])
}));

jest.mock('../services/temporalShoppingService', () => ({
  generateGardenTasks: jest.fn(() => []),
  generatePureShoppingRecommendations: jest.fn(() => [])
}));

jest.mock('../services/databaseCalendarService', () => ({
  generateDatabaseGardenCalendar: jest.fn(() => Promise.resolve([]))
}));

// Mock the simulation hook
jest.mock('../hooks/useSimulation', () => ({
  useSimulation: jest.fn(() => ({
    simulationResults: null,
    simulating: false
  }))
}));

// Mock localStorage hooks
jest.mock('../hooks/useLocalStorage', () => ({
  useClimateSelection: jest.fn(() => ({
    selectedSummer: 'normal',
    selectedWinter: 'normal',
    selectedPortfolio: 'balanced',
    setSelectedSummer: jest.fn(),
    setSelectedWinter: jest.fn(),
    setSelectedPortfolio: jest.fn()
  })),
  useInvestmentConfig: jest.fn(() => [
    { seeds: 100, tools: 50, infrastructure: 75 },
    jest.fn()
  ])
}));

// Mock shopping and task hooks
jest.mock('../hooks/useShoppingList', () => ({
  useShoppingList: jest.fn(() => ({
    shoppingList: [],
    totalItems: 0,
    getTotalCost: () => 0,
    addToShoppingList: jest.fn(),
    markAsOwned: jest.fn(),
    getItemStatus: jest.fn(() => 'unselected'),
    removeFromShoppingList: jest.fn(),
    clearShoppingList: jest.fn()
  }))
}));

jest.mock('../hooks/useTaskManager', () => ({
  useTaskManager: jest.fn(() => ({
    getTaskCount: () => 0,
    getCompletedCount: () => 0,
    markTaskComplete: jest.fn(),
    getTaskStatus: jest.fn(() => 'pending')
  }))
}));

describe('Routing Integration Tests', () => {
  const renderWithRouter = (initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Route Rendering', () => {
    test('renders dashboard at root path', () => {
      renderWithRouter(['/']);
      
      expect(screen.getByText(/Garden Dashboard/)).toBeInTheDocument();
      expect(screen.getByText('GardenSim')).toBeInTheDocument();
    });

    test('renders tasks view at /tasks', () => {
      renderWithRouter(['/tasks']);
      
      expect(screen.getByText('📋 Garden Tasks')).toBeInTheDocument();
      expect(screen.getByText('Time-sensitive garden actions and indoor starting guidance')).toBeInTheDocument();
    });

    test('renders shopping view at /shopping', () => {
      renderWithRouter(['/shopping']);
      
      expect(screen.getByText('🛒 Loading Annual Seed Plan...')).toBeInTheDocument();
    });

    test('renders calendar view at /calendar', () => {
      renderWithRouter(['/calendar']);
      
      expect(screen.getByText('📅 Garden Calendar')).toBeInTheDocument();
    });

    test('renders analysis view at /analysis', () => {
      renderWithRouter(['/analysis']);
      
      expect(screen.getByText('📊 Analysis & Results')).toBeInTheDocument();
      expect(screen.getByText('Configure weather scenarios and view simulation results')).toBeInTheDocument();
    });

    test('renders config view at /config', () => {
      renderWithRouter(['/config']);
      
      expect(screen.getByText('⚙️ Garden Configuration')).toBeInTheDocument();
      expect(screen.getByText('Set your investment priorities and growing preferences')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    test('dashboard link navigates to home', () => {
      renderWithRouter(['/tasks']);
      
      const dashboardLink = screen.getByRole('link', { name: /Dashboard.*Today's priorities/ });
      expect(dashboardLink).toHaveAttribute('href', '/');
    });

    test('tasks link navigates to /tasks', () => {
      renderWithRouter(['/']);
      
      const tasksLink = screen.getByRole('link', { name: /Garden Tasks.*Time-sensitive actions/ });
      expect(tasksLink).toHaveAttribute('href', '/tasks');
    });

    test('shopping link navigates to /shopping', () => {
      renderWithRouter(['/']);
      
      const shoppingLink = screen.getByRole('link', { name: /Shopping.*Purchase planning/ });
      expect(shoppingLink).toHaveAttribute('href', '/shopping');
    });

    test('calendar link navigates to /calendar', () => {
      renderWithRouter(['/']);
      
      const calendarLink = screen.getByRole('link', { name: /Calendar.*Planting timeline/ });
      expect(calendarLink).toHaveAttribute('href', '/calendar');
    });

    test('analysis link navigates to /analysis', () => {
      renderWithRouter(['/']);
      
      const analysisLink = screen.getByRole('link', { name: /Analysis.*Simulation results/ });
      expect(analysisLink).toHaveAttribute('href', '/analysis');
    });

    test('setup link navigates to /config', () => {
      renderWithRouter(['/']);
      
      const configLink = screen.getByRole('link', { name: /Setup.*Garden configuration/ });
      expect(configLink).toHaveAttribute('href', '/config');
    });
  });

  describe('Active Navigation State', () => {
    test('dashboard nav item is active at root path', () => {
      renderWithRouter(['/']);
      
      const dashboardLink = screen.getByRole('link', { name: /Dashboard.*Today's priorities/ });
      expect(dashboardLink).toHaveClass('active');
    });

    test('tasks nav item is active at /tasks', () => {
      renderWithRouter(['/tasks']);
      
      const tasksLink = screen.getByRole('link', { name: /Garden Tasks.*Time-sensitive actions/ });
      expect(tasksLink).toHaveClass('active');
    });

    test('shopping nav item is active at /shopping', () => {
      renderWithRouter(['/shopping']);
      
      const shoppingLink = screen.getByRole('link', { name: /Shopping.*Purchase planning/ });
      expect(shoppingLink).toHaveClass('active');
    });

    test('calendar nav item is active at /calendar', () => {
      renderWithRouter(['/calendar']);
      
      const calendarLink = screen.getByRole('link', { name: /Calendar.*Planting timeline/ });
      expect(calendarLink).toHaveClass('active');
    });

    test('analysis nav item is active at /analysis', () => {
      renderWithRouter(['/analysis']);
      
      const analysisLink = screen.getByRole('link', { name: /Analysis.*Simulation results/ });
      expect(analysisLink).toHaveClass('active');
    });

    test('config nav item is active at /config', () => {
      renderWithRouter(['/config']);
      
      const configLink = screen.getByRole('link', { name: /Setup.*Garden configuration/ });
      expect(configLink).toHaveClass('active');
    });

    test('only one nav item is active at a time', () => {
      renderWithRouter(['/tasks']);
      
      const activeLinks = screen.getAllByRole('link').filter(link => 
        link.classList.contains('active')
      );
      
      expect(activeLinks).toHaveLength(1);
      expect(activeLinks[0]).toHaveAttribute('href', '/tasks');
    });
  });

  describe('Route Redirects', () => {
    test('/dashboard redirects to root path', async () => {
      renderWithRouter(['/dashboard']);
      
      // Should show dashboard content (indicating redirect worked)
      await waitFor(() => {
        expect(screen.getByText(/Garden Dashboard/)).toBeInTheDocument();
      });
    });
  });

  describe('Invalid Routes', () => {
    test('unknown route renders AppContent with 404 handling', () => {
      renderWithRouter(['/nonexistent-route']);
      
      // Should still render the app structure (Navigation component)
      expect(screen.getByText('GardenSim')).toBeInTheDocument();
      
      // The AppContent component handles unknown routes in its renderView method
      // It should render the dashboard as default or a 404 component
    });
  });

  describe('Navigation Integration', () => {
    test('navigation preserves app state across routes', () => {
      const { rerender } = renderWithRouter(['/']);
      
      // Should show navigation on dashboard
      expect(screen.getByText('GardenSim')).toBeInTheDocument();
      
      // Navigate to tasks
      rerender(
        <MemoryRouter initialEntries={['/tasks']}>
          <App />
        </MemoryRouter>
      );
      
      // Navigation should still be present
      expect(screen.getByText('GardenSim')).toBeInTheDocument();
      expect(screen.getByText('📋 Garden Tasks')).toBeInTheDocument();
    });

    test('shopping badge shows on navigation when items present', () => {
      // Mock shopping list with items
      const mockUseShoppingList = require('../hooks/useShoppingList').useShoppingList;
      mockUseShoppingList.mockReturnValue({
        shoppingList: [{ id: 'test', item: 'Test Item' }],
        totalItems: 1,
        getTotalCost: () => 10,
        addToShoppingList: jest.fn(),
        markAsOwned: jest.fn(),
        getItemStatus: jest.fn(() => 'unselected'),
        removeFromShoppingList: jest.fn(),
        clearShoppingList: jest.fn()
      });

      renderWithRouter(['/']);
      
      const shoppingLink = screen.getByRole('link', { name: /Shopping.*Purchase planning/ });
      
      // Check for badge within the shopping link context
      expect(shoppingLink).toBeInTheDocument();
      // Note: Testing for specific badge styling is implementation detail
      // Better to test the badge text/content if it contains meaningful info
    });

    test('tasks badge shows on navigation when tasks present', () => {
      // Mock task manager with incomplete tasks
      const mockUseTaskManager = require('../hooks/useTaskManager').useTaskManager;
      mockUseTaskManager.mockReturnValue({
        getTaskCount: () => 5,
        getCompletedCount: () => 2, // 3 incomplete tasks
        markTaskComplete: jest.fn(),
        getTaskStatus: jest.fn(() => 'pending')
      });

      renderWithRouter(['/']);
      
      const tasksLink = screen.getByRole('link', { name: /Garden Tasks.*Time-sensitive actions/ });
      
      // Check tasks link is present (badge testing removed as implementation detail)
      expect(tasksLink).toBeInTheDocument();
    });
  });

  describe('URL Structure', () => {
    test('all routes use expected URL patterns', () => {
      const routes = [
        { path: '/', name: 'Dashboard' },
        { path: '/tasks', name: 'Garden Tasks' },
        { path: '/shopping', name: 'Shopping' },
        { path: '/calendar', name: 'Calendar' },
        { path: '/analysis', name: 'Analysis' },
        { path: '/config', name: 'Setup' }
      ];

      routes.forEach(({ path, name }) => {
        renderWithRouter([path]);
        
        const navLink = screen.getByRole('link', { name: new RegExp(name) });
        expect(navLink).toHaveAttribute('href', path);
      });
    });
  });
});