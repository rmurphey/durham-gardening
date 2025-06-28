/**
 * Annual Seed Planning Service
 * Generates comprehensive yearly seed purchasing plans optimized for bulk buying
 * Now pulls data from SQLite database instead of hardcoded JS data
 */

import { cropDataService } from './cropDataService.js';

// Database service for seed ordering information
class SeedOrderingDatabaseService {
  constructor() {
    this.dbPath = '/database/plant_varieties.db';
  }

  /**
   * Get seed ordering details for a region from database
   * In a real app, this would use a proper SQLite client
   * For now, we'll simulate database queries with the enhanced structure
   */
  async getSeedOrderingDetails(regionCode = 'US') {
    // TODO: Replace with actual SQLite queries when implementing database client
    // For now, return simulated database response structure
    return this.getSimulatedDatabaseResponse(regionCode);
  }

  /**
   * Simulate database response structure
   * This represents what we'd get from the seed_ordering_details view
   */
  getSimulatedDatabaseResponse(regionCode) {
    return {
      'okra': {
        plant_key: 'okra',
        common_name: 'Okra',
        category_key: 'heatTolerant',
        vendor_name: 'True Leaf Market',
        vendor_key: 'true_leaf_market',
        website_url: 'https://www.trueleafmarket.com',
        shipping_threshold: 50.00,
        sku: 'OKR-CLE-1000',
        variety_name: 'Clemson Spineless Okra',
        packet_size: '1000 seeds',
        seed_count: 1000,
        price: 4.95,
        product_url: 'https://www.trueleafmarket.com/products/okra-clemson-spineless',
        is_organic: false,
        is_heirloom: true,
        heat_tolerance_rating: 5,
        packet_plants_sqft: 25,
        order_timing: 'January (for May planting)',
        planting_instructions: 'Direct sow after soil temps reach 65°F (mid-May Durham)',
        succession_plantings: 1,
        packets_needed_per_100sqft: 2,
        special_notes: 'Heat-loving, extremely reliable in Durham summers. Order early for best selection.'
      },
      'peppers': {
        plant_key: 'peppers',
        common_name: 'Hot Peppers',
        category_key: 'heatTolerant',
        vendor_name: 'Johnny\'s Seeds',
        vendor_key: 'johnnys_seeds',
        website_url: 'https://www.johnnyseeds.com',
        shipping_threshold: 50.00,
        sku: 'PEP-SER-100',
        variety_name: 'Serrano Pepper',
        packet_size: '100 seeds',
        seed_count: 100,
        price: 4.25,
        product_url: 'https://www.johnnyseeds.com/vegetables/peppers/hot-peppers/serrano-pepper',
        is_organic: false,
        is_heirloom: false,
        heat_tolerance_rating: 5,
        packet_plants_sqft: 15,
        order_timing: 'December-January (for February indoor start)',
        planting_instructions: 'Start indoors 8-10 weeks before last frost (mid-February). Transplant mid-May.',
        succession_plantings: 1,
        packets_needed_per_100sqft: 1,
        special_notes: 'Consistent producer in heat. Order by January for seed starting supplies.'
      },
      'kale': {
        plant_key: 'kale',
        common_name: 'Kale',
        category_key: 'coolSeason',
        vendor_name: 'True Leaf Market',
        vendor_key: 'true_leaf_market',
        website_url: 'https://www.trueleafmarket.com',
        shipping_threshold: 50.00,
        sku: 'KAL-RED-500',
        variety_name: 'Red Russian Kale',
        packet_size: '500 seeds',
        seed_count: 500,
        price: 3.95,
        product_url: 'https://www.trueleafmarket.com/products/kale-red-russian',
        is_organic: false,
        is_heirloom: true,
        heat_tolerance_rating: 3,
        packet_plants_sqft: 20,
        order_timing: 'January (for succession plantings March-September)',
        planting_instructions: 'Direct sow March 15, then every 3 weeks through September',
        succession_plantings: 4,
        packets_needed_per_100sqft: 2,
        special_notes: 'Most bolt-resistant kale for Durham. Plan 4-5 succession plantings.'
      },
      'lettuce': {
        plant_key: 'lettuce',
        common_name: 'Lettuce',
        category_key: 'coolSeason',
        vendor_name: 'Johnny\'s Seeds',
        vendor_key: 'johnnys_seeds',
        website_url: 'https://www.johnnyseeds.com',
        shipping_threshold: 50.00,
        sku: 'LET-JER-1000',
        variety_name: 'Jericho Lettuce (Romaine)',
        packet_size: '1000 seeds',
        seed_count: 1000,
        price: 5.50,
        product_url: 'https://www.johnnyseeds.com/vegetables/lettuce/romaine-lettuce/jericho-lettuce',
        is_organic: false,
        is_heirloom: false,
        heat_tolerance_rating: 4,
        packet_plants_sqft: 30,
        order_timing: 'January (for March-October succession)',
        planting_instructions: 'Start March 1, succession plant every 2 weeks through April, resume August-October',
        succession_plantings: 6,
        packets_needed_per_100sqft: 3,
        special_notes: 'Heat-tolerant romaine. Essential for Durham climate. Order 2-3 packets for succession.'
      },
      'spinach': {
        plant_key: 'spinach',
        common_name: 'Spinach',
        category_key: 'coolSeason',
        vendor_name: 'Johnny\'s Seeds',
        vendor_key: 'johnnys_seeds',
        website_url: 'https://www.johnnyseeds.com',
        shipping_threshold: 50.00,
        sku: 'SPI-SPA-250',
        variety_name: 'Space Spinach F1',
        packet_size: '250 seeds',
        seed_count: 250,
        price: 6.95,
        product_url: 'https://www.johnnyseeds.com/vegetables/spinach/space-spinach',
        is_organic: false,
        is_heirloom: false,
        heat_tolerance_rating: 3,
        packet_plants_sqft: 25,
        order_timing: 'January (for March and September plantings)',
        planting_instructions: 'Direct sow March 1-15, then September 1-30 for fall/winter harvest',
        succession_plantings: 2,
        packets_needed_per_100sqft: 2,
        special_notes: 'Slow-bolt F1 hybrid. Only spinach that works reliably in Durham spring.'
      },
      'carrots': {
        plant_key: 'carrots',
        common_name: 'Carrots',
        category_key: 'coolSeason',
        vendor_name: 'Baker Creek Heirloom Seeds',
        vendor_key: 'baker_creek',
        website_url: 'https://www.rareseeds.com',
        shipping_threshold: 75.00,
        sku: 'CAR-PAR-500',
        variety_name: 'Paris Market Carrot',
        packet_size: '500 seeds',
        seed_count: 500,
        price: 3.25,
        product_url: 'https://www.rareseeds.com/carrot-paris-market',
        is_organic: false,
        is_heirloom: true,
        heat_tolerance_rating: 2,
        packet_plants_sqft: 35,
        order_timing: 'January (for March-September succession)',
        planting_instructions: 'Direct sow every 3 weeks March through August. Short round variety perfect for clay soil.',
        succession_plantings: 5,
        packets_needed_per_100sqft: 2,
        special_notes: 'Round carrots work better in Durham clay. Succession plant for continuous harvest.'
      }
    };
  }
}

