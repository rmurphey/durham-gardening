/**
 * Annual Seed Planning Service
 * Generates comprehensive yearly seed purchasing plans optimized for bulk buying
 */

import { GLOBAL_CROP_DATABASE } from '../config.js';

/**
 * Generate annual seed purchasing plan
 * @param {Object} portfolioStrategy - Selected portfolio strategy
 * @param {Object} gardenConfig - Garden configuration
 * @returns {Object} Comprehensive annual purchasing plan
 */
export const generateAnnualSeedPlan = (portfolioStrategy, gardenConfig) => {
  const plan = {
    seedOrders: [],
    infrastructure: [],
    supplies: [],
    totalBudget: 0,
    purchaseWindows: [],
    vendorGroups: {}
  };

  // Calculate garden size multiplier
  const gardenSizeMultiplier = (gardenConfig?.gardenSizeActual || 100) / 100;
  
  // Generate seed requirements for each crop category
  Object.entries(portfolioStrategy).forEach(([category, allocation]) => {
    if (allocation > 0) {
      generateCategorySeeds(category, allocation, gardenSizeMultiplier, plan);
    }
  });

  // Add infrastructure and supplies
  generateInfrastructureNeeds(gardenConfig, plan);
  generateSeasonalSupplies(gardenConfig, plan);
  
  // Organize by optimal purchase timing
  organizePurchaseWindows(plan);
  
  // Group by vendors for bulk ordering
  organizeByVendors(plan);
  
  return plan;
};

/**
 * Generate seed requirements for a crop category
 */
const generateCategorySeeds = (category, allocation, sizeMultiplier, plan) => {
  const categorySeeds = getCategorySeeds(category);
  
  categorySeeds.forEach(crop => {
    const seedRequirement = calculateSeedRequirements(crop, allocation, sizeMultiplier);
    plan.seedOrders.push(seedRequirement);
  });
};

/**
 * Get seeds for a specific category
 */
const getCategorySeeds = (category) => {
  const categoryMap = {
    heatSpecialists: ['okra', 'hot_peppers', 'amaranth', 'sweet_potato', 'malabar_spinach'],
    coolSeason: ['kale', 'lettuce', 'spinach', 'cabbage', 'carrots', 'arugula'],
    perennials: ['rosemary', 'thyme', 'oregano', 'mint'],
    experimental: ['new_varieties', 'trial_crops']
  };

  const cropKeys = categoryMap[category] || [];
  return cropKeys.map(key => GLOBAL_CROP_DATABASE[key]).filter(Boolean);
};

/**
 * Calculate total seed requirements including succession plantings
 */
const calculateSeedRequirements = (crop, allocation, sizeMultiplier) => {
  // Base quantity needed
  const baseQuantity = Math.ceil(allocation * sizeMultiplier * 20); // Base plants
  
  // Succession plantings (for crops that benefit from it)
  const successionCrops = ['lettuce', 'spinach', 'carrots', 'arugula'];
  const successionMultiplier = successionCrops.includes(crop.key) ? 3 : 1;
  
  const totalQuantity = baseQuantity * successionMultiplier;
  const estimatedCost = calculateSeedCost(crop, totalQuantity);
  
  return {
    id: `seed_${crop.key}`,
    crop: crop.name,
    variety: getRecommendedVariety(crop),
    category: 'Seeds',
    quantity: totalQuantity,
    successionPlantings: successionMultiplier,
    packetSize: getPacketSize(crop),
    packetsNeeded: Math.ceil(totalQuantity / getPacketSize(crop)),
    pricePerPacket: getSeedPrice(crop),
    totalCost: estimatedCost,
    vendor: getPreferredVendor(crop),
    plantingMonths: crop.plantingSeasons?.temperate || [],
    firstPlantingDate: getFirstPlantingDate(crop),
    notes: generateSeedNotes(crop, successionMultiplier),
    purchaseWindow: getSeedPurchaseWindow(crop),
    priority: getSeedPriority(crop)
  };
};

/**
 * Get recommended varieties for Durham climate
 */
const getRecommendedVariety = (crop) => {
  const durhamVarieties = {
    'okra': 'Clemson Spineless (heat-tolerant)',
    'hot_peppers': 'Serrano or Jalapeño (reliable in heat)',
    'kale': 'Red Russian (bolt-resistant)',
    'lettuce': 'Jericho or Nevada (heat-tolerant)',
    'spinach': 'Space or Tyee (slow-bolt)',
    'sweet_potato': 'Beauregard (short-season)',
    'amaranth': 'Red Callaloo (heat-loving)',
    'carrots': 'Paris Market (clay soil tolerant)',
    'cabbage': 'Early Jersey Wakefield (quick-maturing)'
  };
  
  return durhamVarieties[crop.key] || `Standard ${crop.name} variety`;
};

