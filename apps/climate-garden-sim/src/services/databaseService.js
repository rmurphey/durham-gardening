/**
 * Database Service for Garden Calendar
 * Provides abstraction layer for SQLite database operations
 */

// For now, we'll use a mock implementation that reads from the database
// In a full implementation, you'd use better-sqlite3 or similar

class DatabaseService {
  constructor() {
    this.dbPath = './database/plant_varieties.db';
    // Note: This would require a Node.js backend or better-sqlite3 in Electron
    // For now, we'll provide a bridge interface
  }

  /**
   * Get activity templates for a specific region and month
   * @param {number} regionId - Region ID (1 for US)
   * @param {number} month - Month number (1-12)
   * @param {Array} enabledPlantKeys - Plant keys that are enabled in garden status
   * @returns {Promise<Array>} Activity templates
   */
  async getActivityTemplates(regionId = 1, month, enabledPlantKeys = []) {
    // This would be a real database query in production
    // For now, return structured data based on the database schema
    
    const templates = [
      // Hot peppers shopping (February)
      {
        id: 1,
        plant_key: 'hot_peppers',
        activity_type: 'shopping',
        month: 2,
        action_template: 'Order pepper seeds: {varieties} from {supplier}',
        timing_template: 'Start indoors March 1st, need 8-10 weeks before transplant',
        priority: 'medium',
        variety_suggestions: ['Habanero', 'Jalapeño', 'Thai Chili'],
        supplier_preferences: ['True Leaf Market', 'Southern Exposure'],
        estimated_cost_min: 12.00,
        estimated_cost_max: 18.00,
        conditions: { min_temp_indoors: 70 }
      },
      
      // Sweet potato shopping (April)  
      {
        id: 2,
        plant_key: 'sweet_potato',
        activity_type: 'shopping',
        month: 4,
        action_template: 'Order {quantity} {variety} sweet potato slips from {supplier}',
        timing_template: 'Plant in 4×8 bed after soil reaches 65°F (mid-May)',
        priority: 'medium',
        variety_suggestions: ['Beauregard', 'Georgia Jet'],
        supplier_preferences: ['Local nursery', 'Southern Exposure'],
        estimated_cost_min: 18.00,
        estimated_cost_max: 24.00,
        bed_requirements: { recommended_bed: '4×8 Bed', quantity: 12 }
      },

      // Kale spring shopping (February)
      {
        id: 3,
        plant_key: 'kale',
        activity_type: 'shopping',
        month: 2,
        action_template: 'Buy kale seeds: {varieties} from {supplier}',
        timing_template: 'Direct sow in 3×15 bed mid-February, 18-inch spacing',
        priority: 'medium',
        variety_suggestions: ['Red Russian', 'Winterbor'],
        supplier_preferences: ['True Leaf Market'],
        estimated_cost_min: 8.00,
        estimated_cost_max: 12.00,
        bed_requirements: { recommended_bed: '3×15 Bed' }
      },

      // Kale fall shopping (July)
      {
        id: 4,
        plant_key: 'kale',
        activity_type: 'shopping',
        month: 7,
        action_template: 'Buy kale seeds for fall planting: {varieties}',
        timing_template: 'Direct sow in 4×5 bed in August, harvest through winter',
        priority: 'medium',
        variety_suggestions: ['Red Russian', 'Winterbor'],
        supplier_preferences: ['True Leaf Market'],
        estimated_cost_min: 8.00,
        estimated_cost_max: 12.00,
        bed_requirements: { recommended_bed: '4×5 Bed' }
      },

      // Pepper care (July)
      {
        id: 5,
        plant_key: 'hot_peppers',
        activity_type: 'care',
        month: 7,
        action_template: 'Support heavy pepper plants, consistent watering in Durham heat',
        timing_template: 'Durham summer care - critical for fruit development',
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
      }
    ];

    // Filter by month and enabled plants
    return templates.filter(template => {
      const matchesMonth = template.month === month;
      const isEnabled = !template.plant_key || enabledPlantKeys.includes(template.plant_key);
      return matchesMonth && isEnabled;
    });
  }

