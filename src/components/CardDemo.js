/**
 * Card Demo Component
 * Demonstrates the different card types and states
 */

import React, { useState } from 'react';
import PurchaseCard from './PurchaseCard';
// TaskCard component removed - no longer exists
import PlanningCard from './PlanningCard';
import Card from './Card';

const CardDemo = () => {
  const [cardStates, setCardStates] = useState({});
  
  const handleStateChange = (cardId, newState, data) => {
    setCardStates(prev => ({
      ...prev,
      [cardId]: newState
    }));
  };
  
  const getCardState = (cardId) => cardStates[cardId] || 'pending';
  
  const sampleCards = [
    // Purchase Cards
    {
      component: PurchaseCard,
      props: {
        id: 'purchase-1',
        item: 'Cherokee Purple Tomato Seeds',
        price: 4.95,
        vendor: 'True Leaf Market',
        why: 'Heat-tolerant heirloom variety perfect for Durham summers',
        plantingDate: 'Indoor start: March 15-30',
        consequences: 'Miss this window = no tomatoes until next year',
        urgency: 'urgent',
        state: getCardState('purchase-1'),
        onStateChange: handleStateChange
      }
    },
    {
      component: PurchaseCard,
      props: {
        id: 'purchase-2',
        item: '30% Shade Cloth',
        price: 24.99,
        vendor: 'Amazon',
        why: 'Essential protection for Durham heat waves',
        urgency: 'high',
        state: getCardState('purchase-2'),
        onStateChange: handleStateChange
      }
    },
    
    // Task Cards - Removed as TaskCard component no longer exists
    
    // Planning Cards
    {
      component: PlanningCard,
      props: {
        id: 'planning-1',
        title: 'Summer Heat Strategy',
        decision: 'Choose protection method for summer crops',
        options: [
          {
            label: 'Shade Cloth Only',
            description: 'Install 30% shade cloth over beds',
            value: 'shade_cloth'
          },
          {
            label: 'Container Strategy',
            description: 'Move heat-sensitive crops to mobile containers',
            value: 'containers'
          },
          {
            label: 'Hybrid Approach',
            description: 'Combination of shade cloth and container mobility',
            value: 'hybrid'
          }
        ],
        recommendation: 'Hybrid approach offers maximum flexibility',
        impact: 'Determines summer success rate and maintenance needs',
        timing: 'Decide by April 1st',
        urgency: 'high',
        category: 'Heat Strategy',
        state: getCardState('planning-1'),
        onStateChange: handleStateChange
      }
    },
    {
      component: PlanningCard,
      props: {
        id: 'planning-2',
        title: 'Fall Bed Rotation',
        decision: 'Plan crop rotation for fall planting',
        recommendation: 'Move tomato family to 4×8 bed, brassicas to 3×15 bed',
        impact: 'Prevents soil nutrient depletion and disease buildup',
        timing: 'Plan by August for fall transition',
        urgency: 'medium',
        category: 'Bed Rotation',
        state: getCardState('planning-2'),
        onStateChange: handleStateChange
      }
    },
    
    // Info Card
    {
      component: Card,
      props: {
        id: 'info-1',
        type: 'info',
        title: 'Durham Clay Soil Tip',
        description: 'Never work clay soil when wet - it will compact and harm plant roots',
        expandedContent: (
          <div>
            <p>Durham's clay soil is challenging but manageable:</p>
            <ul>
              <li>Test soil moisture by squeezing - it should crumble, not form a ball</li>
              <li>Add organic matter annually to improve drainage</li>
              <li>Consider raised beds for better drainage</li>
              <li>Work soil only when proper moisture level</li>
            </ul>
          </div>
        ),
        icon: '🏡',
        category: 'Soil Management',
        urgency: 'low',
        state: getCardState('info-1'),
        onStateChange: handleStateChange
      }
    }
  ];
  
  return (
    <div className="card-demo">
      <div className="demo-header">
        <h2>🃏 Card System Demo</h2>
        <p>Different card types with various states and priorities</p>
      </div>
      
      <div className="demo-grid">
        {sampleCards.map((cardConfig, index) => {
          const Component = cardConfig.component;
          return (
            <Component
              key={cardConfig.props.id}
              {...cardConfig.props}
            />
          );
        })}
      </div>
      
      <div className="demo-state-display">
        <h3>Card States:</h3>
        <pre>{JSON.stringify(cardStates, null, 2)}</pre>
      </div>
    </div>
  );
};

export default CardDemo;