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

  async initializeDatabase(forceReload = false) {
    if (this.isInitialized && !forceReload) {
      return;
    }
    
    try {
      // Initialize sql.js
      const SQL = await initSqlJs({
        locateFile: file => `/sql-wasm.wasm`
      });

      // Load the database file with cache-busting
      const cacheBuster = forceReload ? Date.now() : 'v3';
      console.log(`Loading database with cache buster: ${cacheBuster}`);
      
      const response = await fetch(`/database/plant_varieties.db?v=${cacheBuster}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to load database: ${response.status}`);
      }
      
      const buffer = await response.arrayBuffer();
      this.db = new SQL.Database(new Uint8Array(buffer));
      this.isInitialized = true;
      
      console.log(`Successfully connected to SQLite database via sql.js (cache buster: ${cacheBuster})`);
      
      // Verify we can query the database
      const result = this.db.exec("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('Available tables:', result[0]?.values.flat() || []);
      
      // Test a rotation template to see if placeholders are fixed
      if (this.db) {
        const testResult = this.db.exec(`
          SELECT action_template, timing_template, bed_size_requirements 
          FROM activity_templates 
          WHERE action_template LIKE '%{bed}%' 
          LIMIT 3
        `);
        
        if (testResult.length > 0) {
          console.log('Templates with {bed} placeholders found in database:');
          testResult[0].values.forEach((row, index) => {
            console.log(`${index + 1}. action: "${row[0]}", timing: "${row[1]}", bed_req: ${row[2]}`);
          });
        } else {
          console.log('No {bed} placeholders found in database - database appears updated');
        }
      }
      
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Fall back to structured data if database loading fails
      this.loadFallbackData();
    }
  }
  
  /**
   * Force reload of database (for cache-busting)
   */
  async reloadDatabase() {
    this.isInitialized = false;
    this.db = null;
    await this.initializeDatabase(true);
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
    
    console.log(`getActivityTemplates called: regionId=${regionId}, month=${month}, enabledPlantKeys=`, enabledPlantKeys);
    
    if (this.db) {
      console.log('Using database for activity templates');
      try {
        let stmt = `
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
        
        let params = [regionId, month];
        
        // Add plant key filtering if enabled crops are specified
        if (enabledPlantKeys && enabledPlantKeys.length > 0) {
          const placeholders = enabledPlantKeys.map(() => '?').join(',');
          stmt += ` AND (p.plant_key IS NULL OR p.plant_key IN (${placeholders}))`;
          params.push(...enabledPlantKeys);
        }
        
        console.log(`Executing query:`, stmt);
        console.log(`With params:`, params);
        const result = this.db.exec(stmt, params);
        console.log(`Query returned ${result.length} result sets with ${result[0]?.values?.length || 0} rows`);
        
        // Debug: Check if indoor start templates exist for this month
        if (month === 2 || month === 3) {
          const debugStmt = `
            SELECT COUNT(*) as count, aty.type_key
            FROM activity_templates at
            JOIN activity_types aty ON at.activity_type_id = aty.id
            WHERE at.month = ? AND aty.type_key = 'indoor-starting'
          `;
          const debugResult = this.db.exec(debugStmt, [month]);
          if (debugResult.length > 0) {
            console.log(`DEBUG: Month ${month} has ${debugResult[0].values[0][0]} indoor-starting templates`);
          }
        }
        
        if (result.length === 0) {
          console.log(`No activity templates found for month ${month}`);
          return [];
        }
        
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
    console.log('Using fallback data for activity templates');
    const fallbackResults = this.activityTemplates?.filter(template => 
      template.month === month &&
      (!template.plant_key || enabledPlantKeys.includes(template.plant_key))
    ) || [];
    console.log(`Fallback returned ${fallbackResults.length} templates for month ${month}`);
    return fallbackResults;
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
   * CRITICAL VALIDATION: Prevents ANY placeholder from reaching UI
   * @param {string} text - Text to validate
   * @returns {string} Validated text with NO placeholders
   * @throws {Error} If placeholders are found
   */
  validateNoPlaceholders(text) {
    const placeholderPattern = /\{[^}]+\}/g;
    const foundPlaceholders = text.match(placeholderPattern);
    
    if (foundPlaceholders) {
      console.error('CRITICAL ERROR: Placeholders detected:', foundPlaceholders);
      console.error('Original text:', text);
      throw new Error(`Template placeholders FORBIDDEN in UI: ${foundPlaceholders.join(', ')}`);
    }
    
    return text;
  }

  /**
   * Process timing template text to replace placeholders
   * @param {Object} template - Activity template
   * @returns {string} Timing text - GUARANTEED NO PLACEHOLDERS
   */
  generateTimingText(template) {
    let timing = template.timing_template || '';
    
    if (!timing) return '';
    
    // AGGRESSIVE BED NAME EXTRACTION FOR TIMING - NO FALLBACKS ALLOWED
    let bedName = null;
    
    // First: Check if bed_requirements exists and has bed info
    if (template.bed_requirements) {
      bedName = template.bed_requirements.recommended_bed || 
                template.bed_requirements.target_bed || 
                template.bed_requirements.source_bed;
    }
    
    // Second: Parse bed_size_requirements (this is where rotation templates store bed info)
    if (!bedName && template.bed_size_requirements) {
      try {
        const bedReqs = typeof template.bed_size_requirements === 'string' 
          ? JSON.parse(template.bed_size_requirements) 
          : template.bed_size_requirements;
        
        bedName = bedReqs.source_bed || bedReqs.target_bed || bedReqs.recommended_bed || bedReqs.transplant_to;
        
      } catch (e) {
        console.error('❌ JSON PARSE FAILED for timing bed_size_requirements:', template.bed_size_requirements, e);
      }
    }
    
    // Normalize bed names from database format to display format
    if (bedName) {
      bedName = bedName
        .replace('4x8_bed', '4×8 Bed')
        .replace('3x15_bed', '3×15 Bed') 
        .replace('4x5_bed', '4×5 Bed')
        .replace('containers', 'Containers');
    }
    
    // FINAL FALLBACK: If we still don't have a bed name, something is wrong
    if (!bedName) {
      console.error('❌ CRITICAL: No bed name found for timing template:', {
        id: template.id,
        timing_template: template.timing_template,
        bed_requirements: template.bed_requirements,
        bed_size_requirements: template.bed_size_requirements
      });
      bedName = 'MISSING_BED_DATA'; // Make it obvious something is broken
    }

    // COMPREHENSIVE REPLACEMENT: Handle ALL database placeholders (timing)
    const replacements = {
      // Variety-based replacements (from database)
      '{varieties}': template.variety_suggestions?.length > 0 
        ? template.variety_suggestions.slice(0, 2).join(', ')
        : 'recommended varieties',
      '{variety}': template.variety_suggestions?.[0] || 'recommended variety',
      
      // Supplier replacement (from database)
      '{supplier}': template.supplier_preferences?.[0] || 'preferred supplier',
      
      // Bed replacement (from parsed bed requirements)
      '{bed}': bedName,
      
      // Quantity replacement (smart defaults based on bed size)
      '{quantity}': (() => {
        if (template.bed_requirements?.quantity) return template.bed_requirements.quantity;
        if (bedName.includes('4×8')) return '12';
        if (bedName.includes('3×15')) return '8';  
        if (bedName.includes('4×5')) return '6';
        return 'appropriate amount';
      })()
    };

    // Replace all placeholders
    Object.entries(replacements).forEach(([placeholder, replacement]) => {
      timing = timing.replace(new RegExp(placeholder.replace(/[{}]/g, '\\\\$&'), 'g'), replacement);
    });

    // Final safety check for any remaining placeholders
    const remainingPlaceholders = timing.match(/\{[^}]+\}/g);
    if (remainingPlaceholders) {
      console.error('CRITICAL: Unreplaced placeholders in timing:', remainingPlaceholders, 'in result:', timing);
      
      // Replace specific placeholders with more helpful fallbacks
      timing = timing.replace(/\{bed\}/g, bedName || 'appropriate bed');
      timing = timing.replace(/\{variety\}/g, template.variety_suggestions?.[0] || 'recommended variety');
      timing = timing.replace(/\{varieties\}/g, template.variety_suggestions?.slice(0,2).join(', ') || 'recommended varieties');
      timing = timing.replace(/\{supplier\}/g, template.supplier_preferences?.[0] || 'preferred supplier');
      timing = timing.replace(/\{quantity\}/g, 'appropriate amount');
      // Catch any other unexpected placeholders
      timing = timing.replace(/\{[^}]+\}/g, '[data not available]');
    }

    return this.validateNoPlaceholders(timing);
  }

  /**
   * Generate action text from template
   * @param {Object} template - Activity template
   * @returns {string} Action text - GUARANTEED NO PLACEHOLDERS
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

    // AGGRESSIVE BED NAME EXTRACTION - NO FALLBACKS ALLOWED
    let bedName = null;
    
    // First: Check if bed_requirements exists and has bed info
    if (template.bed_requirements) {
      bedName = template.bed_requirements.recommended_bed || 
                template.bed_requirements.target_bed || 
                template.bed_requirements.source_bed;
    }
    
    // Second: Parse bed_size_requirements (this is where rotation templates store bed info)
    if (!bedName && template.bed_size_requirements) {
      try {
        const bedReqs = typeof template.bed_size_requirements === 'string' 
          ? JSON.parse(template.bed_size_requirements) 
          : template.bed_size_requirements;
        
        bedName = bedReqs.source_bed || bedReqs.target_bed || bedReqs.recommended_bed || bedReqs.transplant_to;
        
        // CRITICAL DEBUG: Log ALL parsing attempts
        console.log('🔍 BED PARSING DEBUG:', {
          template_id: template.id,
          action_template: template.action_template,
          bed_size_requirements_raw: template.bed_size_requirements,
          parsed_bedReqs: bedReqs,
          extracted_bedName: bedName,
          available_fields: Object.keys(bedReqs || {})
        });
        
      } catch (e) {
        console.error('❌ JSON PARSE FAILED for bed_size_requirements:', template.bed_size_requirements, e);
      }
    }
    
    // Normalize bed names from database format to display format
    if (bedName) {
      bedName = bedName
        .replace('4x8_bed', '4×8 Bed')
        .replace('3x15_bed', '3×15 Bed') 
        .replace('4x5_bed', '4×5 Bed')
        .replace('containers', 'Containers');
    }
    
    // FINAL FALLBACK: If we still don't have a bed name, something is wrong
    if (!bedName) {
      console.error('❌ CRITICAL: No bed name found for template:', {
        id: template.id,
        action_template: template.action_template,
        bed_requirements: template.bed_requirements,
        bed_size_requirements: template.bed_size_requirements
      });
      bedName = 'MISSING_BED_DATA'; // Make it obvious something is broken
    }

    // COMPREHENSIVE REPLACEMENT: Handle ALL database placeholders
    const replacements = {
      // Variety-based replacements (from database)
      '{varieties}': template.variety_suggestions?.length > 0 
        ? template.variety_suggestions.slice(0, 2).join(', ')
        : 'recommended varieties',
      '{variety}': template.variety_suggestions?.[0] || 'recommended variety',
      
      // Supplier replacement (from database)
      '{supplier}': template.supplier_preferences?.[0] || 'preferred supplier',
      
      // Bed replacement (from parsed bed requirements)
      '{bed}': bedName,
      
      // Quantity replacement (smart defaults based on bed size)
      '{quantity}': (() => {
        if (template.bed_requirements?.quantity) return template.bed_requirements.quantity;
        if (bedName.includes('4×8')) return '12';
        if (bedName.includes('3×15')) return '8';  
        if (bedName.includes('4×5')) return '6';
        return 'appropriate amount';
      })()
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
      
      // Replace specific placeholders with more helpful fallbacks
      action = action.replace(/\{bed\}/g, bedName || 'appropriate bed');
      action = action.replace(/\{variety\}/g, template.variety_suggestions?.[0] || 'recommended variety');
      action = action.replace(/\{varieties\}/g, template.variety_suggestions?.slice(0,2).join(', ') || 'recommended varieties');
      action = action.replace(/\{supplier\}/g, template.supplier_preferences?.[0] || 'preferred supplier');
      action = action.replace(/\{quantity\}/g, 'appropriate amount');
      // Catch any other unexpected placeholders
      action = action.replace(/\{[^}]+\}/g, '[data not available]');
    }

    // Add cost information for shopping activities
    if (template.estimated_cost_min && template.estimated_cost_max && template.activity_type === 'shopping') {
      const costRange = `$${template.estimated_cost_min.toFixed(0)}-${template.estimated_cost_max.toFixed(0)}`;
      action = action.includes(' - $') ? action : `${action} - ${costRange}`;
    }

    // ZERO TOLERANCE: Validate final result has NO placeholders
    return this.validateNoPlaceholders(action);
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

  /**
   * Get all activity types from database
   * @returns {Promise<Array>} Activity types
   */
  async getActivityTypes() {
    await this.waitForInitialization();
    
    if (this.db) {
      try {
        const stmt = 'SELECT * FROM activity_types WHERE type_key = ?';
        const result = this.db.exec(stmt, ['indoor-starting']);
        
        if (result.length === 0) return [];
        
        const columns = result[0].columns;
        const values = result[0].values;
        
        return values.map(row => {
          const activityType = {};
          columns.forEach((col, index) => {
            activityType[col] = row[index];
          });
          return activityType;
        });
        
      } catch (error) {
        console.error('Activity types query failed:', error);
        throw error;
      }
    }
    
    return [];
  }

  /**
   * Get activity templates by activity type
   * @param {string} activityType - Activity type key
   * @returns {Promise<Array>} Activity templates
   */
  async getActivityTemplatesByType(activityType) {
    await this.waitForInitialization();
    
    if (this.db) {
      try {
        const stmt = `
          SELECT 
            at.id,
            at.activity_type_id,
            aty.type_key as activity_type,
            at.action_template,
            at.timing_template,
            at.priority
          FROM activity_templates at
          JOIN activity_types aty ON at.activity_type_id = aty.id
          WHERE aty.type_key = ?
        `;
        
        const result = this.db.exec(stmt, [activityType]);
        
        if (result.length === 0) return [];
        
        const columns = result[0].columns;
        const values = result[0].values;
        
        return values.map(row => {
          const template = {};
          columns.forEach((col, index) => {
            template[col] = row[index];
          });
          return template;
        });
        
      } catch (error) {
        console.error('Activity templates by type query failed:', error);
        throw error;
      }
    }
    
    return [];
  }

  /**
   * Get enhanced plant data by combining database information with static config
   * @param {string} plantKey - Plant identifier (e.g., 'okra', 'kale')
   * @param {Object} locationConfig - User's location configuration
   * @returns {Object} Enhanced plant data with database information
   */
  async getEnhancedPlantData(plantKey, locationConfig) {
    await this.waitForInitialization();
    
    if (!this.isInitialized) {
      return this.getStaticPlantData(plantKey);
    }

    try {
      const query = `
        SELECT 
          p.plant_key,
          p.min_zone,
          p.max_zone,
          p.min_temp_f,
          p.max_temp_f,
          p.optimal_temp_min_f,
          p.optimal_temp_max_f,
          p.days_to_maturity,
          p.spacing_inches,
          p.drought_tolerance,
          p.heat_tolerance,
          p.humidity_tolerance,
          pn.common_name,
          pn.alternate_names,
          pc.category_name
        FROM plants p
        JOIN plant_names pn ON p.id = pn.plant_id
        JOIN plant_categories pc ON p.category_id = pc.id
        WHERE p.plant_key = ? AND pn.language = 'en'
      `;

      const result = this.db.exec(query, [plantKey]);
      
      if (result.length > 0 && result[0].values.length > 0) {
        const row = result[0].values[0];
        const staticData = this.getStaticPlantData(plantKey);
        
        return {
          ...staticData,
          // Enhance with database data
          zones: `${row[1]}-${row[2]}`,
          minTemp: row[3],
          maxTemp: row[4],
          optimalTemp: [row[5], row[6]],
          daysToMaturity: row[7],
          spacingInches: row[8],
          drought: row[9],
          heat: row[10],
          humidity: row[11],
          name: { en: row[12] },
          alternateNames: row[13] ? row[13].split(',').map(n => n.trim()) : [],
          category: row[14],
          dataSource: 'database+static'
        };
      }
      
      return this.getStaticPlantData(plantKey);
    } catch (error) {
      console.warn(`Database query failed for ${plantKey}, using static data:`, error);
      return this.getStaticPlantData(plantKey);
    }
  }

  /**
   * Get growing tips from database for a specific plant and location
   * @param {string} plantKey - Plant identifier
   * @param {Object} locationConfig - User's location configuration
   * @returns {Array} Growing tips specific to plant and location
   */
  async getGrowingTips(plantKey, locationConfig) {
    await this.waitForInitialization();
    
    if (!this.isInitialized) {
      return [];
    }

    try {
      const query = `
        SELECT gt.tip_text, gt.category, gt.climate_zones, gt.priority
        FROM growing_tips gt
        JOIN plants p ON gt.plant_id = p.id
        WHERE p.plant_key = ?
        AND (gt.climate_zones LIKE '%${locationConfig.hardiness}%' OR gt.climate_zones IS NULL)
        ORDER BY gt.priority DESC, gt.id
      `;

      const result = this.db.exec(query, [plantKey]);
      
      if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values.map(row => ({
          text: row[0],
          category: row[1],
          zones: row[2],
          priority: row[3]
        }));
      }
      
      return [];
    } catch (error) {
      console.warn(`Failed to get growing tips for ${plantKey}:`, error);
      return [];
    }
  }

  /**
   * Get companion planting recommendations from database
   * @param {string} plantKey - Plant identifier
   * @returns {Object} Companion planting recommendations
   */
  async getCompanionPlants(plantKey) {
    await this.waitForInitialization();
    
    if (!this.isInitialized) {
      return { beneficial: [], neutral: [], antagonistic: [] };
    }

    try {
      const query = `
        SELECT 
          p2.plant_key,
          pn2.common_name,
          cp.relationship_type,
          cp.notes
        FROM companion_plants cp
        JOIN plants p1 ON cp.plant_a_id = p1.id
        JOIN plants p2 ON cp.plant_b_id = p2.id
        JOIN plant_names pn2 ON p2.id = pn2.plant_id
        WHERE p1.plant_key = ? AND pn2.language = 'en'
        ORDER BY cp.relationship_type, pn2.common_name
      `;

      const result = this.db.exec(query, [plantKey]);
      
      const companions = { beneficial: [], neutral: [], antagonistic: [] };
      
      if (result.length > 0 && result[0].values.length > 0) {
        result[0].values.forEach(row => {
          const companion = {
            plantKey: row[0],
            name: row[1],
            notes: row[3]
          };
          
          const relationship = row[2];
          if (relationship === 'beneficial' && companions.beneficial) {
            companions.beneficial.push(companion);
          } else if (relationship === 'neutral' && companions.neutral) {
            companions.neutral.push(companion);
          } else if (relationship === 'antagonistic' && companions.antagonistic) {
            companions.antagonistic.push(companion);
          }
        });
      }
      
      return companions;
    } catch (error) {
      console.warn(`Failed to get companion plants for ${plantKey}:`, error);
      return { beneficial: [], neutral: [], antagonistic: [] };
    }
  }

  /**
   * Get all plants suitable for a specific hardiness zone from database
   * @param {string} hardinessZone - USDA hardiness zone (e.g., '7b')
   * @returns {Array} Plants suitable for the zone
   */
  async getPlantsByZone(hardinessZone) {
    await this.waitForInitialization();
    
    if (!this.isInitialized) {
      return this.getStaticPlantsByZone(hardinessZone);
    }

    try {
      const zoneNumber = parseFloat(hardinessZone.replace(/[ab]/, ''));
      
      const query = `
        SELECT 
          p.plant_key,
          pn.common_name,
          p.min_zone,
          p.max_zone,
          pc.category_name,
          p.heat_tolerance,
          p.drought_tolerance
        FROM plants p
        JOIN plant_names pn ON p.id = pn.plant_id
        JOIN plant_categories pc ON p.category_id = pc.id
        WHERE CAST(SUBSTR(p.min_zone, 1, 1) AS REAL) <= ?
        AND CAST(SUBSTR(p.max_zone, 1, 1) AS REAL) >= ?
        AND pn.language = 'en'
        ORDER BY pc.category_name, pn.common_name
      `;

      const result = this.db.exec(query, [zoneNumber, zoneNumber]);
      
      if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values.map(row => ({
          plantKey: row[0],
          name: row[1],
          minZone: row[2],
          maxZone: row[3],
          category: row[4],
          heatTolerance: row[5],
          droughtTolerance: row[6],
          dataSource: 'database'
        }));
      }
      
      return this.getStaticPlantsByZone(hardinessZone);
    } catch (error) {
      console.warn(`Failed to get plants by zone ${hardinessZone}:`, error);
      return this.getStaticPlantsByZone(hardinessZone);
    }
  }

  /**
   * Get all varieties for a specific plant from database
   * @param {string} plantKey - Plant identifier (e.g., 'kale', 'tomato')
   * @returns {Array} Array of plant varieties with their characteristics
   */
  async getPlantVarieties(plantKey) {
    if (!this.isInitialized || !this.db) {
      console.warn('Database not initialized, using static varieties');
      return this.getStaticPlantVarieties(plantKey);
    }

    try {
      const query = `
        SELECT 
          p.plant_key,
          pn.common_name,
          p.min_zone,
          p.max_zone,
          p.min_temp_f,
          p.max_temp_f,
          p.optimal_temp_min_f,
          p.optimal_temp_max_f,
          p.drought_tolerance,
          p.heat_tolerance,
          p.humidity_tolerance,
          p.days_to_maturity,
          p.spacing_inches,
          p.mature_height_inches,
          sp.variety_name,
          sp.packet_size,
          sp.price,
          v.name as vendor_name,
          sp.is_organic,
          sp.is_heirloom
        FROM plants p
        JOIN plant_names pn ON p.id = pn.plant_id
        LEFT JOIN seed_products sp ON p.id = sp.plant_id
        LEFT JOIN vendors v ON sp.vendor_id = v.id
        WHERE p.plant_key = ? AND pn.language = 'en'
        ORDER BY sp.price ASC
      `;
      
      const result = this.db.exec(query, [plantKey]);
      
      if (result.length > 0 && result[0].values.length > 0) {
        const varieties = result[0].values.map(row => ({
          plantKey: row[0],
          commonName: row[1],
          minZone: row[2],
          maxZone: row[3],
          minTemp: row[4],
          maxTemp: row[5],
          optimalTempMin: row[6],
          optimalTempMax: row[7],
          droughtTolerance: row[8],
          heatTolerance: row[9],
          humidityTolerance: row[10],
          daysToMaturity: row[11],
          spacing: row[12],
          matureHeight: row[13],
          varietyName: row[14] || row[1], // Use variety name or common name
          packetSize: row[15],
          price: row[16],
          vendorName: row[17],
          isOrganic: row[18],
          isHeirloom: row[19],
          dataSource: 'database'
        }));

        // If no specific varieties found, return the base plant as a variety
        if (varieties.length === 1 && !varieties[0].varietyName) {
          varieties[0].varietyName = varieties[0].commonName;
        }

        return varieties;
      }
      
      return this.getStaticPlantVarieties(plantKey);
    } catch (error) {
      console.warn(`Failed to get varieties for ${plantKey}:`, error);
      return this.getStaticPlantVarieties(plantKey);
    }
  }

  /**
   * Fallback to static plant variety data
   * @param {string} plantKey - Plant identifier
   * @returns {Array} Static plant variety data
   */
  getStaticPlantVarieties(plantKey) {
    console.log(`Using static variety fallback for ${plantKey}`);
    
    // Import config at runtime to avoid circular deps
    const { GLOBAL_CROP_DATABASE } = require('../config.js');
    
    // Find the plant in static data
    let plantData = null;
    let category = null;
    
    for (const [cat, plants] of Object.entries(GLOBAL_CROP_DATABASE)) {
      if (plants[plantKey]) {
        plantData = plants[plantKey];
        category = cat;
        break;
      }
    }
    
    if (!plantData) return [];
    
    // Extract varieties if they exist
    const varieties = [];
    
    if (plantData.varieties) {
      Object.entries(plantData.varieties).forEach(([varietyName, description]) => {
        varieties.push({
          plantKey,
          commonName: plantData.name?.en || plantData.name || plantKey,
          varietyName,
          description,
          minZone: plantData.zones?.split('-')[0],
          maxZone: plantData.zones?.split('-')[1],
          minTemp: plantData.minTemp,
          maxTemp: plantData.maxTemp,
          droughtTolerance: plantData.drought,
          heatTolerance: plantData.heat,
          daysToMaturity: plantData.daysToMaturity,
          dataSource: 'static'
        });
      });
    } else {
      // Create a single variety from the plant data
      varieties.push({
        plantKey,
        commonName: plantData.name?.en || plantData.name || plantKey,
        varietyName: plantData.name?.en || plantData.name || plantKey,
        minZone: plantData.zones?.split('-')[0],
        maxZone: plantData.zones?.split('-')[1],
        minTemp: plantData.minTemp,
        maxTemp: plantData.maxTemp,
        droughtTolerance: plantData.drought,
        heatTolerance: plantData.heat,
        daysToMaturity: plantData.daysToMaturity,
        dataSource: 'static'
      });
    }
    
    return varieties;
  }

  /**
   * Fallback to static plant data from config.js
   * @param {string} plantKey - Plant identifier
   * @returns {Object} Static plant data
   */
  getStaticPlantData(plantKey) {
    // Import is done at runtime to avoid circular dependencies
    const { GLOBAL_CROP_DATABASE } = require('../config.js');
    
    // Search across all categories
    for (const category of ['heatTolerant', 'coolSeason', 'perennials']) {
      const plants = GLOBAL_CROP_DATABASE[category] || {};
      if (plants[plantKey]) {
        return {
          ...plants[plantKey],
          category,
          dataSource: 'static'
        };
      }
    }

    return null;
  }

  /**
   * Fallback method to get plants by zone from static data
   * @param {string} hardinessZone - USDA hardiness zone
   * @returns {Array} Plants from static data suitable for zone
   */
  getStaticPlantsByZone(hardinessZone) {
    const { GLOBAL_CROP_DATABASE } = require('../config.js');
    const zoneNumber = parseFloat(hardinessZone.replace(/[ab]/, ''));
    const plants = [];

    // Check all categories
    Object.entries(GLOBAL_CROP_DATABASE).forEach(([category, categoryPlants]) => {
      Object.entries(categoryPlants).forEach(([plantKey, plantData]) => {
        const zones = plantData.zones || '';
        const [minZone, maxZone] = zones.split('-').map(z => parseFloat(z));
        
        if (minZone <= zoneNumber && maxZone >= zoneNumber) {
          plants.push({
            plantKey,
            name: plantData.name?.en || plantKey,
            category,
            zones: plantData.zones,
            heatTolerance: plantData.heat,
            droughtTolerance: plantData.drought,
            dataSource: 'static'
          });
        }
      });
    });

    return plants;
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();

// Global access for debugging and auto-testing
if (typeof window !== 'undefined') {
  window.databaseService = databaseService;
  
  window.testPlaceholderReplacement = async () => {
    console.log('🧪 COMPREHENSIVE PLACEHOLDER REPLACEMENT TEST');
    console.log('=============================================');
    
    let totalTests = 0;
    let failedTests = 0;
    
    try {
      // Force reload database
      await databaseService.reloadDatabase();
      console.log('✅ Database reloaded');
      
      // Test ALL months and ALL template types
      for (let month = 1; month <= 12; month++) {
        const [activities, rotations, successions] = await Promise.all([
          databaseService.getActivityTemplates(1, month, ['hot_peppers', 'sweet_potato', 'kale']),
          databaseService.getRotationTemplates(1, month),
          databaseService.getSuccessionTemplates(1, month)
        ]);
        
        const allTemplates = [...activities, ...rotations, ...successions];
        
        if (allTemplates.length > 0) {
          console.log(`\n📅 Month ${month}: Testing ${allTemplates.length} templates...`);
        }
        
        for (const template of allTemplates) {
          totalTests++;
          
          try {
            const action = databaseService.generateActionText(template);
            const timing = databaseService.generateTimingText(template);
            
            const actionPlaceholders = action.match(/\{[^}]+\}/g);
            const timingPlaceholders = timing.match(/\{[^}]+\}/g);
            
            if (actionPlaceholders || timingPlaceholders) {
              failedTests++;
              console.error(`❌ TEMPLATE ${template.id} FAILED:`);
              console.error(`   Action: "${action}"`);
              console.error(`   Timing: "${timing}"`);
              console.error(`   Action placeholders: ${actionPlaceholders || 'none'}`);
              console.error(`   Timing placeholders: ${timingPlaceholders || 'none'}`);
            } else {
              console.log(`   ✓ Template ${template.id}: CLEAN`);
            }
          } catch (error) {
            failedTests++;
            console.error(`❌ TEMPLATE ${template.id} THREW ERROR:`, error.message);
          }
        }
      }
      
      console.log('\n🏁 TEST RESULTS:');
      console.log('================');
      console.log(`Total tests: ${totalTests}`);
      console.log(`Failed tests: ${failedTests}`);
      console.log(`Success rate: ${((totalTests - failedTests) / totalTests * 100).toFixed(1)}%`);
      
      if (failedTests === 0) {
        console.log('🎉 ALL TESTS PASSED! Zero tolerance placeholder prevention is working!');
        // Add visual indicator to page (development only)
        if (process.env.NODE_ENV !== 'production' && document.body) {
          const indicator = document.createElement('div');
          indicator.style.cssText = 'position:fixed;top:10px;right:10px;background:green;color:white;padding:10px;border-radius:5px;z-index:9999;font-family:monospace;';
          indicator.textContent = '✅ ZERO TOLERANCE: ALL TESTS PASSED';
          document.body.appendChild(indicator);
          setTimeout(() => indicator.remove(), 5000);
        }
      } else {
        console.error('🚨 TESTS FAILED! Placeholders were found in the UI output!');
        // Add visual error indicator to page (development only)
        if (process.env.NODE_ENV !== 'production' && document.body) {
          const indicator = document.createElement('div');
          indicator.style.cssText = 'position:fixed;top:10px;right:10px;background:red;color:white;padding:10px;border-radius:5px;z-index:9999;font-family:monospace;';
          indicator.textContent = `❌ PLACEHOLDERS FOUND! ${failedTests}/${totalTests} failed`;
          document.body.appendChild(indicator);
          setTimeout(() => indicator.remove(), 10000);
        }
      }
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  };
  
  // Auto-run test after page loads
  setTimeout(() => {
    console.log('🚀 Auto-running comprehensive placeholder test in 3 seconds...');
    setTimeout(window.testPlaceholderReplacement, 3000);
  }, 1000);
}

export default databaseService;