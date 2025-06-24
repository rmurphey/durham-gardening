/**
 * Card Demo Component
 * Demonstrates the different card types and states
 */

import React, { useState } from 'react';
import PurchaseCard from './PurchaseCard';
import TaskCard from './TaskCard';
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
    
    // Task Cards
    {
      component: TaskCard,
      props: {
        id: 'task-1',
        title: 'Start Tomato Seeds Indoors',
        action: 'Sow Cherokee Purple and Early Girl tomato seeds in seed starting mix',
        timing: 'March 15-30, 6-8 weeks before last frost',
        location: '3×15 Bed',
        tools: ['Seed starting trays', 'Heat mat', 'Grow lights'],
        daysUntilDeadline: 5,
        consequences: 'Late start = shorter growing season',
        urgency: 'urgent',
        category: 'Indoor Starting',
        state: getCardState('task-1'),
        onStateChange: handleStateChange
      }
    },
    {
      component: TaskCard,
      props: {
        id: 'task-2',
        title: 'Prepare Garden Beds',
        action: 'Add compost and work soil when dry enough',
        timing: 'When soil crumbles in hand, not muddy',
        location: 'All beds',
        tools: ['Shovel', 'Rake', 'Compost'],
        daysUntilDeadline: 14,
        urgency: 'medium',
        category: 'Soil Prep',
        state: getCardState('task-2'),
        onStateChange: handleStateChange
      }
    },
    
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