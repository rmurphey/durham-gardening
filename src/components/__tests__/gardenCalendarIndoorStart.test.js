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

    test('should render indoor start activities with meaningful content', () => {
      render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Test that user-visible indoor starting activities are displayed
      expect(screen.getByText(/Start Cherokee Purple.*tomato seeds indoors/)).toBeInTheDocument();
      expect(screen.getByText(/Start Fish Pepper.*seeds indoors/)).toBeInTheDocument();
      
      // Verify activity icons are present (🌱 seedling icon for indoor starting)
      expect(screen.getAllByText('🌱').length).toBeGreaterThan(0);
    });
  });

  describe('Activity Type Identification', () => {
    test('displays indoor-starting activities with proper categorization', () => {
      render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Test that indoor starting activities are properly identified by their content
      // Instead of CSS classes, test the user-visible distinctions
      expect(screen.getByText(/Start.*tomato seeds indoors/)).toBeInTheDocument();
      expect(screen.getByText(/Start.*seeds indoors/)).toBeInTheDocument();
      
      // Activities should show indoor starting timing indicators
      expect(screen.getByText(/8-10 weeks before last frost/)).toBeInTheDocument();
      expect(screen.getByText(/10-12 weeks before last frost/)).toBeInTheDocument();
    });

    test('displays seed-starting activities separately from direct sowing', () => {
      render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Test specific seed-starting content instead of CSS classes
      expect(screen.getByText(/Start Japanese Long eggplant seeds indoors/)).toBeInTheDocument();
      expect(screen.getByText('Eggplant')).toBeInTheDocument();
      
      // Should display proper timing for eggplant starting
      expect(screen.getByText(/8-10 weeks before last frost/)).toBeInTheDocument();
    });

    test('displays priority indicators for critical activities', () => {
      render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Test user-visible priority indicators instead of CSS classes
      // Critical priority activities should show "URGENT" text
      expect(screen.getByText('URGENT')).toBeInTheDocument();
      
      // Should display activities with different priorities
      // High priority: Tomatoes and Eggplant (2 activities)  
      // Critical priority: Hot Peppers (1 activity)
      // Medium priority: Basil (1 activity)
      expect(screen.getByText(/Start Fish Pepper.*seeds/)).toBeInTheDocument(); // Critical priority
      expect(screen.getByText(/Start Cherokee Purple.*tomato/)).toBeInTheDocument(); // High priority
    });

    test('properly categorizes indoor starting activities by priority level', () => {
      render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Test that high priority indoor starting shows with correct content
      expect(screen.getByText(/Start Cherokee Purple.*tomato seeds indoors/)).toBeInTheDocument();
      expect(screen.getByText(/8-10 weeks before last frost \(April 15\)/)).toBeInTheDocument();
      
      // Test that critical priority indoor starting shows URGENT indicator
      expect(screen.getByText(/Start Fish Pepper.*seeds indoors/)).toBeInTheDocument();
      expect(screen.getByText('URGENT')).toBeInTheDocument();
    });
  });

  describe('Priority Indicators', () => {
    test('should display priority badges for indoor start activities', () => {
      render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
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
    test('displays activity information with crop names and priorities', () => {
      render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Test that crop names are displayed (which would be in activity headers)
      expect(screen.getByText('Tomatoes')).toBeInTheDocument();
      expect(screen.getByText('Hot Peppers')).toBeInTheDocument();
      expect(screen.getByText('Basil')).toBeInTheDocument();
      expect(screen.getByText('Eggplant')).toBeInTheDocument();
      
      // Test that priority indicators are displayed
      expect(screen.getByText('URGENT')).toBeInTheDocument(); // Critical priority indicator
      
      // Test that activity icons are shown
      expect(screen.getAllByText('🌱')).toHaveLength(4); // All indoor/seed starting activities
    });

    test('displays activity actions and timing information', () => {
      render(<GardenCalendar gardenCalendar={mockIndoorStartCalendar} />);
      
      // Test specific action text is displayed
      expect(screen.getByText(/Start Cherokee Purple.*tomato seeds indoors/)).toBeInTheDocument();
      expect(screen.getByText(/Start Fish Pepper.*seeds indoors/)).toBeInTheDocument();
      
      // Test specific timing information is displayed
      expect(screen.getByText(/8-10 weeks before last frost \(April 15\)/)).toBeInTheDocument();
      expect(screen.getByText(/10-12 weeks before last frost/)).toBeInTheDocument();
      expect(screen.getByText(/4-6 weeks before last frost/)).toBeInTheDocument();
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
      
      render(<GardenCalendar gardenCalendar={mixedCalendar} />);
      
      // Should have different activity types
      expect(screen.getByText(/start.*seeds.*indoors/i)).toBeInTheDocument(); // indoor-starting activity
      expect(screen.getByText(/shopping/i)).toBeInTheDocument(); // shopping activity  
      expect(screen.getByText(/maintenance/i)).toBeInTheDocument(); // maintenance activity
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
      
      render(<GardenCalendar gardenCalendar={mixedCalendar} />);
      
      // Check for specific activity types by content
      expect(screen.getByText(/start.*seeds.*indoors/i)).toBeInTheDocument(); // indoor-starting
      expect(screen.getByText(/direct.*sow/i)).toBeInTheDocument(); // direct-sow
      
      // Different activity types should be visually distinct (classes tested separately)
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