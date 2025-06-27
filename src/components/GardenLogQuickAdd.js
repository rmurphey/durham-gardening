/**
 * GardenLogQuickAdd Component
 * Simple interface to quickly add plantings from recommendations
 */

import React, { useState } from 'react';
import { useGardenAppState } from './GardenStateProvider.js';

function GardenLogQuickAdd({ cropKey, cropName, className = '' }) {
  const { handleAddPlanting, gardenLog } = useGardenAppState();
  const [isAdding, setIsAdding] = useState(false);

  // Check if this crop is already planted
  const alreadyPlanted = gardenLog.plantings.some(p => p.crop === cropKey);

  if (alreadyPlanted) {
    return (
      <span className={`planted-indicator ${className}`} title="Already in your garden">
        🌱 Planted
      </span>
    );
  }

  const handleQuickAdd = () => {
    const plantingData = {
      crop: cropKey,
      variety: '',
      plantedDate: new Date().toISOString().split('T')[0],
      quantity: '',
      location: '',
      notes: 'Added from recommendation',
      status: 'planted'
    };

    handleAddPlanting(plantingData);
    setIsAdding(true);
    
    // Reset button state after brief feedback
    setTimeout(() => setIsAdding(false), 1500);
  };

  if (isAdding) {
    return (
      <span className={`adding-feedback ${className}`}>
        ✅ Added to garden!
      </span>
    );
  }

  return (
    <button 
      className={`quick-add-btn ${className}`}
      onClick={handleQuickAdd}
      title={`Add ${cropName} to your garden log`}
    >
      ➕ Plant This
    </button>
  );
}

export default GardenLogQuickAdd;