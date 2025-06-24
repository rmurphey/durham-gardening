/**
 * Database Service for Garden Calendar
 * Provides abstraction layer for SQLite database operations using sql.js
 */

import initSqlJs from 'sql.js';

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.initializeDatabase();
  }

  async initializeDatabase() {
    try {
      // Initialize sql.js
      const SQL = await initSqlJs({
        locateFile: file => `/sql-wasm.wasm`
      });

      // Load the database file
      const response = await fetch('/database/plant_varieties.db');
      if (!response.ok) {
        throw new Error(`Failed to load database: ${response.status}`);
      }
      
      const buffer = await response.arrayBuffer();
      this.db = new SQL.Database(new Uint8Array(buffer));
      this.isInitialized = true;
      
      console.log('Successfully connected to SQLite database via sql.js');
      
      // Verify we can query the database
      const result = this.db.exec("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('Available tables:', result[0]?.values.flat() || []);
      
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Fall back to structured data if database loading fails
      this.loadFallbackData();
    }
  }

  async waitForInitialization() {
    // Wait for database to be initialized
    while (!this.isInitialized && !this.fallbackData) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  loadFallbackData() {
    console.log('Loading fallback activity data');
    this.fallbackData = true;
    
    // Durham-specific activity templates (extracted from database)
    // This data matches the structure in durham_data.sql
    
    this.activityTemplates = [
      // Hot peppers shopping (February)
      {
        id: 1,
        plant_key: 'hot_peppers',
        activity_type: 'shopping',
        month: 2,
        action_template: (data) => `Order pepper seeds: ${data.varieties || 'recommended varieties'} from ${data.supplier || 'preferred supplier'}`,
        timing_template: 'Start indoors March 1st, need 8-10 weeks before transplant',
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
        timing_template: 'Plant in 4×8 bed after soil reaches 65°F (mid-May)',
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
        timing_template: 'Direct sow in 3×15 bed mid-February, 18-inch spacing',
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
        timing_template: 'Direct sow in 4×5 bed in August, harvest through winter',
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

    // Rotation templates - direct text, no placeholders
    this.rotationTemplates = [
      {
        id: 101,
        activity_type: 'rotation',
        month: 3,
        action_template: 'Clear winter debris from 3×15 bed, add 2-3 inches compost',
        timing_template: 'Prepare 3×15 bed for spring plantings (lettuce, kale)',
        priority: 'high'
      },
      {
        id: 102,
        activity_type: 'rotation',
        month: 4,
        action_template: 'Prepare 4×8 bed for heat crops - add compost, check drainage',
        timing_template: 'Get 4×8 bed ready for peppers, tomatoes in May',
        priority: 'high'
      },
      {
        id: 103,
        activity_type: 'rotation',
        month: 7,
        action_template: 'Clear bolted lettuce from 3×15 bed, plant heat-tolerant amaranth',
        timing_template: 'Replace failed cool crops with heat specialists',
        priority: 'high'
      },
      {
        id: 104,
        activity_type: 'rotation',
        month: 8,
        action_template: 'Clear spent spring crops from 4×5 bed, add compost for fall kale',
        timing_template: 'Rotate 4×5 bed from spring crops to fall greens',
        priority: 'high'
      },
      {
        id: 105,
        activity_type: 'rotation',
        month: 10,
        action_template: 'Harvest final peppers from 4×8 bed, plant garlic cloves',
        timing_template: 'Transition 4×8 bed from summer heat crops to winter garlic',
        priority: 'high'
      }
    ];

    // Succession planting templates
    this.successionTemplates = [
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
  }

  /**
   * Get activity templates for a specific region and month
   * @param {number} regionId - Region ID (1 for US)
   * @param {number} month - Month number (1-12)
   * @param {Array} enabledPlantKeys - Plant keys that are enabled in garden status
   * @returns {Promise<Array>} Activity templates
   */
  async getActivityTemplates(regionId = 1, month, enabledPlantKeys = []) {
    await this.waitForInitialization();
    
    if (this.db) {
      try {
        const stmt = `
          SELECT 
            at.id,
            p.plant_key,
            aty.type_key as activity_type,
            at.month,
            at.action_template,
            at.timing_template,
            at.priority,
            at.variety_suggestions,
            at.supplier_preferences,
            at.estimated_cost_min,
            at.estimated_cost_max,
            at.bed_size_requirements,
            at.conditions
          FROM activity_templates at
          JOIN activity_types aty ON at.activity_type_id = aty.id
          LEFT JOIN plants p ON at.plant_id = p.id
          WHERE at.region_id = ? AND at.month = ?
        `;
        
        const result = this.db.exec(stmt, [regionId, month]);
        
        if (result.length === 0) return [];
        
        const columns = result[0].columns;
        const values = result[0].values;
        
        return values.map(row => {
          const template = {};
          columns.forEach((col, index) => {
            template[col] = row[index];
          });
          
          // Parse JSON fields
          if (template.variety_suggestions) {
            try {
              template.variety_suggestions = JSON.parse(template.variety_suggestions);
            } catch (e) {
              template.variety_suggestions = [];
            }
          }
          
          if (template.supplier_preferences) {
            try {
              template.supplier_preferences = JSON.parse(template.supplier_preferences);
            } catch (e) {
              template.supplier_preferences = [];
            }
          }
          
          if (template.bed_size_requirements) {
            try {
              template.bed_requirements = JSON.parse(template.bed_size_requirements);
            } catch (e) {
              template.bed_requirements = {};
            }
          }
          
          if (template.conditions) {
            try {
              template.conditions = JSON.parse(template.conditions);
            } catch (e) {
              template.conditions = {};
            }
          }
          
          return template;
        });
        
      } catch (error) {
        console.error('Database query failed:', error);
      }
    }
    
    // Fallback to structured data
    return this.activityTemplates?.filter(template => 
      template.month === month &&
      (!template.plant_key || enabledPlantKeys.includes(template.plant_key))
    ) || [];
  }

  /**
   * Get rotation templates for specific month
   * @param {number} regionId - Region ID
   * @param {number} month - Month number
   * @returns {Promise<Array>} Rotation activity templates
   */
  async getRotationTemplates(regionId = 1, month) {
    await this.waitForInitialization();
    
    if (this.db) {
      try {
        const stmt = `
          SELECT 
            at.id,
            aty.type_key as activity_type,
            at.month,
            at.action_template,
            at.timing_template,
            at.priority,
            at.bed_size_requirements,
            at.variety_suggestions,
            at.supplier_preferences
          FROM activity_templates at
          JOIN activity_types aty ON at.activity_type_id = aty.id
          WHERE at.region_id = ? AND at.month = ? AND at.plant_id IS NULL AND aty.type_key = 'rotation'
        `;
        
        const result = this.db.exec(stmt, [regionId, month]);
        
        if (result.length === 0) return [];
        
        const columns = result[0].columns;
        const values = result[0].values;
        
        return values.map(row => {
          const template = {};
          columns.forEach((col, index) => {
            template[col] = row[index];
          });
          
          // Parse JSON fields to extract data for template replacement
          if (template.bed_size_requirements) {
            try {
              template.bed_requirements = JSON.parse(template.bed_size_requirements);
            } catch (e) {
              template.bed_requirements = {};
            }
          }
          
          if (template.variety_suggestions) {
            try {
              template.variety_suggestions = JSON.parse(template.variety_suggestions);
            } catch (e) {
              template.variety_suggestions = [];
            }
          }
          
          if (template.supplier_preferences) {
            try {
              template.supplier_preferences = JSON.parse(template.supplier_preferences);
            } catch (e) {
              template.supplier_preferences = [];
            }
          }
          
          return template;
        });
        
      } catch (error) {
        console.error('Rotation query failed:', error);
      }
    }
    
    // Fallback
    return this.rotationTemplates?.filter(template => template.month === month) || [];
  }

  /**
   * Get succession planting templates
   * @param {number} regionId - Region ID
   * @param {number} month - Month number
   * @returns {Promise<Array>} Succession planting templates
   */
  async getSuccessionTemplates(regionId = 1, month) {
    await this.waitForInitialization();
    
    if (this.db) {
      try {
        const stmt = `
          SELECT 
            at.id,
            p.plant_key,
            aty.type_key as activity_type,
            at.month,
            at.action_template,
            at.timing_template,
            at.priority,
            at.variety_suggestions,
            at.bed_size_requirements
          FROM activity_templates at
          JOIN activity_types aty ON at.activity_type_id = aty.id
          LEFT JOIN plants p ON at.plant_id = p.id
          WHERE at.region_id = ? AND at.month = ? AND aty.type_key = 'succession'
        `;
        
        const result = this.db.exec(stmt, [regionId, month]);
        
        if (result.length === 0) return [];
        
        const columns = result[0].columns;
        const values = result[0].values;
        
        return values.map(row => {
          const template = {};
          columns.forEach((col, index) => {
            template[col] = row[index];
          });
          
          // Parse JSON fields
          if (template.variety_suggestions) {
            try {
              template.varieties = JSON.parse(template.variety_suggestions);
            } catch (e) {
              template.varieties = [];
            }
          }
          
          return template;
        });
        
      } catch (error) {
        console.error('Succession query failed:', error);
      }
    }
    
    // Fallback
    return this.successionTemplates?.filter(template => template.month === month) || [];
  }

  /**
   * Generate action text from template
   * @param {Object} template - Activity template
   * @returns {string} Action text
   */
  generateActionText(template) {
    // If action_template is a function (JavaScript template literal)
    if (typeof template.action_template === 'function') {
      const data = {
        varieties: template.variety_suggestions?.length > 0 
          ? template.variety_suggestions.slice(0, 2).join(', ')
          : 'recommended varieties',
        variety: template.variety_suggestions?.[0] || 'recommended variety',
        supplier: template.supplier_preferences?.[0] || 'preferred supplier',
        bed: template.bed_requirements?.recommended_bed || template.target_bed || 'any available bed',
        quantity: template.bed_requirements?.quantity || 'appropriate amount'
      };
      
      return template.action_template(data);
    }

    // Handle string templates (including from database) - MUST replace ALL placeholders
    let action = template.action_template || 'Garden activity';

    // Debug logging to see what data we have
    if (action.includes('{bed}')) {
      console.log('Template with {bed} placeholder:', {
        action_template: template.action_template,
        bed_requirements: template.bed_requirements,
        bed_size_requirements: template.bed_size_requirements
      });
    }

    // Extract bed name from various possible sources
    let bedName = 'garden bed'; // fallback
    
    if (template.bed_requirements) {
      bedName = template.bed_requirements.recommended_bed || 
                template.bed_requirements.target_bed || 
                template.bed_requirements.source_bed ||
                bedName;
    }

    // Replace ANY placeholders that exist
    const replacements = {
      '{varieties}': template.variety_suggestions?.length > 0 
        ? template.variety_suggestions.slice(0, 2).join(', ')
        : 'recommended varieties',
      '{variety}': template.variety_suggestions?.[0] || 'recommended variety',
      '{supplier}': template.supplier_preferences?.[0] || 'preferred supplier',
      '{bed}': bedName,
      '{quantity}': template.bed_requirements?.quantity || 'appropriate amount'
    };

    // Replace all placeholders
    Object.entries(replacements).forEach(([placeholder, replacement]) => {
      action = action.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), replacement);
    });

    // CRITICAL: Final safety check - if ANY placeholder remains, log error and replace
    const remainingPlaceholders = action.match(/\{[^}]+\}/g);
    if (remainingPlaceholders) {
      console.error('CRITICAL: Unreplaced placeholders found:', remainingPlaceholders, 'in result:', action);
      console.error('Template data:', template);
      // Replace any remaining placeholders with fallback
      action = action.replace(/\{[^}]+\}/g, '[bed information not available]');
    }

    // Add cost information for shopping activities
    if (template.estimated_cost_min && template.estimated_cost_max && template.activity_type === 'shopping') {
      const costRange = `$${template.estimated_cost_min.toFixed(0)}-${template.estimated_cost_max.toFixed(0)}`;
      action = action.includes(' - $') ? action : `${action} - ${costRange}`;
    }

    return action;
  }

  /**
   * Get all activity templates for testing
   * @returns {Array} All activity templates
   */
  getActivityTemplates() {
    return this.fallbackTemplates || [];
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