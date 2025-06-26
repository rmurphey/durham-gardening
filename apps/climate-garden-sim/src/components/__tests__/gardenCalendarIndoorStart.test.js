/**
 * Tests for GardenCalendar Component Indoor Start Activities
 * Validates rendering, styling, and display of indoor start activities
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import GardenCalendar from '../GardenCalendar';

describe('GardenCalendar Indoor Start Activities', () => {
  const mockIndoorStartCalendar = [
    {
      month: 'February',
      activities: [
        {
          type: 'indoor-starting',
          crop: 'Tomatoes',
          action: 'Start Cherokee Purple, Early Girl tomato seeds indoors',
          timing: '8-10 weeks before last frost (April 15)',
          priority: 'high'
        },
        {
          type: 'indoor-starting',
          crop: 'Hot Peppers',
          action: 'Start Fish Pepper, Hungarian Hot Wax seeds indoors',
          timing: '10-12 weeks before last frost',
          priority: 'critical'
        }
      ]
    },
    {
      month: 'March',
      activities: [
        {
          type: 'indoor-starting',
          crop: 'Basil',
          action: 'Start Sweet Basil, Thai Basil seeds indoors',
          timing: '4-6 weeks before last frost',
          priority: 'medium'
        },
        {
          type: 'seed-starting',
          crop: 'Eggplant',
          action: 'Start Japanese Long eggplant seeds indoors',
          timing: '8-10 weeks before last frost',
          priority: 'high'
        }
      ]
    },
    {
      month: 'April',
      activities: [
        {
          type: 'transplant',
          crop: 'Lettuce',
          action: 'Transplant lettuce to garden beds',
          timing: 'After soil workable',
          priority: 'medium'
        }
      ]
    }
  ];

  describe('Component Rendering', () => {
    test('should render calendar with indoor start activities', () => {
      render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      expect(screen.getByText('Garden Calendar')).toBeInTheDocument();
      expect(screen.getByText('February')).toBeInTheDocument();
      expect(screen.getByText('March')).toBeInTheDocument();
      expect(screen.getByText('April')).toBeInTheDocument();
    });

    test('should render indoor start activities with correct content', () => {
      render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Check tomato activity
      expect(screen.getByText('Tomatoes')).toBeInTheDocument();
      expect(screen.getByText('Start Cherokee Purple, Early Girl tomato seeds indoors')).toBeInTheDocument();
      expect(screen.getByText('8-10 weeks before last frost (April 15)')).toBeInTheDocument();
      
      // Check pepper activity
      expect(screen.getByText('Hot Peppers')).toBeInTheDocument();
      expect(screen.getByText('Start Fish Pepper, Hungarian Hot Wax seeds indoors')).toBeInTheDocument();
      expect(screen.getByText('10-12 weeks before last frost')).toBeInTheDocument();
      
      // Check basil activity
      expect(screen.getByText('Basil')).toBeInTheDocument();
      expect(screen.getByText('Start Sweet Basil, Thai Basil seeds indoors')).toBeInTheDocument();
      expect(screen.getByText('4-6 weeks before last frost')).toBeInTheDocument();
    });

    test('should render seed-starting activities with alternative naming', () => {
      render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      expect(screen.getByText('Eggplant')).toBeInTheDocument();
      expect(screen.getByText('Start Japanese Long eggplant seeds indoors')).toBeInTheDocument();
    });

    test('should render indoor start icons', () => {
      const { container } = render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Look for seed/indoor start icons (🌰)
      const indoorStartIcons = container.querySelectorAll('.activity-icon');
      expect(indoorStartIcons.length).toBeGreaterThan(0);
      
      // Check that indoor start activities have the seed icon
      const indoorStartActivities = container.querySelectorAll('.activity.activity-indoor-starting');
      const seedStartActivities = container.querySelectorAll('.activity.activity-seed-starting');
      
      // Should have activities with indoor start icons
      expect(indoorStartActivities.length).toBeGreaterThanOrEqual(2);
      expect(seedStartActivities.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('CSS Class Application', () => {
    test('should apply correct CSS classes for indoor-starting activities', () => {
      const { container } = render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Check for indoor-starting activity classes
      const indoorStartActivities = container.querySelectorAll('.activity.activity-indoor-starting');
      expect(indoorStartActivities.length).toBeGreaterThanOrEqual(2);
      
      indoorStartActivities.forEach(activity => {
        expect(activity).toHaveClass('activity');
        expect(activity).toHaveClass('activity-indoor-starting');
      });
    });

    test('should apply correct CSS classes for seed-starting activities', () => {
      const { container } = render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      const seedStartActivities = container.querySelectorAll('.activity.activity-seed-starting');
      expect(seedStartActivities.length).toBe(1);
      
      seedStartActivities.forEach(activity => {
        expect(activity).toHaveClass('activity');
        expect(activity).toHaveClass('activity-seed-starting');
      });
    });

    test('should apply priority classes correctly', () => {
      const { container } = render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Check high priority indoor start activity
      const highPriorityActivities = container.querySelectorAll('.activity.priority-high');
      expect(highPriorityActivities.length).toBeGreaterThan(0);
      
      // Check critical priority indoor start activity
      const criticalPriorityActivities = container.querySelectorAll('.activity.priority-critical');
      expect(criticalPriorityActivities.length).toBe(1);
      
      // Check medium priority activity
      const mediumPriorityActivities = container.querySelectorAll('.activity.priority-medium');
      expect(mediumPriorityActivities.length).toBeGreaterThan(0);
    });

    test('should combine activity type and priority classes', () => {
      const { container } = render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Look for combined classes like activity-indoor-starting priority-high
      const highPriorityIndoorStart = container.querySelector('.activity.activity-indoor-starting.priority-high');
      expect(highPriorityIndoorStart).toBeInTheDocument();
      
      const criticalPriorityIndoorStart = container.querySelector('.activity.activity-indoor-starting.priority-critical');
      expect(criticalPriorityIndoorStart).toBeInTheDocument();
    });
  });

  describe('Priority Indicators', () => {
    test('should display priority badges for indoor start activities', () => {
      const { container } = render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Check for urgent priority indicators (may be multiple)
      expect(screen.getAllByText('urgent').length).toBeGreaterThan(0);
      
      // Check for critical priority indicator  
      expect(screen.getByText('critical')).toBeInTheDocument();
    });

    test('should show critical priority for time-sensitive indoor starts', () => {
      render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Hot peppers should show critical priority (10-12 weeks timing)
      const criticalPriorityText = screen.getByText('critical');
      expect(criticalPriorityText).toBeInTheDocument();
      
      // Should be associated with hot peppers activity
      const hotPeppersText = screen.getByText('Hot Peppers');
      expect(hotPeppersText).toBeInTheDocument();
    });

    test('should show urgent priority for high priority indoor starts', () => {
      render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Should have urgent priority indicators for high priority activities
      const urgentPriorityElements = screen.getAllByText('urgent');
      expect(urgentPriorityElements.length).toBeGreaterThan(0);
      
      // Should be associated with tomatoes activity
      const tomatoesText = screen.getByText('Tomatoes');
      expect(tomatoesText).toBeInTheDocument();
    });
  });

  describe('Activity Structure', () => {
    test('should render activity headers with crop and priority', () => {
      const { container } = render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      const activityHeaders = container.querySelectorAll('.activity-header');
      expect(activityHeaders.length).toBeGreaterThan(0);
      
      // Each activity should have crop name and icon
      const activityCrops = container.querySelectorAll('.activity-crop');
      expect(activityCrops.length).toBeGreaterThan(0);
      
      // Should have priority indicators
      const activityPriorities = container.querySelectorAll('.activity-priority');
      expect(activityPriorities.length).toBeGreaterThan(0);
    });

    test('should render activity actions and timing', () => {
      const { container } = render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Check for action text
      const activityActions = container.querySelectorAll('.activity-action');
      expect(activityActions.length).toBeGreaterThan(0);
      
      // Check for timing text
      const activityTimings = container.querySelectorAll('.activity-timing');
      expect(activityTimings.length).toBeGreaterThan(0);
    });

    test('should handle activities without timing gracefully', () => {
      const calendarWithoutTiming = [
        {
          month: 'February',
          activities: [
            {
              type: 'indoor-starting',
              crop: 'Tomatoes',
              action: 'Start tomato seeds indoors',
              priority: 'high'
              // No timing property
            }
          ]
        }
      ];
      
      render(<GardenCalendar gardenCalendar={calendarWithoutTiming} />);
      
      expect(screen.getByText('Tomatoes')).toBeInTheDocument();
      expect(screen.getByText('Start tomato seeds indoors')).toBeInTheDocument();
    });
  });

  describe('Mixed Activity Types', () => {
    test('should render indoor start activities alongside other activity types', () => {
      const mixedCalendar = [
        {
          month: 'February',
          activities: [
            {
              type: 'indoor-starting',
              crop: 'Tomatoes',
              action: 'Start tomato seeds indoors',
              priority: 'high'
            },
            {
              type: 'shopping',
              crop: 'Seeds',
              action: 'Order pepper seeds',
              priority: 'medium'
            },
            {
              type: 'maintenance',
              crop: 'General',
              action: 'Check seed starting equipment',
              priority: 'low'
            }
          ]
        }
      ];
      
      const { container } = render(<GardenCalendar gardenCalendar={mixedCalendar} />);
      
      // Should have different activity types
      expect(container.querySelector('.activity.activity-indoor-starting')).toBeInTheDocument();
      expect(container.querySelector('.activity.activity-shopping')).toBeInTheDocument();
      expect(container.querySelector('.activity.activity-maintenance')).toBeInTheDocument();
    });

    test('should distinguish indoor start activities from other types visually', () => {
      const mixedCalendar = [
        {
          month: 'February',
          activities: [
            {
              type: 'indoor-starting',
              crop: 'Tomatoes',
              action: 'Start tomato seeds indoors',
              priority: 'high'
            },
            {
              type: 'direct-sow',
              crop: 'Peas',
              action: 'Direct sow peas in garden',
              priority: 'medium'
            }
          ]
        }
      ];
      
      const { container } = render(<GardenCalendar gardenCalendar={mixedCalendar} />);
      
      const indoorStartActivity = container.querySelector('.activity.activity-indoor-starting');
      const directSowActivity = container.querySelector('.activity.activity-direct-sow');
      
      expect(indoorStartActivity).toBeInTheDocument();
      expect(directSowActivity).toBeInTheDocument();
      
      // Should have different styling classes
      expect(indoorStartActivity).not.toHaveClass('activity-direct-sow');
      expect(directSowActivity).not.toHaveClass('activity-indoor-starting');
    });
  });

  describe('Error Handling', () => {
    test('should handle empty calendar gracefully', () => {
      const { container } = render(<GardenCalendar gardenCalendar={[]} />);
      
      // Component should render nothing for empty calendar
      expect(container.firstChild).toBeNull();
    });

    test('should handle null calendar gracefully', () => {
      const { container } = render(<GardenCalendar gardenCalendar={null} />);
      
      // Should render nothing for null calendar
      expect(container.firstChild).toBeNull();
    });

    test('should handle months without activities', () => {
      const sparseCalendar = [
        {
          month: 'February',
          activities: []
        }
      ];
      
      render(<GardenCalendar gardenCalendar={sparseCalendar} />);
      
      expect(screen.getByText('February')).toBeInTheDocument();
      expect(screen.getByText('Planning and preparation month')).toBeInTheDocument();
    });

    test('should handle malformed activity data', () => {
      const malformedCalendar = [
        {
          month: 'February',
          activities: [
            {
              // Missing type
              crop: 'Tomatoes',
              action: 'Start tomato seeds indoors',
              priority: 'high'
            },
            {
              type: 'indoor-starting',
              // Missing crop
              action: 'Start seeds indoors',
              priority: 'medium'
            }
          ]
        }
      ];
      
      // Should not throw errors
      expect(() => {
        render(<GardenCalendar gardenCalendar={malformedCalendar} />);
      }).not.toThrow();
    });
  });
});