/**
 * PlantThisButton Component
 * Simple button to add a crop recommendation to garden log
 */

import React, { useState } from 'react';
import AddPlantingForm from './AddPlantingForm.js';

function PlantThisButton({ cropKey, cropName, onAddPlanting }) {
  const [showForm, setShowForm] = useState(false);

  const handlePlantClick = () => {
    setShowForm(true);
  };

  const handleAddPlanting = (plantingData) => {
    onAddPlanting(plantingData);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  if (showForm) {
    return (
      <AddPlantingForm 
        cropKey={cropKey}
        onAddPlanting={handleAddPlanting}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <button 
      className="plant-this-btn"
      onClick={handlePlantClick}
      title={`Add ${cropName} to your garden log`}
    >
      🌱 Plant This
    </button>
  );
}

export default PlantThisButton;