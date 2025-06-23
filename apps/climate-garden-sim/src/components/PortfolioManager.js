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
      <section className="portfolio-section">
        <h2>Portfolio Strategy</h2>
        <p>Loading portfolio strategies...</p>
      </section>
    );
  }

  return (
    <section className="portfolio-section">
      <h2>Portfolio Strategy</h2>
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
              <div>Heat Crops: {strategy.heatSpecialists}%</div>
              <div>Cool Crops: {strategy.coolSeason}%</div>
              <div>Herbs: {strategy.perennials}%</div>
              <div>Experimental: {strategy.experimental}%</div>
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