/**
 * Calculate optimal seed purchase windows
 */
const getSeedPurchaseWindow = (crop) => {
  const coolSeasonCrops = ['kale', 'lettuce', 'spinach', 'cabbage', 'carrots'];
  const heatCrops = ['okra', 'hot_peppers', 'amaranth', 'sweet_potato'];
  
  if (coolSeasonCrops.includes(crop.key)) {
    return {
      window: 'winter_order',
      timing: 'December - February',
      rationale: 'Order early for best selection of cool-season varieties'
    };
  }
  
  if (heatCrops.includes(crop.key)) {
    return {
      window: 'winter_order',
      timing: 'December - January', 
      rationale: 'Heat-adapted varieties have limited availability - order early'
    };
  }
  
  return {
    window: 'spring_order',
    timing: 'February - March',
    rationale: 'Standard timing for most garden seeds'
  };
};

/**
 * Generate infrastructure needs
 */
const generateInfrastructureNeeds = (gardenConfig, plan) => {
  const infrastructure = [
    {
      id: 'seed_starting_setup',
      item: 'Complete seed starting kit',
      description: 'Heat mats, trays, dome covers, grow lights',
      cost: 120,
      category: 'Infrastructure',
      purchaseWindow: 'winter_prep',
      timing: 'January - February',
      rationale: 'Set up before February seed starting',
      priority: 'high',
      vendor: 'Johnny\'s Seeds or True Leaf Market',
      oneTime: true
    },
    {
      id: 'irrigation_upgrade',
      item: 'Drip irrigation system',
      description: 'Timers, tubing, emitters for all beds',
      cost: 150,
      category: 'Infrastructure', 
      purchaseWindow: 'spring_prep',
      timing: 'March - April',
      rationale: 'Install before summer heat stress',
      priority: 'critical',
      vendor: 'DripWorks or local garden center',
      oneTime: true
    },
    {
      id: 'shade_protection',
      item: '30% shade cloth system',
      description: 'Shade cloth, posts, clips for heat protection',
      cost: 85,
      category: 'Infrastructure',
      purchaseWindow: 'spring_prep', 
      timing: 'April - May',
      rationale: 'Essential for Durham summer survival',
      priority: 'critical',
      vendor: 'Amazon or local farm supply',
      oneTime: true
    }
  ];
  
  plan.infrastructure.push(...infrastructure);
};

/**
 * Generate seasonal supply needs
 */
const generateSeasonalSupplies = (gardenConfig, plan) => {
  const supplies = [
    {
      id: 'spring_compost',
      item: 'Compost (bulk)',
      description: '10 bags or 2 cubic yards',
      cost: 60,
      category: 'Soil',
      purchaseWindow: 'spring_prep',
      timing: 'March',
      rationale: 'Annual soil building - buy in bulk for savings',
      priority: 'high',
      vendor: 'Local composting facility',
      annual: true
    },
    {
      id: 'mulch_bulk',
      item: 'Organic mulch (bulk)',
      description: 'Straw or shredded leaves, 3-4 inches deep',
      cost: 45,
      category: 'Mulch',
      purchaseWindow: 'spring_prep',
      timing: 'April',
      rationale: 'Essential for moisture retention and weed control',
      priority: 'high',
      vendor: 'Local farm or landscape supply',
      annual: true
    },
    {
      id: 'organic_fertilizer',
      item: 'Organic fertilizer blend',
      description: '50lb bag all-purpose organic fertilizer',
      cost: 35,
      category: 'Fertilizer',
      purchaseWindow: 'spring_prep',
      timing: 'March',
      rationale: 'Season-long feeding program',
      priority: 'medium',
      vendor: 'Local garden center',
      annual: true
    }
  ];
  
  plan.supplies.push(...supplies);
};

/**
 * Organize items by optimal purchase timing
 */
