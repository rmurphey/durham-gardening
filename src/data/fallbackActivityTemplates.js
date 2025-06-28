/**
 * Fallback Activity Templates
 * Generic garden activity templates without location-specific references
 */

export const activityTemplates = [
  // Hot peppers shopping (February)
  {
    id: 1,
    plant_key: 'hot_peppers',
    activity_type: 'shopping',
    month: 2,
    action_template: (data) => `Order pepper seeds: ${data.varieties || 'recommended varieties'} from ${data.supplier || 'preferred supplier'}`,
    timing_template: 'Start indoors 8-10 weeks before transplant date',
    priority: 'medium',
    variety_suggestions: ['Habanero', 'Jalapeño', 'Thai Chili', 'Carolina Reaper'],
    supplier_preferences: ['True Leaf Market', 'Southern Exposure', 'Baker Creek'],
    estimated_cost_min: 12.00,
    estimated_cost_max: 18.00,
    bed_requirements: { min_spacing_inches: 18, plants_per_sqft: 0.25 }
  },
  
  // Sweet potato shopping (April)  
  {
    id: 2,
    plant_key: 'sweet_potato',
    activity_type: 'shopping',
    month: 4,
    action_template: (data) => `Order ${data.quantity} ${data.variety} sweet potato slips from ${data.supplier}`,
    timing_template: 'Plant after soil reaches 65°F',
    priority: 'medium',
    variety_suggestions: ['Beauregard', 'Georgia Jet', 'Centennial'],
    supplier_preferences: ['Local nursery', 'Southern Exposure', 'Johnny Seeds'],
    estimated_cost_min: 18.00,
    estimated_cost_max: 24.00,
    bed_requirements: { 
      min_spacing_inches: 12, 
      plants_per_sqft: 1.0, 
      recommended_bed: '4×8 Bed',
      quantity: 12 
    }
  },

  // Kale spring shopping (February)
  {
    id: 3,
    plant_key: 'kale',
    activity_type: 'shopping',
    month: 2,
    action_template: (data) => `Buy kale seeds: ${data.varieties} from ${data.supplier}`,
    timing_template: 'Direct sow with 18-inch spacing',
    priority: 'medium',
    variety_suggestions: ['Red Russian', 'Winterbor', 'Lacinato'],
    supplier_preferences: ['True Leaf Market', 'Southern Exposure'],
    estimated_cost_min: 8.00,
    estimated_cost_max: 12.00,
    bed_requirements: { 
      min_spacing_inches: 18, 
      plants_per_sqft: 0.25, 
      recommended_bed: '3×15 Bed' 
    }
  },

  // Kale fall shopping (July)
  {
    id: 4,
    plant_key: 'kale',
    activity_type: 'shopping',
    month: 7,
    action_template: (data) => `Buy kale seeds for fall planting: ${data.varieties}`,
    timing_template: 'Direct sow in August, harvest through winter',
    priority: 'medium',
    variety_suggestions: ['Red Russian', 'Winterbor'],
    supplier_preferences: ['True Leaf Market', 'Southern Exposure'],
    estimated_cost_min: 8.00,
    estimated_cost_max: 12.00,
    bed_requirements: { 
      min_spacing_inches: 18, 
      plants_per_sqft: 0.25, 
      recommended_bed: '4×5 Bed' 
    }
  },

  // Pepper care (July)
  {
    id: 5,
    plant_key: 'hot_peppers',
    activity_type: 'care',
    month: 7,
    action_template: 'Support heavy pepper plants, maintain consistent watering in summer heat',
    timing_template: 'Summer care - critical for fruit development',
    priority: 'medium',
    care_requirements: { frequency: 'weekly', water: 'deep_twice_weekly' }
  },

  // Pepper harvest (August)
  {
    id: 6,
    plant_key: 'hot_peppers',
    activity_type: 'harvest',
    month: 8,
    action_template: 'Harvest peppers regularly to encourage continued production',
    timing_template: 'Peak harvest season - check every 2-3 days',
    priority: 'high',
    harvest_info: { frequency: 'every_2_3_days' }
  },

  // Additional crop activities
  {
    id: 7,
    plant_key: 'sweet_potato',
    activity_type: 'care',
    month: 7,
    action_template: 'Mulch sweet potato beds, train vines away from paths',
    timing_template: 'Summer growth management',
    priority: 'medium'
  },

  {
    id: 8,
    plant_key: 'sweet_potato',
    activity_type: 'harvest',
    month: 9,
    action_template: 'Harvest sweet potatoes before first frost',
    timing_template: 'Before soil gets too cold',
    priority: 'high'
  },

  {
    id: 9,
    plant_key: 'cantaloupe',
    activity_type: 'harvest',
    month: 8,
    action_template: 'Check for ripe melons - should slip easily from vine',
    timing_template: 'Peak summer harvest',
    priority: 'high'
  },

  {
    id: 10,
    plant_key: 'cucumber',
    activity_type: 'harvest',
    month: 7,
    action_template: 'Daily cucumber harvest to maintain production',
    timing_template: 'Continuous harvest period',
    priority: 'high'
  },

  {
    id: 11,
    plant_key: 'tomatillo',
    activity_type: 'harvest',
    month: 8,
    action_template: 'Harvest tomatillos when husks are full and papery',
    timing_template: 'Extended harvest season',
    priority: 'high'
  }
];

