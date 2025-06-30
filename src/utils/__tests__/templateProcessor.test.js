/**
 * Tests for templateProcessor.js
 * Validates template processing, placeholder replacement, and validation logic
 */

import { 
  validateNoPlaceholders, 
  generateTimingText, 
  generateActionText
} from '../templateProcessor';

describe('templateProcessor', () => {
  test('validateNoPlaceholders passes validation for text without placeholders', () => {
    expect(validateNoPlaceholders('Plant seeds in early spring')).toBe('Plant seeds in early spring');
    expect(validateNoPlaceholders('')).toBe('');
  });

  test('validateNoPlaceholders throws error for text with placeholders', () => {
    expect(() => validateNoPlaceholders('Plant {crop}')).toThrow(/Template placeholders FORBIDDEN in UI/);
  });

  test('validateNoPlaceholders logs error details to console', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    
    expect(() => validateNoPlaceholders('Text with {placeholder}')).toThrow();
    expect(consoleSpy).toHaveBeenCalledWith('CRITICAL ERROR: Placeholders detected:', ['{placeholder}']);
    consoleSpy.mockRestore();
  });

  test('generateTimingText processes bed placeholder in timing templates', () => {
    const template = {
      timing_template: 'Plant in {bed}',
      bed_requirements: {
        recommended_bed: '4x8_bed'
      }
    };

    const result = generateTimingText(template);
    expect(result).toContain('4×8 Bed');
    expect(result).not.toContain('{bed}');
  });

  test('generateTimingText handles templates without placeholders', () => {
    const template = {
      timing_template: 'Plant in early spring'
    };

    const result = generateTimingText(template);
    expect(result).toBe('Plant in early spring');
  });

  test('generateTimingText replaces unknown placeholders with fallbacks', () => {
    const template = {
      timing_template: 'Plant in {unknownPlaceholder}'
    };

    const result = generateTimingText(template);
    expect(result).toBe('Plant in [data not available]');
  });

  test('generateTimingText processes variety placeholders', () => {
    const template = {
      timing_template: 'Plant {variety}',
      variety_suggestions: ['Tomato', 'Pepper']
    };

    const result = generateTimingText(template);
    expect(result).toContain('Tomato');
  });

  test('generateActionText processes bed placeholder in action templates', () => {
    const template = {
      action_template: 'Water plants in {bed}',
      bed_requirements: {
        recommended_bed: '4x8_bed'
      }
    };

    const result = generateActionText(template);
    expect(result).toContain('4×8 Bed');
  });

  test('generateActionText handles templates without placeholders', () => {
    const template = {
      action_template: 'Water regularly'
    };

    const result = generateActionText(template);
    expect(result).toBe('Water regularly');
  });

  test('generateActionText handles function templates', () => {
    const template = {
      action_template: (data) => `Plant ${data.variety} in ${data.bed}`
    };

    const result = generateActionText(template);
    expect(result).toContain('recommended variety');
    expect(result).toContain('available bed');
  });

  test('generateActionText adds cost information for shopping activities', () => {
    const template = {
      action_template: 'Buy seeds',
      estimated_cost_min: 5,
      estimated_cost_max: 15,
      activity_type: 'shopping'
    };

    const result = generateActionText(template);
    expect(result).toContain('$5-15');
  });

  test('complete template processing workflow', () => {
    const template = {
      timing_template: 'Plant {variety} in {bed}',
      action_template: 'Water {variety} regularly',
      variety_suggestions: ['Tomato'],
      bed_requirements: {
        recommended_bed: '4x8_bed'
      }
    };

    const timingResult = generateTimingText(template);
    const actionResult = generateActionText(template);

    expect(timingResult).toContain('Tomato');
    expect(timingResult).toContain('4×8 Bed');
    expect(actionResult).toContain('Tomato');

    expect(() => validateNoPlaceholders(timingResult)).not.toThrow();
    expect(() => validateNoPlaceholders(actionResult)).not.toThrow();
  });
});