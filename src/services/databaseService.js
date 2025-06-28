/**
 * Database Service for Garden Calendar
 * Provides abstraction layer for SQLite database operations using sql.js
 */

import initSqlJs from 'sql.js';
import { activityTemplates, rotationTemplates, successionTemplates } from '../data/fallbackActivityTemplates.js';
import { generateActionText, generateTimingText, validateNoPlaceholders } from '../utils/templateProcessor.js';

class DatabaseService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.initializationPromise = null;
    
    // Only initialize in constructor for production builds
    // In development, use lazy loading to avoid dev server conflicts
    if (process.env.NODE_ENV === 'production') {
      this.initializeDatabase();
    }
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
   * @returns {Promise<void>}
   * @throws {Error} If database reload fails
   */
  async reloadDatabase() {
    this.isInitialized = false;
    this.db = null;
    await this.initializeDatabase(true);
  }

  /**
   * Wait for database initialization to complete
   * @returns {Promise<void>}
   */
  async waitForInitialization() {
    // Wait for database to be initialized
    while (!this.isInitialized && !this.fallbackData) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  loadFallbackData() {
    console.log('Loading fallback activity data');
    this.fallbackData = true;
    
    // Use imported templates instead of hard-coded data
    this.activityTemplates = activityTemplates;
    this.rotationTemplates = rotationTemplates;
    this.successionTemplates = successionTemplates;
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
    const fallbackResults = activityTemplates?.filter(template => 
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
    return rotationTemplates?.filter(template => template.month === month) || [];
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
    return successionTemplates?.filter(template => template.month === month) || [];
  }

  /**
   * @deprecated Use validateNoPlaceholders from templateProcessor.js
   */
  validateNoPlaceholders(text) {
    return validateNoPlaceholders(text);
  }

  /**
   * @deprecated Use generateTimingText from templateProcessor.js
   */
  generateTimingText(template) {
    return generateTimingText(template);
  }

  /**
   * @deprecated Use generateActionText from templateProcessor.js
   */
  generateActionText(template) {
    return generateActionText(template);
  }


  /**
   * Get predefined garden bed configurations
   * @param {number} [gardenId=1] - Garden identifier (currently unused)
   * @returns {Promise<Array<Object>>} Garden bed definitions
   * @property {number} id - Bed identifier
   * @property {string} name - Display name (e.g., '4×8 Bed')
   * @property {number} length - Length in feet
   * @property {number} width - Width in feet  
   * @property {number} area - Area in square feet
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
   * Get all crops from database in format compatible with GLOBAL_CROP_DATABASE
   * @returns {Object} Crops organized by category (heatTolerant, coolSeason, perennials)
   */
  async getAllCropsFromDatabase() {
    if (!this.isInitialized) {
      console.log('Database not initialized, using static fallback');
      return this.getStaticCropDatabase();
    }

    try {
      const query = `
        SELECT 
          p.plant_key,
          pn.common_name,
          p.min_zone,
          p.max_zone,
          p.min_temp,
          p.max_temp,
          p.planting_months,
          p.harvest_start_month,
          p.harvest_duration,
          p.drought_tolerance,
          p.heat_tolerance,
          p.humidity_tolerance,
          p.days_to_maturity,
          p.plant_type,
          p.optimal_temp_min,
          p.optimal_temp_max
        FROM plants p
        JOIN plant_names pn ON p.id = pn.plant_id
        WHERE pn.language = 'en'
        ORDER BY p.plant_key
      `;

      const result = this.db.exec(query);
      if (!result.length) return this.getStaticCropDatabase();

      const crops = {
        heatTolerant: {},
        coolSeason: {},
        perennials: {}
      };

      result[0].values.forEach(row => {
        const [
          plantKey, commonName, minZone, maxZone, minTemp, maxTemp,
          plantingMonths, harvestStart, harvestDuration, drought, heat, humidity,
          daysToMaturity, plantType, optimalTempMin, optimalTempMax
        ] = row;

        // Parse planting months from JSON string
        let plantingMonthsArray = [];
        try {
          plantingMonthsArray = JSON.parse(plantingMonths || '[]');
        } catch (e) {
          console.warn(`Failed to parse planting months for ${plantKey}:`, plantingMonths);
          plantingMonthsArray = [];
        }

        // Determine category based on heat tolerance
        let category = 'coolSeason';
        if (heat === 'excellent' || heat === 'good') {
          category = 'heatTolerant';
        } else if (plantType === 'perennial' || plantType === 'herb') {
          category = 'perennials';
        }

        crops[category][plantKey] = {
          name: { en: commonName },
          zones: `${minZone}-${maxZone}`,
          minTemp: minTemp,
          maxTemp: maxTemp,
          optimalTemp: [optimalTempMin || 15, optimalTempMax || 25],
          plantingMonths: { temperate: plantingMonthsArray },
          harvestStart: harvestStart || 2,
          harvestDuration: harvestDuration || 2,
          transplantWeeks: 0,
          drought: drought || 'moderate',
          heat: heat || 'moderate',
          humidity: humidity || 'moderate',
          daysToMaturity: daysToMaturity || 60,
          dataSource: 'database'
        };
      });

      console.log(`Loaded ${Object.keys(crops.heatTolerant).length + Object.keys(crops.coolSeason).length + Object.keys(crops.perennials).length} crops from database`);
      return crops;

    } catch (error) {
      console.error('Error loading crops from database:', error);
      return this.getStaticCropDatabase();
    }
  }

  /**
   * Get static crop database as fallback
   * @returns {Object} Static crop data
   */
  getStaticCropDatabase() {
    console.log('Using static crop database fallback');
    const { GLOBAL_CROP_DATABASE } = require('../config.js');
    return GLOBAL_CROP_DATABASE;
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
    
    for (const [/* category */, plants] of Object.entries(GLOBAL_CROP_DATABASE)) {
      if (plants[plantKey]) {
        plantData = plants[plantKey];
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

// Global access for debugging
if (typeof window !== 'undefined') {
  window.databaseService = databaseService;
}

export default databaseService;