const organizePurchaseWindows = (plan) => {
  const windows = {
    winter_order: {
      name: 'Winter Seed Ordering',
      timing: 'December - February',
      description: 'Primary seed ordering season - best selection and pricing',
      items: [],
      totalCost: 0
    },
    winter_prep: {
      name: 'Winter Infrastructure Setup', 
      timing: 'January - February',
      description: 'Set up seed starting and indoor growing equipment',
      items: [],
      totalCost: 0
    },
    spring_prep: {
      name: 'Spring Infrastructure & Supplies',
      timing: 'March - April', 
      description: 'Irrigation, protection systems, soil amendments',
      items: [],
      totalCost: 0
    },
    summer_supplies: {
      name: 'Summer Support Supplies',
      timing: 'May - June',
      description: 'Heat protection, watering supplies, pest management',
      items: [],
      totalCost: 0
    }
  };
  
  // Categorize all items by purchase window
  [...plan.seedOrders, ...plan.infrastructure, ...plan.supplies].forEach(item => {
    const windowKey = item.purchaseWindow || 'spring_prep';
    if (windows[windowKey]) {
      windows[windowKey].items.push(item);
      windows[windowKey].totalCost += item.totalCost || item.cost;
    }
  });
  
  plan.purchaseWindows = Object.values(windows);
  plan.totalBudget = plan.purchaseWindows.reduce((sum, window) => sum + window.totalCost, 0);
};

/**
 * Organize items by vendor for bulk ordering
 */
const organizeByVendors = (plan) => {
  const vendors = {};
  
  [...plan.seedOrders, ...plan.infrastructure, ...plan.supplies].forEach(item => {
    const vendor = item.vendor || 'General Garden Supply';
    if (!vendors[vendor]) {
      vendors[vendor] = {
        name: vendor,
        items: [],
        totalCost: 0,
        shippingThreshold: getShippingThreshold(vendor),
        notes: getVendorNotes(vendor)
      };
    }
    
    vendors[vendor].items.push(item);
    vendors[vendor].totalCost += item.totalCost || item.cost;
  });
  
  plan.vendorGroups = vendors;
};

/**
 * Helper functions for seed calculations
 */
const getPacketSize = (crop) => {
  const standardSizes = {
    'lettuce': 1000,
    'carrots': 500, 
    'spinach': 300,
    'kale': 200,
    'okra': 50,
    'hot_peppers': 25
  };
  return standardSizes[crop.key] || 100;
};

const getSeedPrice = (crop) => {
  const standardPrices = {
    'lettuce': 3.50,
    'carrots': 4.00,
    'spinach': 3.75,
    'kale': 4.25,
    'okra': 5.50,
    'hot_peppers': 6.00,
    'herbs': 4.50
  };
  return standardPrices[crop.key] || 4.00;
};

const calculateSeedCost = (crop, quantity) => {
  const packetSize = getPacketSize(crop);
  const packetsNeeded = Math.ceil(quantity / packetSize);
  const pricePerPacket = getSeedPrice(crop);
  return packetsNeeded * pricePerPacket;
};

const getPreferredVendor = (crop) => {
  return 'True Leaf Market'; // User's preferred vendor per instructions
};

const getFirstPlantingDate = (crop) => {
  const plantingMonths = crop.plantingSeasons?.temperate || [];
  if (plantingMonths.length > 0) {
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[plantingMonths[0]]} 15`;
  }
  return 'Spring';
};

const generateSeedNotes = (crop, successionMultiplier) => {
  const notes = [];
  
  if (successionMultiplier > 1) {
    notes.push(`Plan ${successionMultiplier} succession plantings for continuous harvest`);
  }
  
  if (crop.key === 'lettuce' || crop.key === 'spinach') {
    notes.push('Choose bolt-resistant varieties for Durham heat');
  }
  
  if (crop.key === 'carrots') {
    notes.push('Short varieties work best in Durham clay soil');
  }
  
  return notes.join('. ');
};

const getSeedPriority = (crop) => {
  const highPriority = ['kale', 'lettuce', 'hot_peppers', 'okra'];
  return highPriority.includes(crop.key) ? 'high' : 'medium';
};

const getShippingThreshold = (vendor) => {
  const thresholds = {
    'True Leaf Market': 50,
    'Johnny\'s Seeds': 75,
    'Amazon': 35
  };
  return thresholds[vendor] || 50;
};

const getVendorNotes = (vendor) => {
  const notes = {
    'True Leaf Market': 'User preferred vendor - good selection, reliable germination',
    'Johnny\'s Seeds': 'Professional grade seeds, excellent for heat-tolerant varieties',
    'Local garden center': 'Good for bulk supplies, support local business'
  };
  return notes[vendor] || 'Reliable garden supplier';
};