export const rotationTemplates = [
  {
    id: 101,
    activity_type: 'rotation',
    month: 3,
    action_template: 'Clear winter debris from raised bed, add 2-3 inches compost',
    timing_template: 'Prepare bed for spring plantings (lettuce, kale)',
    priority: 'high'
  },
  {
    id: 102,
    activity_type: 'rotation',
    month: 4,
    action_template: 'Prepare bed for heat crops - add compost, check drainage',
    timing_template: 'Get bed ready for peppers, tomatoes in late spring',
    priority: 'high'
  },
  {
    id: 103,
    activity_type: 'rotation',
    month: 7,
    action_template: 'Clear bolted lettuce from bed, plant heat-tolerant crops',
    timing_template: 'Replace failed cool crops with heat specialists',
    priority: 'high'
  },
  {
    id: 104,
    activity_type: 'rotation',
    month: 8,
    action_template: 'Clear spent spring crops from bed, add compost for fall crops',
    timing_template: 'Rotate bed from spring crops to fall greens',
    priority: 'high'
  },
  {
    id: 105,
    activity_type: 'rotation',
    month: 10,
    action_template: 'Harvest final peppers from bed, plant garlic cloves',
    timing_template: 'Transition bed from summer heat crops to winter garlic',
    priority: 'high'
  }
];

export const successionTemplates = [
  {
    id: 201,
    activity_type: 'succession',
    month: 2,
    plant_key: 'lettuce',
    action_template: 'Direct sow lettuce: cold-tolerant varieties',
    timing_template: 'Start every 2 weeks through early spring for spring harvest',
    priority: 'medium',
    varieties: ['Black Seeded Simpson', 'Buttercrunch'],
    interval_weeks: 2
  },
  {
    id: 202,
    activity_type: 'succession',
    month: 3,
    plant_key: 'kale',
    action_template: 'Direct sow kale: cold-hardy varieties',
    timing_template: 'Plant every 3 weeks for continuous harvest',
    priority: 'medium',
    varieties: ['Red Russian', 'Winterbor'],
    interval_weeks: 3
  },
  {
    id: 203,
    activity_type: 'succession',
    month: 7,
    plant_key: null,
    action_template: 'Clear spent spring crops, sow arugula and Asian greens',
    timing_template: 'Prepare for fall growing season',
    priority: 'high',
    crop_transition: 'spring_to_fall'
  },
  {
    id: 204,
    activity_type: 'succession',
    month: 8,
    plant_key: 'kale',
    action_template: 'Sow fall kale and lettuce varieties',
    timing_template: '10-12 weeks before first frost',
    priority: 'high',
    varieties: ['Red Russian kale', 'Buttercrunch lettuce']
  },
  {
    id: 205,
    activity_type: 'succession',
    month: 8,
    plant_key: null,
    action_template: 'Plant cilantro and parsley in containers for fall harvest',
    timing_template: 'Cool weather herbs for fall cooking',
    priority: 'medium',
    container_planting: true
  },
  {
    id: 206,
    activity_type: 'succession',
    month: 9,
    plant_key: 'spinach',
    action_template: 'Last chance - sow spinach and arugula in containers',
    timing_template: 'Quick-growing greens before hard frost',
    priority: 'medium',
    varieties: ['spinach', 'arugula']
  }
];