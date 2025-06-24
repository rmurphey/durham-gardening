/**
 * PortfolioManager Component
 * Handles portfolio strategy selection and custom portfolio building
 */

import React from 'react';

const PortfolioManager = ({
  portfolioStrategies,
  selectedPortfolio,
  onPortfolioChange,
  onCustomPortfolioChange
}) => {
  if (!portfolioStrategies) {
    return (
      <section className="card portfolio-section">
        <div className="card-header">
          <h2 className="card-title">Portfolio Strategy</h2>
        </div>
        <p>Loading portfolio strategies...</p>
      </section>
    );
  }

  return (
    <section className="card portfolio-section">
      <div className="card-header">
        <h2 className="card-title">Portfolio Strategy</h2>
        <p className="card-subtitle">Choose your garden diversification approach</p>
      </div>
      <div className="portfolio-grid">
        {Object.entries(portfolioStrategies).map(([key, strategy]) => (
          <button
            key={key}
            className={`portfolio-button ${selectedPortfolio === key ? 'selected' : ''}`}
            onClick={() => onPortfolioChange(key)}
          >
            <strong>{strategy.name}</strong>
            <div className="portfolio-description">{strategy.description}</div>
            <div className="portfolio-allocations">
              <div>Heat Crops: <span className="allocation-value">{strategy.heatSpecialists}%</span></div>
              <div>Cool Crops: <span className="allocation-value">{strategy.coolSeason}%</span></div>
              <div>Herbs: <span className="allocation-value">{strategy.perennials}%</span></div>
              <div>Experimental: <span className="allocation-value">{strategy.experimental}%</span></div>
            </div>
          </button>
        ))}
      </div>

      {/* Custom Portfolio Builder */}
      {selectedPortfolio === 'custom' && (
        <div className="custom-portfolio">
          <h3>Custom Portfolio Builder</h3>
          <p>Adjust allocations to create your custom strategy:</p>
          <div className="allocation-sliders">
            <div className="slider-group">
              <label>Heat-Tolerant Crops</label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="30"
                onChange={(e) => onCustomPortfolioChange && onCustomPortfolioChange('heatSpecialists', parseInt(e.target.value))}
                className="allocation-slider"
              />
            </div>
            <div className="slider-group">
              <label>Cool-Season Crops</label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="40"
                onChange={(e) => onCustomPortfolioChange && onCustomPortfolioChange('coolSeason', parseInt(e.target.value))}
                className="allocation-slider"
              />
            </div>
            <div className="slider-group">
              <label>Perennial Herbs</label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="20"
                onChange={(e) => onCustomPortfolioChange && onCustomPortfolioChange('perennials', parseInt(e.target.value))}
                className="allocation-slider"
              />
            </div>
            <div className="slider-group">
              <label>Experimental Varieties</label>
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="10"
                onChange={(e) => onCustomPortfolioChange && onCustomPortfolioChange('experimental', parseInt(e.target.value))}
                className="allocation-slider"
              />
            </div>
          </div>
          <div className="allocation-note">
            <p>Note: Allocations should total 100% for optimal results</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default PortfolioManager;