// Initialize database service
const seedOrderingDB = new SeedOrderingDatabaseService();

/**
 * Generate annual seed purchasing plan
 * @param {Object} portfolioStrategy - Selected portfolio strategy
 * @param {Object} gardenConfig - Garden configuration
 * @returns {Object} Comprehensive annual purchasing plan
 */
export const generateAnnualSeedPlan = async (portfolioStrategy, gardenConfig) => {
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
  
  // Generate seed requirements for each crop category (now async)
  for (const [category, allocation] of Object.entries(portfolioStrategy)) {
    if (allocation > 0) {
      await generateCategorySeeds(category, allocation, gardenSizeMultiplier, plan);
    }
  }

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
 * Generate seed requirements for a crop category (now async for database queries)
 */
const generateCategorySeeds = async (category, allocation, sizeMultiplier, plan) => {
  const categorySeeds = await getCategorySeeds(category);
  
  for (const crop of categorySeeds) {
    const seedRequirement = await calculateSeedRequirements(crop, allocation, sizeMultiplier);
    plan.seedOrders.push(seedRequirement);
  }
};

/**
 * Get seeds for a specific category
 */
const getCategorySeeds = async (category) => {
  const categoryMap = {
    heatSpecialists: 'heatTolerant',
    coolSeason: 'coolSeason', 
    perennials: 'perennials',
    experimental: 'experimental'
  };

  const databaseCategory = categoryMap[category];
  if (!databaseCategory) {
    return [];
  }

  try {
    // Get crops from database service
    const categoryData = await cropDataService.getCropsByCategory(databaseCategory);
    
    // Convert the category object to an array of crops with keys
    return Object.entries(categoryData).map(([key, cropData]) => ({
      key,
      ...cropData
    }));
  } catch (error) {
    console.error(`Failed to get seeds for category ${category}:`, error);
    return [];
  }
};

/**
 * Calculate total seed requirements including succession plantings using database data
 */
const calculateSeedRequirements = async (crop, allocation, sizeMultiplier) => {
  // Get seed ordering details from database
  const seedOrderingData = await seedOrderingDB.getSeedOrderingDetails('US');
  const dbData = seedOrderingData[crop.key];
  
  if (!dbData) {
    // Fallback to basic calculation if no database data
    return calculateBasicSeedRequirements(crop, allocation, sizeMultiplier);
  }
  
  // Base quantity needed
  const baseQuantity = Math.ceil(allocation * sizeMultiplier * 20); // Base plants
  
  // Use succession plantings from database
  const successionMultiplier = dbData.succession_plantings || 1;
  const totalQuantity = baseQuantity * successionMultiplier;
  
  // Calculate packets needed based on database packet size and coverage
  const packetsNeeded = Math.ceil(totalQuantity / dbData.seed_count || 
                                  Math.ceil((allocation * sizeMultiplier * 100) / dbData.packet_plants_sqft));
  const estimatedCost = packetsNeeded * dbData.price;
  
  return {
    id: `seed_${crop.key}`,
    crop: dbData.common_name,
    variety: dbData.variety_name,
    category: 'Seeds',
    quantity: totalQuantity,
    successionPlantings: successionMultiplier,
    packetSize: dbData.packet_size,
    packetsNeeded: packetsNeeded,
    pricePerPacket: dbData.price,
    totalCost: estimatedCost,
    vendor: dbData.vendor_name,
    vendorSku: dbData.sku,
    vendorUrl: dbData.product_url,
    plantingMonths: crop.plantingSeasons?.temperate || [],
    orderTiming: dbData.order_timing,
    plantingInstructions: dbData.planting_instructions,
    notes: dbData.special_notes,
    purchaseWindow: getSeedPurchaseWindow(crop),
    priority: getSeedPriority(crop),
    specificInstructions: generateDatabaseOrderingInstructions(dbData, packetsNeeded)
  };
};

// Removed unused getRecommendedVariety function

// Removed unused getSpecificSeedOrderingInstructions function (was 120+ lines)
/* const getSpecificSeedOrderingInstructions = (crop, packetsNeeded) => {
  const orderingDetails = {
    'okra': {
      variety: 'Clemson Spineless Okra',
      vendor: 'True Leaf Market',
      sku: 'OKR-CLE-1000',
      url: 'https://www.trueleafmarket.com/products/okra-clemson-spineless',
      packetSize: '1000 seeds',
      pricePerPacket: 4.95,
      orderTiming: 'January (for May planting)',
      plantingInstructions: 'Direct sow after soil temps reach 65°F (mid-May Durham)',
      notes: 'Heat-loving, extremely reliable in Durham summers. Order early for best selection.'
    },
    'peppers': {
      variety: 'Serrano Pepper',
      vendor: 'Johnny\'s Seeds', 
      sku: 'PEP-SER-100',
      url: 'https://www.johnnyseeds.com/vegetables/peppers/hot-peppers/serrano-pepper',
      packetSize: '100 seeds',
      pricePerPacket: 4.25,
      orderTiming: 'December-January (for February indoor start)',
      plantingInstructions: 'Start indoors 8-10 weeks before last frost (mid-February). Transplant mid-May.',
      notes: 'Consistent producer in heat. Order by January for seed starting supplies.'
    },
    'kale': {
      variety: 'Red Russian Kale',
      vendor: 'True Leaf Market',
      sku: 'KAL-RED-500',
      url: 'https://www.trueleafmarket.com/products/kale-red-russian',
      packetSize: '500 seeds',
      pricePerPacket: 3.95,
      orderTiming: 'January (for succession plantings March-September)',
      plantingInstructions: 'Direct sow March 15, then every 3 weeks through September',
      notes: 'Most bolt-resistant kale for Durham. Plan 4-5 succession plantings.'
    },
    'lettuce': {
      variety: 'Jericho Lettuce (Romaine)',
      vendor: 'Johnny\'s Seeds',
      sku: 'LET-JER-1000', 
      url: 'https://www.johnnyseeds.com/vegetables/lettuce/romaine-lettuce/jericho-lettuce',
      packetSize: '1000 seeds',
      pricePerPacket: 5.50,
      orderTiming: 'January (for March-October succession)',
      plantingInstructions: 'Start March 1, succession plant every 2 weeks through April, resume August-October',
      notes: 'Heat-tolerant romaine. Essential for Durham climate. Order 2-3 packets for succession.'
    },
    'spinach': {
      variety: 'Space Spinach F1',
      vendor: 'Johnny\'s Seeds',
      sku: 'SPI-SPA-250',
      url: 'https://www.johnnyseeds.com/vegetables/spinach/space-spinach',
      packetSize: '250 seeds',
      pricePerPacket: 6.95,
      orderTiming: 'January (for March and September plantings)',
      plantingInstructions: 'Direct sow March 1-15, then September 1-30 for fall/winter harvest',
      notes: 'Slow-bolt F1 hybrid. Only spinach that works reliably in Durham spring.'
    },
    'carrots': {
      variety: 'Paris Market Carrot',
      vendor: 'Baker Creek',
      sku: 'CAR-PAR-500',
      url: 'https://www.rareseeds.com/carrot-paris-market',
      packetSize: '500 seeds', 
      pricePerPacket: 3.25,
      orderTiming: 'January (for March-September succession)',
      plantingInstructions: 'Direct sow every 3 weeks March through August. Short round variety perfect for clay soil.',
      notes: 'Round carrots work better in Durham clay. Succession plant for continuous harvest.'
    },
    'cabbage': {
      variety: 'Early Jersey Wakefield Cabbage',
      vendor: 'True Leaf Market',
      sku: 'CAB-EJW-100',
      url: 'https://www.trueleafmarket.com/products/cabbage-early-jersey-wakefield',
      packetSize: '100 seeds',
      pricePerPacket: 3.95,
      orderTiming: 'January (for spring and fall plantings)',
      plantingInstructions: 'Start indoors February for April transplant, again July for fall harvest.',
      notes: 'Quick-maturing variety perfect for Durham short spring window.'
    },
    'amaranth': {
      variety: 'Red Callaloo Amaranth',
      vendor: 'Baker Creek',
      sku: 'AMA-CAL-200',
      url: 'https://www.rareseeds.com/amaranth-red-callaloo',
      packetSize: '200 seeds',
      pricePerPacket: 3.75,
      orderTiming: 'January (for May-July planting)',
      plantingInstructions: 'Direct sow after soil warms to 70°F. Heat-loving summer green.',
      notes: 'Thrives in Durham heat. Continuous harvest leafy green. Drought tolerant.'
    },
    'sweetPotato': {
      variety: 'Beauregard Sweet Potato Slips',
      vendor: 'Local nursery',
      sku: 'SP-BEAU-25',
      url: 'https://www.localharvestnc.org',
      packetSize: '25 slips',
      pricePerPacket: 15.00,
      orderTiming: 'March-April (pre-order slips)',
      plantingInstructions: 'Plant slips after soil temps reach 70°F consistently (mid-May).',
      notes: 'Short-season variety perfect for Durham. Order slips from local growers.'
    }
  };

  const defaultDetails = {
    variety: `Standard ${crop.name}`,
    vendor: 'True Leaf Market',
    sku: 'STANDARD',
    url: 'https://www.trueleafmarket.com',
    packetSize: '100-500 seeds',
    pricePerPacket: 3.95,
    orderTiming: 'January (winter ordering window)',
    plantingInstructions: 'Follow packet instructions for your zone',
    notes: 'Standard variety - check for heat-tolerant options'
  };

  return orderingDetails[crop.key] || defaultDetails;
}; */

// Removed unused generateSpecificOrderingInstructions function
/* const generateSpecificOrderingInstructions = (crop, orderingDetails, packetsNeeded) => {
  const instructions = [
    `🛒 ORDER: ${packetsNeeded} packet${packetsNeeded > 1 ? 's' : ''} of ${orderingDetails.variety}`,
    `🏪 VENDOR: ${orderingDetails.vendor} (SKU: ${orderingDetails.sku})`,
    `💰 COST: $${(packetsNeeded * orderingDetails.pricePerPacket).toFixed(2)} total`,
    `📅 WHEN: ${orderingDetails.orderTiming}`,
    `🌱 PLANTING: ${orderingDetails.plantingInstructions}`,
    `📝 NOTES: ${orderingDetails.notes}`
  ];
  
  if (orderingDetails.url !== 'https://www.trueleafmarket.com') {
    instructions.splice(2, 0, `🔗 LINK: ${orderingDetails.url}`);
  }
  
  return instructions.join('\n');
};

/**
 * Generate specific ordering instructions from database data
 */
const generateDatabaseOrderingInstructions = (dbData, packetsNeeded) => {
  const instructions = [
    `🛒 ORDER: ${packetsNeeded} packet${packetsNeeded > 1 ? 's' : ''} of ${dbData.variety_name}`,
    `🏪 VENDOR: ${dbData.vendor_name} (SKU: ${dbData.sku})`,
    `💰 COST: $${(packetsNeeded * dbData.price).toFixed(2)} total`,
    `📅 WHEN: ${dbData.order_timing}`,
    `🌱 PLANTING: ${dbData.planting_instructions}`,
    `📝 NOTES: ${dbData.special_notes}`
  ];
  
  if (dbData.product_url) {
    instructions.splice(2, 0, `🔗 LINK: ${dbData.product_url}`);
  }
  
  return instructions.join('\n');
};

/**
 * Fallback seed requirements calculation for crops not in database
 */
const calculateBasicSeedRequirements = (crop, allocation, sizeMultiplier) => {
  const baseQuantity = Math.ceil(allocation * sizeMultiplier * 20);
  const successionCrops = ['lettuce', 'spinach', 'carrots', 'arugula'];
  const successionMultiplier = successionCrops.includes(crop.key) ? 3 : 1;
  const totalQuantity = baseQuantity * successionMultiplier;
  const packetsNeeded = Math.ceil(totalQuantity / 100); // Assume 100 seeds per packet
  const estimatedCost = packetsNeeded * 3.95; // Default price
  
  return {
    id: `seed_${crop.key}`,
    crop: crop.name?.en || crop.name || 'Unknown',
    variety: `Standard ${crop.name?.en || crop.name || 'variety'}`,
    category: 'Seeds',
    quantity: totalQuantity,
    successionPlantings: successionMultiplier,
    packetSize: '~100 seeds',
    packetsNeeded: packetsNeeded,
    pricePerPacket: 3.95,
    totalCost: estimatedCost,
    vendor: 'True Leaf Market',
    vendorSku: 'STANDARD',
    vendorUrl: 'https://www.trueleafmarket.com',
    plantingMonths: crop.plantingSeasons?.temperate || [],
    orderTiming: 'January (winter ordering window)',
    plantingInstructions: 'Follow packet instructions for your zone',
    notes: 'Standard variety - check for heat-tolerant options',
    purchaseWindow: 'winter_seed_order',
    priority: getSeedPriority(crop),
    specificInstructions: 'No specific database instructions available. Check vendor website for details.'
  };
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
 * Note: getPacketSize and getSeedPrice removed - now database-driven
 */

// Removed unused calculateSeedCost function

// Removed unused getPreferredVendor function

// Removed unused getFirstPlantingDate function

// Removed unused generateSeedNotes function

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