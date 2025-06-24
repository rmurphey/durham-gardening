/**
 * InvestmentConfigurer Component
 * Allows users to configure annual investment amounts based on existing equipment
 */

import React, { useState } from 'react';
import { formatCurrency } from '../config.js';

const InvestmentConfigurer = ({ 
  investmentConfig, 
  onInvestmentChange 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Category descriptions for users with existing equipment
  const categoryInfo = {
    seeds: {
      name: 'Seeds & Plants',
      description: 'Annual seed purchases, transplants, and plant replacements',
      essential: true,
      annualCost: true
    },
    soil: {
      name: 'Soil & Compost',
      description: 'Annual soil amendments, compost, fertilizer',
      essential: true,
      annualCost: true
    },
    fertilizer: {
      name: 'Fertilizer & Nutrients',
      description: 'Organic fertilizers, liquid nutrients, soil boosters',
      essential: true,
      annualCost: true
    },
    protection: {
      name: 'Plant Protection',
      description: 'Row covers, mulch, pest management supplies',
      essential: true,
      annualCost: true
    },
    infrastructure: {
      name: 'Infrastructure',
      description: 'Beds, trellises, stakes - mostly one-time purchases',
      essential: false,
      annualCost: false
    },
    tools: {
      name: 'Tools & Equipment',
      description: 'Hand tools, power tools - multi-year investments',
      essential: false,
      annualCost: false
    },
    containers: {
      name: 'Containers & Pots',
      description: 'Pots, planters, grow bags - multi-year investments',
      essential: false,
      annualCost: false
    },
    irrigation: {
      name: 'Irrigation System',
      description: 'Drip lines, timers, hoses - mostly one-time setup',
      essential: false,
      annualCost: false
    }
  };

  // Calculate total investment
  const totalInvestment = Object.values(investmentConfig).reduce((sum, value) => sum + value, 0);
  const annualCosts = Object.entries(investmentConfig)
    .filter(([category]) => categoryInfo[category]?.annualCost)
    .reduce((sum, [, value]) => sum + value, 0);
  const equipmentCosts = totalInvestment - annualCosts;

  // Handle category value changes
  const handleCategoryChange = (category, value) => {
    const numValue = parseInt(value) || 0;
    const newConfig = {
      ...investmentConfig,
      [category]: numValue
    };
    onInvestmentChange(newConfig);
  };

  // Preset configurations for users with existing equipment
  const presetConfigs = {
    established: {
      name: 'Established Garden',
      description: 'You have most equipment, focus on annual costs',
      config: {
        seeds: 100,
        soil: 50,
        fertilizer: 40,
        protection: 30,
        infrastructure: 20,
        tools: 10,
        containers: 15,
        irrigation: 10
      }
    },
    minimal: {
      name: 'Minimal Annual',
      description: 'Just seeds, soil, and basic supplies',
      config: {
        seeds: 75,
        soil: 35,
        fertilizer: 25,
        protection: 20,
        infrastructure: 0,
        tools: 0,
        containers: 0,
        irrigation: 0
      }
    },
    selective: {
      name: 'Selective Upgrades',
      description: 'Annual costs plus some equipment upgrades',
      config: {
        seeds: 85,
        soil: 45,
        fertilizer: 35,
        protection: 25,
        infrastructure: 40,
        tools: 20,
        containers: 25,
        irrigation: 30
      }
    }
  };

  const applyPreset = (presetKey) => {
    onInvestmentChange(presetConfigs[presetKey].config);
  };

  return (
    <section className="card investment-configurer">
      <div className="card-header">
        <h2 className="card-title">Annual Investment Configuration</h2>
        <p className="card-subtitle">
          Configure your annual garden investment based on existing equipment
        </p>
      </div>

      {/* Investment Summary */}
      <div className="investment-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <strong>Total Annual: {formatCurrency(totalInvestment)}</strong>
          </div>
          <div className="stat-item">
            Annual Costs: {formatCurrency(annualCosts)}
          </div>
          <div className="stat-item">
            Equipment: {formatCurrency(equipmentCosts)}
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="preset-section">
        <h3>Quick Presets</h3>
        <div className="preset-grid">
          {Object.entries(presetConfigs).map(([key, preset]) => (
            <button
              key={key}
              className="preset-button"
              onClick={() => applyPreset(key)}
            >
              <strong>{preset.name}</strong>
              <div className="preset-description">{preset.description}</div>
              <div className="preset-total">
                {formatCurrency(Object.values(preset.config).reduce((sum, value) => sum + value, 0))}/year
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Configuration Toggle */}
      <div className="advanced-toggle">
        <button
          className="toggle-button"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Configuration
        </button>
      </div>

      {/* Advanced Category Configuration */}
      {showAdvanced && (
        <div className="advanced-config">
          <h3>Detailed Configuration</h3>
          <div className="category-grid">
            {Object.entries(categoryInfo).map(([category, info]) => (
              <div key={category} className={`category-item ${info.essential ? 'essential' : 'optional'}`}>
                <div className="category-header">
                  <h4>{info.name}</h4>
                  <span className={`category-badge ${info.annualCost ? 'annual' : 'equipment'}`}>
                    {info.annualCost ? 'Annual' : 'Equipment'}
                  </span>
                </div>
                <p className="category-description">{info.description}</p>
                <div className="category-input">
                  <label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={investmentConfig[category] || 0}
                      onChange={(e) => handleCategoryChange(category, e.target.value)}
                      className="investment-slider"
                    />
                    <span className="investment-value">{formatCurrency(investmentConfig[category] || 0)}</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="investment-recommendations">
        <h3>💡 Recommendations</h3>
        <div className="recommendations-grid">
          {equipmentCosts > annualCosts && (
            <div className="recommendation-item warning">
              <strong>High Equipment Costs</strong>
              <p>You're allocating {formatCurrency(equipmentCosts)} to equipment vs {formatCurrency(annualCosts)} for annual costs. 
              Consider using the "Established Garden" preset if you already have most equipment.</p>
            </div>
          )}
          {totalInvestment < 150 && (
            <div className="recommendation-item info">
              <strong>Low Investment</strong>
              <p>Your total investment of {formatCurrency(totalInvestment)} may limit garden productivity. 
              Consider increasing seed and soil budgets for better results.</p>
            </div>
          )}
          {annualCosts > 0 && (
            <div className="recommendation-item success">
              <strong>Sustainable Approach</strong>
              <p>Focusing on annual costs ({formatCurrency(annualCosts)}) is smart for established gardens. 
              Your equipment investments ({formatCurrency(equipmentCosts)}) will pay off over multiple seasons.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default InvestmentConfigurer;