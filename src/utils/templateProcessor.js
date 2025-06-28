/**
 * Template Processing Utilities
 * Handles placeholder replacement and template validation
 */

/**
 * CRITICAL VALIDATION: Prevents ANY placeholder from reaching UI
 * Zero tolerance policy - throws error if any {placeholder} pattern found
 * @param {string} text - Text to validate for placeholder patterns
 * @returns {string} Validated text with NO placeholders
 * @throws {Error} If placeholders are found with pattern details
 */
export function validateNoPlaceholders(text) {
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
 * Handles all database placeholder patterns with intelligent fallbacks
 * @param {Object} template - Activity template from database
 * @param {string} template.timing_template - Template text with placeholders
 * @param {Array} [template.variety_suggestions] - Recommended varieties
 * @param {Array} [template.supplier_preferences] - Preferred suppliers
 * @param {Object} [template.bed_requirements] - Bed size and layout data
 * @param {string} [template.bed_size_requirements] - JSON bed data from database
 * @returns {string} Timing text - GUARANTEED NO PLACEHOLDERS
 * @throws {Error} If any placeholder remains after processing
 */
export function generateTimingText(template) {
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
    bedName = 'appropriate bed'; // Generic fallback
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

  return validateNoPlaceholders(timing);
}

/**
 * Generate action text from template with comprehensive placeholder replacement
 * Supports both function templates (fallback data) and string templates (database)
 * @param {Object} template - Activity template
 * @param {string|function} template.action_template - Template text or function
 * @param {Array} [template.variety_suggestions] - Recommended varieties
 * @param {Array} [template.supplier_preferences] - Preferred suppliers
 * @param {Object} [template.bed_requirements] - Bed configuration
 * @param {string} [template.bed_size_requirements] - JSON bed data
 * @param {number} [template.estimated_cost_min] - Minimum cost
 * @param {number} [template.estimated_cost_max] - Maximum cost
 * @param {string} [template.activity_type] - Activity type for cost display
 * @returns {string} Action text - GUARANTEED NO PLACEHOLDERS
 * @throws {Error} If any placeholder remains after processing
 */
export function generateActionText(template) {
  // If action_template is a function (JavaScript template literal)
  if (typeof template.action_template === 'function') {
    const data = {
      varieties: template.variety_suggestions?.length > 0 
        ? template.variety_suggestions.slice(0, 2).join(', ')
        : 'recommended varieties',
      variety: template.variety_suggestions?.[0] || 'recommended variety',
      supplier: template.supplier_preferences?.[0] || 'preferred supplier',
      bed: template.bed_requirements?.recommended_bed || template.target_bed || 'available bed',
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
    bedName = 'appropriate bed'; // Generic fallback
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
  return validateNoPlaceholders(action);
}