  /**
   * Get rotation templates for specific month
   * @param {number} regionId - Region ID
   * @param {number} month - Month number
   * @returns {Promise<Array>} Rotation activity templates
   */
  async getRotationTemplates(regionId = 1, month) {
    const rotations = [
      {
        id: 101,
        activity_type: 'rotation',
        month: 3,
        action_template: 'Clear winter debris from 3×15 bed, add 2-3 inches compost',
        timing_template: 'Prepare 3×15 bed for spring plantings (lettuce, kale)',
        priority: 'high',
        target_bed: '3×15 Bed'
      },
      {
        id: 102,
        activity_type: 'rotation',
        month: 4,
        action_template: 'Prepare 4×8 bed for heat crops - add compost, check drainage',
        timing_template: 'Get 4×8 bed ready for peppers, tomatoes in May',
        priority: 'high',
        target_bed: '4×8 Bed'
      },
      {
        id: 103,
        activity_type: 'rotation',
        month: 7,
        action_template: 'Clear bolted lettuce from 3×15 bed, plant heat-tolerant amaranth',
        timing_template: 'Replace failed cool crops with heat specialists',
        priority: 'high',
        source_bed: '3×15 Bed'
      },
      {
        id: 104,
        activity_type: 'rotation',
        month: 8,
        action_template: 'Clear spent spring crops from 4×5 bed, add compost for fall kale',
        timing_template: 'Rotate 4×5 bed from spring crops to fall greens',
        priority: 'high',
        target_bed: '4×5 Bed'
      },
      {
        id: 105,
        activity_type: 'rotation',
        month: 10,
        action_template: 'Harvest final peppers from 4×8 bed, plant garlic cloves',
        timing_template: 'Transition 4×8 bed from summer heat crops to winter garlic',
        priority: 'high',
        source_bed: '4×8 Bed'
      }
    ];

    return rotations.filter(rotation => rotation.month === month);
  }

  /**
   * Get succession planting templates
   * @param {number} regionId - Region ID
   * @param {number} month - Month number
   * @returns {Promise<Array>} Succession planting templates
   */
  async getSuccessionTemplates(regionId = 1, month) {
    const successions = [
      {
        id: 201,
        activity_type: 'succession',
        month: 2,
        plant_key: 'lettuce',
        action_template: 'Direct sow lettuce: Black Seeded Simpson, Buttercrunch (cold-tolerant varieties)',
        timing_template: 'Start every 2 weeks through March for spring harvest',
        priority: 'medium',
        varieties: ['Black Seeded Simpson', 'Buttercrunch'],
        interval_weeks: 2
      },
      {
        id: 202,
        activity_type: 'succession',
        month: 3,
        plant_key: 'kale',
        action_template: 'Direct sow kale: Red Russian, Winterbor varieties in 3×15 bed',
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
        action_template: 'Clear spent spring crops, sow arugula and Asian greens in 4×8 bed',
        timing_template: 'Prepare for fall growing season',
        priority: 'high',
        crop_transition: 'spring_to_fall'
      },
      {
        id: 204,
        activity_type: 'succession',
        month: 8,
        plant_key: 'kale',
        action_template: 'Sow fall kale (Red Russian) and lettuce (Buttercrunch) in 4×5 bed',
        timing_template: '10-12 weeks before first frost (mid-late October)',
        priority: 'high',
        varieties: ['Red Russian kale', 'Buttercrunch lettuce'],
        target_bed: '4×5 bed'
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

    return successions.filter(succession => succession.month === month);
  }

  /**
   * Generate personalized action text from template
   * @param {Object} template - Activity template
   * @returns {string} Personalized action text
   */
  generateActionText(template) {
    let action = template.action_template;

    // Replace template variables with specific values
    if (template.variety_suggestions && template.variety_suggestions.length > 0) {
      const varieties = template.variety_suggestions.slice(0, 2).join(', ');
      action = action.replace('{varieties}', varieties);
    }

    if (template.supplier_preferences && template.supplier_preferences.length > 0) {
      action = action.replace('{supplier}', template.supplier_preferences[0]);
    }

    if (template.bed_requirements?.recommended_bed) {
      action = action.replace('{bed}', template.bed_requirements.recommended_bed);
    }

    if (template.bed_requirements?.quantity) {
      action = action.replace('{quantity}', template.bed_requirements.quantity);
    }

    if (template.variety_suggestions?.[0]) {
      action = action.replace('{variety}', template.variety_suggestions[0]);
    }

    // Add cost information
    if (template.estimated_cost_min && template.estimated_cost_max) {
      const costRange = `$${template.estimated_cost_min.toFixed(0)}-${template.estimated_cost_max.toFixed(0)}`;
      action = action.includes(' - $') ? action : `${action} - ${costRange}`;
    }

    return action;
  }

  /**
   * Get garden beds for a specific garden
   * @param {number} gardenId - Garden ID
   * @returns {Promise<Array>} Garden beds
   */
  async getGardenBeds(gardenId = 1) {
    return [
      { id: 1, name: '3×15 Bed', length: 15, width: 3, area: 45 },
      { id: 2, name: '4×8 Bed', length: 8, width: 4, area: 32 },
      { id: 3, name: '4×5 Bed', length: 5, width: 4, area: 20 },
      { id: 4, name: 'Containers', length: 2, width: 2, area: 4 }
    ];
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;