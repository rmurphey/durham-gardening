/**
 * Enhanced Plant Recommendations Component Tests
 * Tests the display of database-enhanced plant recommendations with varieties
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import EnhancedPlantRecommendations from '../EnhancedPlantRecommendations.js';

import { getEnhancedLocationRecommendations } from '../../services/enhancedLocationRecommendations.js';

// Mock the enhanced location recommendations service
jest.mock('../../services/enhancedLocationRecommendations.js', () => ({
  getEnhancedLocationRecommendations: jest.fn()
}));

describe('EnhancedPlantRecommendations', () => {
  const mockLocationConfig = {
    name: 'Zone 7b Location',
    hardiness: '7b',
    coordinates: { lat: 35.7796, lon: -78.6382 }
  };

  const mockEnhancedData = {
    summary: {
      totalSuitableCrops: 15,
      heatTolerantOptions: 8,
      droughtTolerantOptions: 5,
      locationChallenge: 'Hot, humid summers with heavy clay soil',
      topRecommendation: 'Focus on heat-tolerant varieties with good drainage',
      bestStrategies: [
        'Use shade cloth during peak summer',
        'Amend clay soil with organic matter',
        'Select heat-tolerant varieties'
      ]
    },
    crops: [
      {
        plantKey: 'tomato',
        name: 'Tomato',
        locationSuitability: 0.85,
        enhancedData: {
          zones: '6-9',
          category: 'Warm Season',
          heat: 'good',
          drought: 'fair',
          daysToMaturity: 75
        },
        growingTips: [
          { category: 'Watering', text: 'Deep water early morning' },
          { category: 'Support', text: 'Use sturdy cages or stakes' }
        ],
        varieties: [
          {
            varietyName: 'Cherokee Purple',
            zoneSuitability: 'Excellent',
            recommendation: 'Heat-tolerant heirloom with excellent flavor',
            daysToMaturity: 85,
            vendorName: 'True Leaf Market',
            price: '4.95'
          },
          {
            varietyName: 'Better Boy',
            zoneSuitability: 'Good',
            recommendation: 'Reliable hybrid with disease resistance',
            daysToMaturity: 75,
            vendorName: 'Burpee',
            price: '3.49'
          }
        ],
        companions: {
          beneficial: [
            { name: 'Basil' },
            { name: 'Marigold' }
          ],
          antagonistic: [
            { name: 'Walnut' }
          ]
        }
      }
    ],
    recommendations: {
      current: {
        plantNow: [{ name: 'Kale' }, { name: 'Lettuce' }],
        prepareNext: [{ name: 'Tomato' }, { name: 'Pepper' }]
      },
      yearRound: [{ name: 'Herbs' }]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    getEnhancedLocationRecommendations.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<EnhancedPlantRecommendations locationConfig={mockLocationConfig} />);

    expect(screen.getByText('Loading enhanced plant data from database...')).toBeInTheDocument();
  });

  test('renders enhanced recommendations when data loaded', async () => {
    getEnhancedLocationRecommendations.mockResolvedValue(mockEnhancedData);

    render(<EnhancedPlantRecommendations locationConfig={mockLocationConfig} />);

    await waitFor(() => {
      expect(screen.getByText('Enhanced Plant Recommendations')).toBeInTheDocument();
    });

    // Check summary section
    expect(screen.getByText('15')).toBeInTheDocument(); // totalSuitableCrops
    expect(screen.getByText('suitable crops')).toBeInTheDocument();
    expect(screen.getByText('Hot, humid summers with clay soil')).toBeInTheDocument();

    // Check crop recommendations
    expect(screen.getByText('Tomato')).toBeInTheDocument();
    expect(screen.getByText('85% match')).toBeInTheDocument();
    expect(screen.getByText('Heat: good, Drought: fair')).toBeInTheDocument();

    // Check varieties section
    expect(screen.getByText('Recommended Varieties for Zone 7b:')).toBeInTheDocument();
    expect(screen.getByText('Cherokee Purple')).toBeInTheDocument();
    expect(screen.getByText('Heat-tolerant heirloom with excellent flavor')).toBeInTheDocument();
    expect(screen.getByText('Harvest in 85 days')).toBeInTheDocument();
    expect(screen.getByText('Available from True Leaf Market')).toBeInTheDocument();

    // Check companion planting
    expect(screen.getByText('Companion Planting:')).toBeInTheDocument();
    expect(screen.getByText('Plant with: Basil, Marigold')).toBeInTheDocument();
    expect(screen.getByText('Avoid: Walnut')).toBeInTheDocument();
  });

  test('renders error state when loading fails', async () => {
    const mockError = new Error('Database connection failed');
    getEnhancedLocationRecommendations.mockRejectedValue(mockError);

    render(<EnhancedPlantRecommendations locationConfig={mockLocationConfig} />);

    await waitFor(() => {
      expect(screen.getByText(/Database integration in progress/)).toBeInTheDocument();
    });

    expect(screen.getByText('Using static data fallback.')).toBeInTheDocument();
    expect(screen.getByText('Error: Database connection failed')).toBeInTheDocument();
  });

  test('handles missing location config gracefully', () => {
    render(<EnhancedPlantRecommendations locationConfig={null} />);

    expect(screen.getByText('Location configuration required to show enhanced recommendations.')).toBeInTheDocument();
  });

  test('handles empty crop recommendations', async () => {
    const emptyData = {
      ...mockEnhancedData,
      crops: []
    };
    getEnhancedLocationRecommendations.mockResolvedValue(emptyData);

    render(<EnhancedPlantRecommendations locationConfig={mockLocationConfig} />);

    await waitFor(() => {
      expect(screen.getByText('No enhanced recommendations available for Zone 7b Location.')).toBeInTheDocument();
    });
  });

  test('handles crops without varieties gracefully', async () => {
    const dataWithoutVarieties = {
      ...mockEnhancedData,
      crops: [{
        ...mockEnhancedData.crops[0],
        varieties: []
      }]
    };
    getEnhancedLocationRecommendations.mockResolvedValue(dataWithoutVarieties);

    render(<EnhancedPlantRecommendations locationConfig={mockLocationConfig} />);

    await waitFor(() => {
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    // Should not render varieties section when no varieties available
    expect(screen.queryByText('Recommended Varieties for Zone 7b:')).not.toBeInTheDocument();
  });

  test('renders variety suitability badges correctly', async () => {
    getEnhancedLocationRecommendations.mockResolvedValue(mockEnhancedData);

    render(<EnhancedPlantRecommendations locationConfig={mockLocationConfig} />);

    await waitFor(() => {
      expect(screen.getByText('EXCELLENT')).toBeInTheDocument();
    });
    expect(screen.getByText('GOOD')).toBeInTheDocument();

    // Check that the CSS classes are applied
    const excellentBadge = screen.getByText('EXCELLENT');
    expect(excellentBadge).toHaveClass('excellent');
  });

  test('renders seasonal recommendations section', async () => {
    getEnhancedLocationRecommendations.mockResolvedValue(mockEnhancedData);

    render(<EnhancedPlantRecommendations locationConfig={mockLocationConfig} />);

    await waitFor(() => {
      expect(screen.getByText('Current Season Actions')).toBeInTheDocument();
    });

    expect(screen.getByText('Plant Now:')).toBeInTheDocument();
    expect(screen.getByText('Kale, Lettuce')).toBeInTheDocument();
    expect(screen.getByText('Prepare for Next Month:')).toBeInTheDocument();
    expect(screen.getByText('Tomato, Pepper')).toBeInTheDocument();
    expect(screen.getByText('Year-Round Options:')).toBeInTheDocument();
    expect(screen.getByText('Herbs')).toBeInTheDocument();
  });

  test('renders recommended strategies section', async () => {
    getEnhancedLocationRecommendations.mockResolvedValue(mockEnhancedData);

    render(<EnhancedPlantRecommendations locationConfig={mockLocationConfig} />);

    await waitFor(() => {
      expect(screen.getByText('Recommended Strategies')).toBeInTheDocument();
    });

    expect(screen.getByText('Use shade cloth during peak summer')).toBeInTheDocument();
    expect(screen.getByText('Amend clay soil with organic matter')).toBeInTheDocument();
    expect(screen.getByText('Select heat-tolerant varieties')).toBeInTheDocument();
  });
});