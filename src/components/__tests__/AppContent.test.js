/**
 * AppContent Component Tests
 * Tests main application routing and view rendering logic
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppContent from '../AppContent';

// Mock all the service dependencies
jest.mock('../../services/dashboardDataService', () => ({
  getDurhamWeatherAlerts: jest.fn(() => []),
  getReadyToHarvest: jest.fn(() => []),
  getCriticalTimingWindows: jest.fn(() => []),
  getInvestmentPerformance: jest.fn(() => ({ totalSpent: 0, estimatedValue: 0, roi: 0 })),
  getTodaysActionableGuidance: jest.fn(() => [])
}));

jest.mock('../../services/temporalShoppingService', () => ({
  generateGardenTasks: jest.fn(() => []),
  generatePureShoppingRecommendations: jest.fn(() => [])
}));

jest.mock('../../services/durhamRecommendations', () => ({
  generateDurhamMonthlyFocus: jest.fn(() => 'Mock monthly focus'),
  generateDurhamWeeklyActions: jest.fn(() => []),
  generateDurhamTopCrops: jest.fn(() => 'Mock top crops'),
  generateDurhamSiteRecommendations: jest.fn(() => 'Mock site recommendations'),
  generateDurhamInvestmentPriority: jest.fn(() => 'Mock investment priority')
}));

jest.mock('../../services/databaseCalendarService', () => ({
  generateDatabaseGardenCalendar: jest.fn(() => Promise.resolve([
    { month: 'January', tasks: ['Test task'] }
  ]))
}));

jest.mock('../../data/climateScenarios', () => ({
  generateLocationSpecificScenarios: jest.fn(() => ({
    summer: { normal: { name: 'Normal Summer' } },
    winter: { normal: { name: 'Normal Winter' } }
  }))
}));

jest.mock('../../data/portfolioStrategies', () => ({
  getPortfolioStrategies: jest.fn(() => ({
    balanced: { name: 'Balanced Strategy' }
  })),
  createCustomPortfolio: jest.fn(),
  validatePortfolioAllocations: jest.fn(() => true)
}));

jest.mock('../../config', () => ({
  generateSuccessOutlook: jest.fn(() => ({ message: 'Mock success outlook' }))
}));

// Mock hooks
jest.mock('../../hooks/useSimulation', () => ({
  useSimulation: jest.fn(() => ({
    simulationResults: { totalValue: 1000, roi: 15 },
    simulating: false
  }))
}));

jest.mock('../../hooks/useLocalStorage', () => ({
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

jest.mock('../../hooks/useShoppingList', () => ({
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

jest.mock('../../hooks/useCalendarTaskManager', () => ({
  useCalendarTaskManager: jest.fn(() => ({
    getTaskCount: () => 0,
    getCompletedCount: () => 0,
    getUrgentPendingCount: () => 0,
    markTaskComplete: jest.fn(),
    getTaskStatus: jest.fn(() => 'pending')
  }))
}));

// Mock additional dependencies needed by GardenStateProvider
jest.mock('../../config/durhamConfig', () => ({
  DURHAM_CONFIG: {
    location: 'Durham, NC',
    zone: '7b'
  }
}));

jest.mock('../../services/unifiedCalendarService', () => ({
  generateUnifiedCalendar: jest.fn(() => Promise.resolve([
    { month: 'January', activities: [] }
  ]))
}));

describe('AppContent Component', () => {
  const renderWithRouter = (initialEntries = ['/']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <AppContent />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Route Rendering', () => {
    test('renders dashboard view at root path', async () => {
      renderWithRouter(['/']);
      
      await waitFor(() => {
        expect(screen.getByText(/Durham Garden Dashboard/)).toBeInTheDocument();
      });
    });

    test('renders tasks view at /tasks path', () => {
      renderWithRouter(['/tasks']);
      
      expect(screen.getByText('📋 Garden Tasks')).toBeInTheDocument();
      expect(screen.getByText('Time-sensitive garden actions and indoor starting guidance')).toBeInTheDocument();
    });

    test('renders shopping view at /shopping path', () => {
      renderWithRouter(['/shopping']);
      
      expect(screen.getByText('🛒 Loading Annual Seed Plan...')).toBeInTheDocument();
    });

    test('renders calendar view at /calendar path', async () => {
      renderWithRouter(['/calendar']);
      
      await waitFor(() => {
        expect(screen.getByText('📅 Garden Calendar')).toBeInTheDocument();
      });
    });

    test('renders analysis view at /analysis path', () => {
      renderWithRouter(['/analysis']);
      
      expect(screen.getByText('📊 Analysis & Results')).toBeInTheDocument();
      expect(screen.getByText('Configure weather scenarios and view simulation results')).toBeInTheDocument();
    });

    test('renders config view at /config path', () => {
      renderWithRouter(['/config']);
      
      expect(screen.getByText('⚙️ Garden Configuration')).toBeInTheDocument();
      expect(screen.getByText('Set your investment priorities and growing preferences')).toBeInTheDocument();
    });

    test('renders 404 for unknown routes', () => {
      renderWithRouter(['/unknown-route']);
      
      expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
      expect(screen.getByText('The requested page could not be found.')).toBeInTheDocument();
    });
  });

  describe('Navigation Integration', () => {
    test('renders navigation component on all routes', () => {
      const routes = ['/', '/tasks', '/shopping', '/calendar', '/analysis', '/config'];
      
      routes.forEach(route => {
        const { unmount } = renderWithRouter([route]);
        
        expect(screen.getByText('Durham Garden')).toBeInTheDocument();
        expect(screen.getByText('Climate-aware planning')).toBeInTheDocument();
        
        unmount();
      });
    });

    test('passes correct props to Navigation component', () => {
      // Mock shopping list with items
      const mockUseShoppingList = require('../../hooks/useShoppingList').useShoppingList;
      mockUseShoppingList.mockReturnValue({
        shoppingList: [{ id: 'test' }],
        totalItems: 5,
        getTotalCost: () => 100,
        addToShoppingList: jest.fn(),
        markAsOwned: jest.fn(),
        getItemStatus: jest.fn(() => 'unselected'),
        removeFromShoppingList: jest.fn(),
        clearShoppingList: jest.fn()
      });

      // Mock task manager with incomplete tasks
      const mockUseCalendarTaskManager = require('../../hooks/useCalendarTaskManager').useCalendarTaskManager;
      mockUseCalendarTaskManager.mockReturnValue({
        getTaskCount: () => 10,
        getCompletedCount: () => 3,
        getUrgentPendingCount: () => 7,
        markTaskComplete: jest.fn(),
        getTaskStatus: jest.fn(() => 'pending')
      });

      renderWithRouter(['/']);

      // Should show badges in navigation
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('Route-Specific Data Loading', () => {
    test('dashboard loads dashboard-specific data services', async () => {
      const mockGetDurhamWeatherAlerts = require('../../services/dashboardDataService').getDurhamWeatherAlerts;
      const mockGetReadyToHarvest = require('../../services/dashboardDataService').getReadyToHarvest;
      
      renderWithRouter(['/']);
      
      await waitFor(() => {
        expect(mockGetDurhamWeatherAlerts).toHaveBeenCalled();
        expect(mockGetReadyToHarvest).toHaveBeenCalled();
      });
    });

    test('calendar loads database calendar service', async () => {
      const mockGenerateCalendar = require('../../services/databaseCalendarService').generateDatabaseGardenCalendar;
      
      renderWithRouter(['/calendar']);
      
      await waitFor(() => {
        expect(mockGenerateCalendar).toHaveBeenCalled();
      });
    });

    test('analysis view shows budget information', () => {
      renderWithRouter(['/analysis']);
      
      expect(screen.getByText(/Current budget:/)).toBeInTheDocument();
      expect(screen.getByText('$225')).toBeInTheDocument(); // 100 + 50 + 75
    });

    test('config view shows investment totals', () => {
      renderWithRouter(['/config']);
      
      expect(screen.getByText(/Total budget:/)).toBeInTheDocument();
      expect(screen.getByText('$225')).toBeInTheDocument();
    });
  });

  describe('State Management Integration', () => {
    test('uses climate selection hook correctly', () => {
      const mockUseClimateSelection = require('../../hooks/useLocalStorage').useClimateSelection;
      
      renderWithRouter(['/analysis']);
      
      expect(mockUseClimateSelection).toHaveBeenCalled();
    });

    test('uses simulation hook with correct parameters', () => {
      const mockUseSimulation = require('../../hooks/useSimulation').useSimulation;
      
      renderWithRouter(['/']);
      
      expect(mockUseSimulation).toHaveBeenCalledWith(
        'normal', // selectedSummer
        'normal', // selectedWinter
        'balanced', // selectedPortfolio
        expect.objectContaining({ // locationConfig
          budget: 225,
          gardenSizeActual: 100
        }),
        null, // customPortfolio
        { seeds: 100, tools: 50, infrastructure: 75 } // customInvestment
      );
    });

    test('uses shopping and task hooks correctly', () => {
      const mockUseShoppingList = require('../../hooks/useShoppingList').useShoppingList;
      const mockUseCalendarTaskManager = require('../../hooks/useCalendarTaskManager').useCalendarTaskManager;
      
      renderWithRouter(['/']);
      
      expect(mockUseShoppingList).toHaveBeenCalled();
      expect(mockUseCalendarTaskManager).toHaveBeenCalled();
    });
  });

  describe('View-Specific Props Passing', () => {
    test('dashboard receives correct props', async () => {
      renderWithRouter(['/']);
      
      await waitFor(() => {
        // Dashboard should show the current date
        expect(screen.getByText(/Durham Garden Dashboard/)).toBeInTheDocument();
      });
    });

    test('analysis view shows simulation results', () => {
      renderWithRouter(['/analysis']);
      
      // Should show weather scenario controls
      expect(screen.getByText('🌡️ Weather Scenarios')).toBeInTheDocument();
    });

    test('config view shows strategy information', () => {
      renderWithRouter(['/config']);
      
      expect(screen.getByText('💰 Investment Priorities')).toBeInTheDocument();
      expect(screen.getByText('🌱 Growing Strategy')).toBeInTheDocument();
      expect(screen.getByText('🎯 Your Durham Strategy')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles calendar loading errors gracefully', async () => {
      const mockGenerateCalendar = require('../../services/databaseCalendarService').generateDatabaseGardenCalendar;
      mockGenerateCalendar.mockRejectedValue(new Error('Calendar loading failed'));
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderWithRouter(['/calendar']);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error loading garden calendar:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });

    test('handles missing simulation results gracefully', () => {
      const mockUseSimulation = require('../../hooks/useSimulation').useSimulation;
      mockUseSimulation.mockReturnValue({
        simulationResults: null,
        simulating: false
      });
      
      renderWithRouter(['/config']);
      
      expect(screen.getByText('Run simulation to see success outlook')).toBeInTheDocument();
    });
  });

  describe('404 Error Page', () => {
    test('404 page has return to dashboard button', () => {
      renderWithRouter(['/nonexistent']);
      
      const returnButton = screen.getByText('Return to Dashboard');
      expect(returnButton).toBeInTheDocument();
      
      // Button should be clickable (note: actual navigation testing would require fireEvent.click)
      expect(returnButton.tagName).toBe('BUTTON');
    });

    test('404 page shows appropriate error message', () => {
      renderWithRouter(['/invalid-route']);
      
      expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
      expect(screen.getByText('The requested page could not be found.')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    test('renders main app structure', () => {
      renderWithRouter(['/']);
      
      const app = document.querySelector('.app');
      expect(app).toBeInTheDocument();
      
      const mainContent = document.querySelector('.main-content');
      expect(mainContent).toBeInTheDocument();
      
      const navigation = document.querySelector('.main-navigation');
      expect(navigation).toBeInTheDocument();
    });

    test('navigation and main content are properly structured', () => {
      renderWithRouter(['/tasks']);
      
      // Navigation should come before main content in DOM order
      const app = document.querySelector('.app');
      const navigation = app.querySelector('.main-navigation');
      const mainContent = app.querySelector('.main-content');
      
      expect(navigation).toBeInTheDocument();
      expect(mainContent).toBeInTheDocument();
      
      // Navigation should appear before main content
      expect(navigation.compareDocumentPosition(mainContent)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });

  describe('Budget Calculations', () => {
    test('calculates total budget correctly from investment config', () => {
      renderWithRouter(['/config']);
      
      // Should show calculated total: 100 + 50 + 75 = 225
      expect(screen.getByText('$225')).toBeInTheDocument();
    });

    test('handles investment config changes', () => {
      const mockUseInvestmentConfig = require('../../hooks/useLocalStorage').useInvestmentConfig;
      mockUseInvestmentConfig.mockReturnValue([
        { seeds: 200, tools: 100, infrastructure: 150 },
        jest.fn()
      ]);
      
      renderWithRouter(['/analysis']);
      
      // Should show updated total: 200 + 100 + 150 = 450
      expect(screen.getByText('$450')).toBeInTheDocument();
    });
  });
});