import { getDatabaseService } from './databaseService';

/**
 * Service for managing garden layout templates and bed standards
 * Provides read-only access to layout templates stored in SQLite database
 */
class GardenLayoutService {
  constructor() {
    this.dbService = null;
  }

  async initialize() {
    if (!this.dbService) {
      this.dbService = await getDatabaseService();
    }
    return this.dbService;
  }

  /**
   * Get all available layout templates
   * @returns {Promise<Array>} Array of layout template objects
   */
  async getLayoutTemplates() {
    await this.initialize();
    
    const query = `
      SELECT 
        id,
        name,
        description,
        template_type,
        typical_width,
        typical_height,
        bed_count,
        template_config,
        suitable_for,
        difficulty_level
      FROM layout_templates
      ORDER BY difficulty_level, name
    `;
    
    const results = this.dbService.executeQuery(query);
    return results.map(template => ({
      ...template,
      template_config: template.template_config ? JSON.parse(template.template_config) : null,
      suitable_for: template.suitable_for ? JSON.parse(template.suitable_for) : []
    }));
  }

  /**
   * Get layout templates by type
   * @param {string} templateType - Type of template ('rectangular', 'keyhole', etc.)
   * @returns {Promise<Array>} Filtered array of layout templates
   */
  async getLayoutTemplatesByType(templateType) {
    await this.initialize();
    
    const query = `
      SELECT 
        id,
        name,
        description,
        template_type,
        typical_width,
        typical_height,
        bed_count,
        template_config,
        suitable_for,
        difficulty_level
      FROM layout_templates
      WHERE template_type = ?
      ORDER BY difficulty_level, name
    `;
    
    const results = this.dbService.executeQuery(query, [templateType]);
    return results.map(template => ({
      ...template,
      template_config: template.template_config ? JSON.parse(template.template_config) : null,
      suitable_for: template.suitable_for ? JSON.parse(template.suitable_for) : []
    }));
  }

  /**
   * Get bed standards by type
   * @param {string} bedType - Type of bed ('raised', 'ground', 'container', etc.)
   * @returns {Promise<Array>} Array of bed standard objects
   */
  async getBedStandards(bedType = null) {
    await this.initialize();
    
    let query = `
      SELECT 
        id,
        bed_type,
        typical_width,
        typical_length,
        typical_height,
        min_spacing,
        max_reach,
        soil_volume,
        cost_estimate_min,
        cost_estimate_max,
        notes
      FROM bed_standards
    `;
    
    const params = [];
    if (bedType) {
      query += ' WHERE bed_type = ?';
      params.push(bedType);
    }
    
    query += ' ORDER BY bed_type, typical_width';
    
    return this.dbService.executeQuery(query, params);
  }

