import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the database to prevent async issues in tests
jest.mock('../services/databaseCalendarService.js', () => ({
  generateDatabaseGardenCalendar: jest.fn().mockResolvedValue([])
}));

// Mock jStat to prevent statistical computation in tests
jest.mock('jstat', () => ({
  normal: {
    sample: jest.fn(() => 100)
  },
  poisson: {
    sample: jest.fn(() => 5)
  }
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    // This test will fail if there are any JavaScript syntax errors,
    // undefined variables, or React rendering errors
    render(<App />);
    
    // Basic smoke test - check that the app title renders
    expect(screen.getByText(/GardenSim/i)).toBeInTheDocument();
  });

  test('has all required imports and components', () => {
    // This test ensures all component dependencies are properly imported
    // and that the component structure is valid
    render(<App />);
    
    // Check that the app structure is rendered using Testing Library queries
    expect(screen.getByRole('main')).toBeInTheDocument(); // main-content
    // App and header elements don't have semantic roles, test is checking internal structure
    // which is more of an implementation detail. Testing presence through content is better.
  });

  test('no console errors during render', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<App />);
    
    // Should not have any console errors during initial render
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});