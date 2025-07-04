/**
 * Navigation Component
 * Main app navigation with focus on actionability
 */

import React from 'react';

const Navigation = ({ 
  activeView, 
  onViewChange, 
  hasShoppingItems, 
  hasTasks,
  isReadOnly = false 
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🎯',
      description: 'Garden planning & simulation',
      badge: hasTasks ? 'new' : null
    },
    {
      id: 'shopping',
      label: 'Shopping',
      icon: '🛒',
      description: isReadOnly ? 'View shopping plan' : 'Purchase planning',
      badge: hasShoppingItems ? hasShoppingItems : null,
      disabled: isReadOnly && !hasShoppingItems
    }
  ];

  return (
    <nav className="main-navigation">      
      <div className="nav-items">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
            onClick={() => !item.disabled && onViewChange(item.id)}
            title={`${item.label} - ${item.description}`}
            disabled={item.disabled}
          >
            <div className="nav-icon">{item.icon}</div>
            <div className="nav-label">{item.label}</div>
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