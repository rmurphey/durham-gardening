/**
 * Navigation Component
 * Main app navigation with focus on actionability
 */

import React from 'react';

const Navigation = ({ activeView, onViewChange, hasShoppingItems, hasTasks }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🎯',
      description: 'Today\'s priorities'
    },
    {
      id: 'tasks',
      label: 'Garden Tasks',
      icon: '📋',
      description: 'Time-sensitive actions',
      badge: hasTasks ? 'new' : null
    },
    {
      id: 'shopping',
      label: 'Shopping',
      icon: '🛒',
      description: 'Purchase planning',
      badge: hasShoppingItems ? hasShoppingItems : null
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: '📅',
      description: 'Planting timeline'
    },
    {
      id: 'results',
      label: 'Analysis',
      icon: '📊',
      description: 'Simulation results'
    },
    {
      id: 'config',
      label: 'Setup',
      icon: '⚙️',
      description: 'Garden configuration'
    }
  ];

  return (
    <nav className="main-navigation">
      <div className="nav-header">
        <h1 className="app-title">Durham Garden</h1>
        <p className="app-subtitle">Climate-aware planning</p>
      </div>
      
      <div className="nav-items">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <div className="nav-icon">{item.icon}</div>
            <div className="nav-content">
              <div className="nav-label">{item.label}</div>
              <div className="nav-description">{item.description}</div>
            </div>
            {item.badge && (
              <div className={`nav-badge ${typeof item.badge === 'string' ? item.badge : 'count'}`}>
                {typeof item.badge === 'number' ? item.badge : ''}
              </div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;