  /**
   * Get layout recommendations for a specific plant
   * @param {number} plantId - ID of the plant
   * @returns {Promise<Object|null>} Layout recommendation object or null
   */
  async getPlantLayoutRecommendations(plantId) {
    await this.initialize();
    
    const query = `
      SELECT 
        lr.*,
        pd.common_name,
        pd.plant_key
      FROM layout_recommendations lr
      JOIN plant_details pd ON lr.plant_id = pd.id AND pd.language = 'en'
      WHERE lr.plant_id = ?
    `;
    
    const results = this.dbService.executeQuery(query, [plantId]);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get layout recommendations for multiple plants
   * @param {Array<number>} plantIds - Array of plant IDs
   * @returns {Promise<Array>} Array of layout recommendation objects
   */
  async getMultiplePlantLayoutRecommendations(plantIds) {
    if (!plantIds || plantIds.length === 0) return [];
    
    await this.initialize();
    
    const placeholders = plantIds.map(() => '?').join(',');
    const query = `
      SELECT 
        lr.*,
        pd.common_name,
        pd.plant_key
      FROM layout_recommendations lr
      JOIN plant_details pd ON lr.plant_id = pd.id AND pd.language = 'en'
      WHERE lr.plant_id IN (${placeholders})
      ORDER BY pd.common_name
    `;
    
    return this.dbService.executeQuery(query, plantIds);
  }

  /**
   * Generate a basic layout configuration from a template
   * @param {number} templateId - ID of the layout template
   * @param {Object} gardenDimensions - {width, height} of the garden space
   * @returns {Promise<Object>} Basic layout configuration
   */
  async generateLayoutFromTemplate(templateId, gardenDimensions) {
    await this.initialize();
    
    const query = `
      SELECT 
        name,
        template_type,
        template_config,
        bed_count
      FROM layout_templates
      WHERE id = ?
    `;
    
    const results = this.dbService.executeQuery(query, [templateId]);
    if (results.length === 0) {
      throw new Error(`Layout template with ID ${templateId} not found`);
    }
    
    const template = results[0];
    const config = template.template_config ? JSON.parse(template.template_config) : {};
    
    // Generate basic layout based on template type
    return this.generateBasicLayoutConfig(
      template.template_type,
      config,
      gardenDimensions,
      template.bed_count
    );
  }

  /**
   * Generate basic layout configuration based on template type
   * @private
   */
  generateBasicLayoutConfig(templateType, templateConfig, gardenDimensions, bedCount) {
    const { width, height } = gardenDimensions;
    
    switch (templateType) {
      case 'rectangular':
        return this.generateRectangularLayout(width, height, bedCount, templateConfig);
      case 'square_foot':
        return this.generateSquareFootLayout(width, height, templateConfig);
      case 'raised_beds':
        return this.generateRaisedBedLayout(width, height, bedCount, templateConfig);
      case 'keyhole':
        return this.generateKeyholeLayout(width, height, templateConfig);
      case 'container':
        return this.generateContainerLayout(width, height, bedCount, templateConfig);
      default:
        return this.generateRectangularLayout(width, height, bedCount, templateConfig);
    }
  }

  /**
   * Generate rectangular grid layout
   * @private
   */
  generateRectangularLayout(gardenWidth, gardenHeight, bedCount, config) {
    const bedWidth = config.bed_width || 4;
    const bedHeight = config.bed_height || 8;
    const pathWidth = config.path_width || 2;
    
    const bedsPerRow = Math.floor((gardenWidth + pathWidth) / (bedWidth + pathWidth));
    const rows = Math.ceil(bedCount / bedsPerRow);
    
    const beds = [];
    let bedId = 1;
    
    for (let row = 0; row < rows && bedId <= bedCount; row++) {
      for (let col = 0; col < bedsPerRow && bedId <= bedCount; col++) {
        beds.push({
          id: `bed-${bedId}`,
          name: `Bed ${bedId}`,
          x: col * (bedWidth + pathWidth),
          y: row * (bedHeight + pathWidth),
          width: bedWidth,
          height: bedHeight,
          type: 'raised',
          soilType: 'loam',
          sunExposure: 'full_sun'
        });
        bedId++;
      }
    }
    
    return {
      type: 'rectangular',
      totalDimensions: { width: gardenWidth, height: gardenHeight },
      beds,
      paths: this.generatePathsBetweenBeds(beds, pathWidth),
      metadata: {
        bedCount: beds.length,
        totalBedArea: beds.reduce((sum, bed) => sum + (bed.width * bed.height), 0),
        pathWidth
      }
    };
  }

  /**
   * Generate square foot garden layout
   * @private
   */
  generateSquareFootLayout(gardenWidth, gardenHeight, config) {
    const squareSize = config.square_size || 1;
    const bedWidth = config.bed_width || 4;
    const bedHeight = config.bed_height || 4;
    
    return {
      type: 'square_foot',
      totalDimensions: { width: gardenWidth, height: gardenHeight },
      beds: [{
        id: 'bed-1',
        name: 'Square Foot Garden',
        x: (gardenWidth - bedWidth) / 2,
        y: (gardenHeight - bedHeight) / 2,
        width: bedWidth,
        height: bedHeight,
        type: 'raised',
        soilType: 'loam',
        sunExposure: 'full_sun',
        gridSize: squareSize,
        squares: this.generateSquareFootGrid(bedWidth, bedHeight, squareSize)
      }],
      paths: [],
      metadata: {
        squareSize,
        totalSquares: (bedWidth / squareSize) * (bedHeight / squareSize)
      }
    };
  }

  /**
   * Generate raised bed layout
   * @private
   */
  generateRaisedBedLayout(gardenWidth, gardenHeight, bedCount, config) {
    // Similar to rectangular but with raised bed specifications
    const layout = this.generateRectangularLayout(gardenWidth, gardenHeight, bedCount, config);
    layout.type = 'raised_beds';
    layout.beds.forEach(bed => {
      bed.type = 'raised';
      bed.height_inches = config.bed_height_inches || 12;
    });
    return layout;
  }

  /**
   * Generate keyhole garden layout
   * @private
   */
  generateKeyholeLayout(gardenWidth, gardenHeight, config) {
    const radius = Math.min(gardenWidth, gardenHeight) / 2 - 1;
    const centerX = gardenWidth / 2;
    const centerY = gardenHeight / 2;
    
    return {
      type: 'keyhole',
      totalDimensions: { width: gardenWidth, height: gardenHeight },
      beds: [{
        id: 'keyhole-1',
        name: 'Keyhole Garden',
        x: centerX - radius,
        y: centerY - radius,
        width: radius * 2,
        height: radius * 2,
        type: 'keyhole',
        shape: 'circle',
        centerX,
        centerY,
        radius,
        soilType: 'loam',
        sunExposure: 'full_sun'
      }],
      paths: [{
        id: 'keyhole-path',
        type: 'keyhole_access',
        points: [
          { x: centerX, y: centerY - radius },
          { x: centerX, y: centerY }
        ]
      }],
      compostBin: {
        x: centerX - 1,
        y: centerY - 1,
        width: 2,
        height: 2
      }
    };
  }

  /**
   * Generate container garden layout
   * @private
   */
  generateContainerLayout(gardenWidth, gardenHeight, containerCount, config) {
    const containerSize = config.container_size || 2;
    const spacing = config.spacing || 1;
    
    const containersPerRow = Math.floor((gardenWidth + spacing) / (containerSize + spacing));
    const rows = Math.ceil(containerCount / containersPerRow);
    
    const containers = [];
    let containerId = 1;
    
    for (let row = 0; row < rows && containerId <= containerCount; row++) {
      for (let col = 0; col < containersPerRow && containerId <= containerCount; col++) {
        containers.push({
          id: `container-${containerId}`,
          name: `Container ${containerId}`,
          x: col * (containerSize + spacing),
          y: row * (containerSize + spacing),
          width: containerSize,
          height: containerSize,
          type: 'container',
          shape: config.container_shape || 'square',
          soilType: 'potting_mix',
          sunExposure: 'full_sun'
        });
        containerId++;
      }
    }
    
    return {
      type: 'container',
      totalDimensions: { width: gardenWidth, height: gardenHeight },
      beds: containers,
      paths: [],
      metadata: {
        containerCount: containers.length,
        containerSize,
        spacing
      }
    };
  }

  /**
   * Generate paths between beds
   * @private
   */
  generatePathsBetweenBeds(beds, pathWidth) {
    // Simple implementation - could be enhanced with more sophisticated path routing
    return beds.map((bed, index) => ({
      id: `path-${index + 1}`,
      type: 'main_path',
      width: pathWidth,
      connectedBeds: [bed.id]
    }));
  }

  /**
   * Generate square foot grid
   * @private
   */
  generateSquareFootGrid(bedWidth, bedHeight, squareSize) {
    const squares = [];
    const squaresWide = bedWidth / squareSize;
    const squaresTall = bedHeight / squareSize;
    
    for (let row = 0; row < squaresTall; row++) {
      for (let col = 0; col < squaresWide; col++) {
        squares.push({
          id: `square-${row}-${col}`,
          x: col * squareSize,
          y: row * squareSize,
          size: squareSize,
          planted: false,
          crop: null
        });
      }
    }
    
    return squares;
  }
}

// Export singleton instance
const gardenLayoutService = new GardenLayoutService();
export default gardenLayoutService;

// Export service class for testing
export { GardenLayoutService };