/**
 * Garden Log Service
 * Manages per-garden planting tracking, harvest logs, and garden state
 */

// Garden log data structure
export const createEmptyGardenLog = () => ({
  plantings: [],
  harvestLog: [],
  gardenNotes: [],
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString()
});

// Planting status options
export const PLANTING_STATUS = {
  PLANNED: 'planned',           // Added to plan but not yet planted
  PLANTED: 'planted',           // Seeds/transplants in ground
  GERMINATED: 'germinated',     // Sprouted/emerged  
  GROWING: 'growing',           // Actively developing
  FLOWERING: 'flowering',       // Producing flowers
  FRUITING: 'fruiting',         // Setting fruit/pods
  READY: 'ready',               // Ready to harvest
  HARVESTING: 'harvesting',     // Actively being harvested
  FINISHED: 'finished',         // Harvest complete, plant declining
  FAILED: 'failed'              // Didn't survive/establish
};

// Generate unique planting ID
export const generatePlantingId = () => {
  return `planting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Add new planting to garden log
export const addPlanting = (gardenLog, plantingData) => {
  const newPlanting = {
    id: generatePlantingId(),
    ...plantingData,
    status: plantingData.status || PLANTING_STATUS.PLANNED,
    addedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  return {
    ...gardenLog,
    plantings: [...gardenLog.plantings, newPlanting],
    lastUpdated: new Date().toISOString()
  };
};

// Update existing planting
export const updatePlanting = (gardenLog, plantingId, updates) => {
  const updatedPlantings = gardenLog.plantings.map(planting => 
    planting.id === plantingId 
      ? { ...planting, ...updates, lastUpdated: new Date().toISOString() }
      : planting
  );

  return {
    ...gardenLog,
    plantings: updatedPlantings,
    lastUpdated: new Date().toISOString()
  };
};

// Remove planting from garden log
export const removePlanting = (gardenLog, plantingId) => {
  const filteredPlantings = gardenLog.plantings.filter(
    planting => planting.id !== plantingId
  );

  return {
    ...gardenLog,
    plantings: filteredPlantings,
    lastUpdated: new Date().toISOString()
  };
};

// Get plantings by status
export const getPlantingsByStatus = (gardenLog, status) => {
  return gardenLog.plantings.filter(planting => planting.status === status);
};

// Get plantings by crop type
export const getPlantingsByCrop = (gardenLog, cropKey) => {
  return gardenLog.plantings.filter(planting => planting.crop === cropKey);
};

// Get active plantings (not finished or failed)
export const getActivePlantings = (gardenLog) => {
  const activeStatuses = [
    PLANTING_STATUS.PLANNED,
    PLANTING_STATUS.PLANTED,
    PLANTING_STATUS.GERMINATED,
    PLANTING_STATUS.GROWING,
    PLANTING_STATUS.FLOWERING,
    PLANTING_STATUS.FRUITING,
    PLANTING_STATUS.READY,
    PLANTING_STATUS.HARVESTING
  ];
  
  return gardenLog.plantings.filter(planting => 
    activeStatuses.includes(planting.status)
  );
};

// Calculate days since planting
export const getDaysSincePlanting = (planting) => {
  if (!planting.plantedDate) return null;
  
  const plantedDate = new Date(planting.plantedDate);
  const today = new Date();
  const diffTime = Math.abs(today - plantedDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Estimate harvest readiness based on actual planting date
export const estimateHarvestDate = (planting, cropData) => {
  if (!planting.plantedDate || !cropData) return null;
  
  const plantedDate = new Date(planting.plantedDate);
  const harvestDaysFromStart = (cropData.harvestStart || 2) * 30; // Convert months to days
  
  const estimatedHarvestDate = new Date(plantedDate);
  estimatedHarvestDate.setDate(estimatedHarvestDate.getDate() + harvestDaysFromStart);
  
  return estimatedHarvestDate;
};

// Check if planting is ready for harvest based on actual timing
export const isPlantingReadyForHarvest = (planting, cropData) => {
  const harvestDate = estimateHarvestDate(planting, cropData);
  if (!harvestDate) return false;
  
  const today = new Date();
  return today >= harvestDate;
};

// Add harvest entry
export const addHarvestEntry = (gardenLog, harvestData) => {
  const newHarvest = {
    id: `harvest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...harvestData,
    harvestedAt: harvestData.harvestedAt || new Date().toISOString()
  };

  return {
    ...gardenLog,
    harvestLog: [...gardenLog.harvestLog, newHarvest],
    lastUpdated: new Date().toISOString()
  };
};

// Get harvest history for a specific planting
export const getHarvestHistory = (gardenLog, plantingId) => {
  return gardenLog.harvestLog.filter(harvest => harvest.plantingId === plantingId);
};

// Add garden note
export const addGardenNote = (gardenLog, note) => {
  const newNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    content: note,
    createdAt: new Date().toISOString()
  };

  return {
    ...gardenLog,
    gardenNotes: [...gardenLog.gardenNotes, newNote],
    lastUpdated: new Date().toISOString()
  };
};

// Validate planting data
export const validatePlantingData = (plantingData) => {
  const errors = [];
  
  if (!plantingData.crop) {
    errors.push('Crop type is required');
  }
  
  if (!plantingData.plantedDate && plantingData.status !== PLANTING_STATUS.PLANNED) {
    errors.push('Planted date is required for non-planned plantings');
  }
  
  if (plantingData.plantedDate) {
    const plantedDate = new Date(plantingData.plantedDate);
    const today = new Date();
    if (plantedDate > today) {
      errors.push('Planted date cannot be in the future');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};