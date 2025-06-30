/**
 * Navigation Component Tests
 * Tests URL-aware navigation with React Router integration
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navigation from '../Navigation';

describe('Navigation Component', () => {
  const defaultProps = {
    hasShoppingItems: 0,
    hasTasks: false
  };

  const renderWithRouter = (initialEntries = ['/'], props = {}) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Navigation {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  describe('Rendering', () => {
    test('renders without crashing', () => {
      expect(() => {
        renderWithRouter();
      }).not.toThrow();
    });

    test('displays app title and subtitle', () => {
      renderWithRouter();
      
      expect(screen.getByText('Durham Garden')).toBeInTheDocument();
      expect(screen.getByText('Climate-aware planning')).toBeInTheDocument();
    });

    test('renders all navigation items', () => {
      renderWithRouter();
      
      const expectedItems = [
        'Dashboard',
        'Garden Tasks', 
        'Shopping',
        'Calendar',
        'Analysis',
        'Setup'
      ];
      
      expectedItems.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    test('all nav items are links with correct href attributes', () => {
      renderWithRouter();
      
      const expectedLinks = [
        { text: 'Dashboard', href: '/' },
        { text: 'Garden Tasks', href: '/tasks' },
        { text: 'Shopping', href: '/shopping' },
        { text: 'Calendar', href: '/calendar' },
        { text: 'Analysis', href: '/analysis' },
        { text: 'Setup', href: '/config' }
      ];
      
      expectedLinks.forEach(({ text, href }) => {
        const link = screen.getByRole('link', { name: new RegExp(text) });
        expect(link).toHaveAttribute('href', href);
      });
    });

    test('nav items have proper icons', () => {
      renderWithRouter();
      
      const expectedIcons = [
        '🎯', // Dashboard
        '📋', // Garden Tasks
        '🛒', // Shopping
        '📅', // Calendar
        '📊', // Analysis
        '⚙️'  // Setup
      ];
      
      expectedIcons.forEach(icon => {
        expect(screen.getByText(icon)).toBeInTheDocument();
      });
    });

    test('nav items have descriptive titles', () => {
      renderWithRouter();
      
      expect(screen.getByRole('link', { name: /Dashboard.*Today's priorities/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Garden Tasks.*Time-sensitive actions/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Shopping.*Purchase planning/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Calendar.*Planting timeline/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Analysis.*Simulation results/ })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Setup.*Garden configuration/ })).toBeInTheDocument();
    });
  });

  describe('Active State Detection', () => {
    test('dashboard is active at root path', () => {
      renderWithRouter(['/']);
      
      const dashboardLink = screen.getByRole('link', { name: /Dashboard/ });
      expect(dashboardLink).toHaveClass('active');
    });

    test('tasks is active at /tasks path', () => {
      renderWithRouter(['/tasks']);
      
      const tasksLink = screen.getByRole('link', { name: /Garden Tasks/ });
      expect(tasksLink).toHaveClass('active');
    });

    test('shopping is active at /shopping path', () => {
      renderWithRouter(['/shopping']);
      
      const shoppingLink = screen.getByRole('link', { name: /Shopping/ });
      expect(shoppingLink).toHaveClass('active');
    });

    test('calendar is active at /calendar path', () => {
      renderWithRouter(['/calendar']);
      
      const calendarLink = screen.getByRole('link', { name: /Calendar/ });
      expect(calendarLink).toHaveClass('active');
    });

    test('analysis is active at /analysis path', () => {
      renderWithRouter(['/analysis']);
      
      const analysisLink = screen.getByRole('link', { name: /Analysis/ });
      expect(analysisLink).toHaveClass('active');
    });

    test('config is active at /config path', () => {
      renderWithRouter(['/config']);
      
      const configLink = screen.getByRole('link', { name: /Setup/ });
      expect(configLink).toHaveClass('active');
    });

    test('only one nav item is active at a time', () => {
      renderWithRouter(['/tasks']);
      
      const allLinks = screen.getAllByRole('link');
      const activeLinks = allLinks.filter(link => link.classList.contains('active'));
      
      expect(activeLinks).toHaveLength(1);
      expect(activeLinks[0]).toHaveAttribute('href', '/tasks');
    });

    test('no nav items are active for unknown paths', () => {
      renderWithRouter(['/unknown-route']);
      
      const allLinks = screen.getAllByRole('link');
      const activeLinks = allLinks.filter(link => link.classList.contains('active'));
      
      expect(activeLinks).toHaveLength(0);
    });
  });

  describe('Badge Display', () => {
    test('shows shopping badge when hasShoppingItems is provided', () => {
      renderWithRouter(['/'], { hasShoppingItems: 5 });
      
      const shoppingLink = screen.getByRole('link', { name: /Shopping/ });
      const badge = within(shoppingLink).getByText('5');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('count');
    });

    test('shows tasks badge when hasTasks is true', () => {
      renderWithRouter(['/'], { hasTasks: true });
      
      const tasksLink = screen.getByRole('link', { name: /Garden Tasks/ });
      const badge = within(tasksLink).getByRole('status');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('new');
      expect(badge).toHaveTextContent('');
    });

    test('does not show shopping badge when hasShoppingItems is 0', () => {
      renderWithRouter(['/'], { hasShoppingItems: 0 });
      
      const shoppingLink = screen.getByRole('link', { name: /Shopping/ });
      
      expect(within(shoppingLink).queryByRole('status')).not.toBeInTheDocument();
    });

    test('does not show tasks badge when hasTasks is false', () => {
      renderWithRouter(['/'], { hasTasks: false });
      
      const tasksLink = screen.getByRole('link', { name: /Garden Tasks/ });
      
      expect(within(tasksLink).queryByRole('status')).not.toBeInTheDocument();
    });

    test('shows both badges when both conditions are met', () => {
      renderWithRouter(['/'], { hasShoppingItems: 3, hasTasks: true });
      
      const shoppingLink = screen.getByRole('link', { name: /Shopping/ });
      const shoppingBadge = within(shoppingLink).getByText('3');
      
      const tasksLink = screen.getByRole('link', { name: /Garden Tasks/ });
      const tasksBadge = within(tasksLink).getByRole('status');
      
      expect(shoppingBadge).toBeInTheDocument();
      expect(shoppingBadge).toHaveClass('count');
      
      expect(tasksBadge).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    test('nav items have correct CSS classes', () => {
      renderWithRouter(['/tasks']);
      
      const allLinks = screen.getAllByRole('link');
      
      allLinks.forEach(link => {
        expect(link).toHaveClass('nav-item');
      });
    });

    test('active nav item has active class', () => {
      renderWithRouter(['/shopping']);
      
      const shoppingLink = screen.getByRole('link', { name: /Shopping/ });
      expect(shoppingLink).toHaveClass('nav-item', 'active');
    });

    test('inactive nav items do not have active class', () => {
      renderWithRouter(['/shopping']);
      
      const dashboardLink = screen.getByRole('link', { name: /Dashboard/ });
      const tasksLink = screen.getByRole('link', { name: /Garden Tasks/ });
      
      expect(dashboardLink).toHaveClass('nav-item');
      expect(dashboardLink).not.toHaveClass('active');
      
      expect(tasksLink).toHaveClass('nav-item');
      expect(tasksLink).not.toHaveClass('active');
    });

    test('nav structure has correct CSS classes', () => {
      renderWithRouter();
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('main-navigation');
      
      expect(within(nav).getByRole('list')).toBeInTheDocument(); // nav-items
      expect(within(nav).getByRole('banner')).toBeInTheDocument(); // nav-header
    });
  });

  describe('Accessibility', () => {
    test('nav element has navigation role', () => {
      renderWithRouter();
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    test('all nav items are accessible as links', () => {
      renderWithRouter();
      
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(6); // Dashboard, Tasks, Shopping, Calendar, Analysis, Setup
      
      links.forEach(link => {
        expect(link).toBeVisible();
        expect(link).toHaveAttribute('href');
      });
    });

    test('nav items have descriptive titles for screen readers', () => {
      renderWithRouter();
      
      const dashboardLink = screen.getByRole('link', { name: /Dashboard.*Today's priorities/ });
      expect(dashboardLink).toHaveAttribute('title', "Dashboard - Today's priorities");
      
      const tasksLink = screen.getByRole('link', { name: /Garden Tasks.*Time-sensitive actions/ });
      expect(tasksLink).toHaveAttribute('title', 'Garden Tasks - Time-sensitive actions');
    });

    test('nav items are keyboard navigable', () => {
      renderWithRouter();
      
      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Props Handling', () => {
    test('handles missing props gracefully', () => {
      expect(() => {
        render(
          <MemoryRouter>
            <Navigation />
          </MemoryRouter>
        );
      }).not.toThrow();
    });

    test('handles undefined hasShoppingItems', () => {
      renderWithRouter(['/'], { hasShoppingItems: undefined });
      
      const shoppingLink = screen.getByRole('link', { name: /Shopping/ });
      
      expect(within(shoppingLink).queryByRole('status')).not.toBeInTheDocument();
    });

    test('handles undefined hasTasks', () => {
      renderWithRouter(['/'], { hasTasks: undefined });
      
      const tasksLink = screen.getByRole('link', { name: /Garden Tasks/ });
      
      expect(within(tasksLink).queryByRole('status')).not.toBeInTheDocument();
    });

    test('handles different badge number types', () => {
      renderWithRouter(['/'], { hasShoppingItems: '7' });
      
      const shoppingLink = screen.getByRole('link', { name: /Shopping/ });
      const badge = within(shoppingLink).getByText('7');
      
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('count');
    });
  });

  describe('Router Integration', () => {
    test('works with different initial routes', () => {
      const routes = ['/', '/tasks', '/shopping', '/calendar', '/analysis', '/config'];
      
      routes.forEach(route => {
        const { unmount } = renderWithRouter([route]);
        
        // Should render without errors
        expect(screen.getByText('Durham Garden')).toBeInTheDocument();
        
        unmount();
      });
    });

    test('updates active state when route changes', () => {
      const { rerender } = renderWithRouter(['/']);
      
      // Initially dashboard should be active
      expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveClass('active');
      
      // Change route to tasks
      rerender(
        <MemoryRouter initialEntries={['/tasks']}>
          <Navigation {...defaultProps} />
        </MemoryRouter>
      );
      
      // Now tasks should be active
      expect(screen.getByRole('link', { name: /Garden Tasks/ })).toHaveClass('active');
      expect(screen.getByRole('link', { name: /Dashboard/ })).not.toHaveClass('active');
    });
  });
});