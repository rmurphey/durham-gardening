/**
 * Enhanced Plant Recommendations Component
 * Displays location-specific plant data and growing tips from the database
 */

import React, { useState, useEffect } from 'react';
import { getEnhancedLocationRecommendations } from '../services/enhancedLocationRecommendations.js';

const EnhancedPlantRecommendations = ({ locationConfig }) => {
  const [enhancedData, setEnhancedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEnhancedRecommendations = async () => {
      if (!locationConfig) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const recommendations = await getEnhancedLocationRecommendations(locationConfig);
        setEnhancedData(recommendations);
      } catch (err) {
        setError(err.message);
        console.error('Failed to load enhanced recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEnhancedRecommendations();
  }, [locationConfig]);

  if (!locationConfig) {
    return (
      <div className="database-demo">
        <h3>🌱 Enhanced Plant Recommendations</h3>
        <p>Location configuration required to show enhanced recommendations.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="database-demo">
        <h3>🌱 Enhanced Plant Recommendations</h3>
        <p>Loading enhanced plant data from database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="database-demo">
        <h3>🌱 Enhanced Plant Recommendations</h3>
        <p style={{ color: 'orange' }}>
          Database integration in progress. Using static data fallback.
          <br />
          <small>Error: {error}</small>
        </p>
      </div>
    );
  }

  if (!enhancedData || enhancedData.crops.length === 0) {
    return (
      <div className="database-demo">
        <h3>🌱 Enhanced Plant Recommendations</h3>
        <p>No enhanced recommendations available for {locationConfig.name}.</p>
      </div>
    );
  }

  return (
    <div className="database-demo">
      <h3>🌱 Enhanced Plant Recommendations</h3>
      
      {/* Summary */}
      <div className="summary-section">
        <h4>📊 Location Summary for {locationConfig.name}</h4>
        <div className="summary-stats">
          <div className="stat-item">
            <strong>{enhancedData.summary.totalSuitableCrops}</strong>
            <span>suitable crops</span>
          </div>
          <div className="stat-item">
            <strong>{enhancedData.summary.heatTolerantOptions}</strong>
            <span>heat-tolerant</span>
          </div>
          <div className="stat-item">
            <strong>{enhancedData.summary.droughtTolerantOptions}</strong>
            <span>drought-tolerant</span>
          </div>
        </div>
        <p><strong>Primary challenge:</strong> {enhancedData.summary.locationChallenge}</p>
        <p><strong>Top recommendation:</strong> {enhancedData.summary.topRecommendation}</p>
      </div>

      {/* Enhanced Crop Recommendations */}
      <div className="crops-section">
        <h4>🌱 Enhanced Crop Recommendations</h4>
        {enhancedData.crops.slice(0, 5).map((crop, index) => (
          <div key={crop.plantKey} className="crop-card">
            <div className="crop-header">
              <h5>{crop.name}</h5>
              <span className="suitability-score">
                {(crop.locationSuitability * 100).toFixed(0)}% match
              </span>
            </div>
            
            {crop.enhancedData && (
              <div className="crop-details">
                <p><strong>Zones:</strong> {crop.enhancedData.zones}</p>
                <p><strong>Category:</strong> {crop.enhancedData.category}</p>
                <p><strong>Tolerances:</strong> Heat: {crop.enhancedData.heat}, Drought: {crop.enhancedData.drought}</p>
                {crop.enhancedData.daysToMaturity && (
                  <p><strong>Days to maturity:</strong> {crop.enhancedData.daysToMaturity}</p>
                )}
              </div>
            )}

            {/* Growing Tips from Database */}
            {crop.growingTips && crop.growingTips.length > 0 && (
              <div className="growing-tips">
                <h6>💡 Growing Tips:</h6>
                <ul>
                  {crop.growingTips.slice(0, 2).map((tip, tipIndex) => (
                    <li key={tipIndex} className="tip-item">
                      <span className="tip-category">[{tip.category}]</span>
                      {tip.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Zone-Specific Varieties */}
            {crop.varieties && crop.varieties.length > 0 && (
              <div className="varieties">
                <h6>🌿 Recommended Varieties for Zone {locationConfig.hardiness}:</h6>
                {crop.varieties.slice(0, 3).map((variety, varietyIndex) => (
                  <div key={varietyIndex} className="variety-item">
                    <div className="variety-header">
                      <span className="variety-name">{variety.varietyName}</span>
                      <span className={`variety-score ${variety.zoneSuitability.toLowerCase()}`}>
                        {variety.zoneSuitability}
                      </span>
                    </div>
                    <div className="variety-recommendation">
                      {variety.recommendation}
                    </div>
                    {variety.daysToMaturity && (
                      <div className="variety-details">
                        Harvest in {variety.daysToMaturity} days
                        {variety.vendorName && ` • Available from ${variety.vendorName}`}
                        {variety.price && ` • $${variety.price}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Companion Plants */}
            {crop.companions && (crop.companions.beneficial.length > 0 || crop.companions.antagonistic.length > 0) && (
              <div className="companions">
                <h6>🤝 Companion Planting:</h6>
                {crop.companions.beneficial.length > 0 && (
                  <p><strong>Plant with:</strong> {crop.companions.beneficial.slice(0, 3).map(c => c.name).join(', ')}</p>
                )}
                {crop.companions.antagonistic.length > 0 && (
                  <p><strong>Avoid:</strong> {crop.companions.antagonistic.slice(0, 2).map(c => c.name).join(', ')}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Seasonal Recommendations */}
      {enhancedData.recommendations && (
        <div className="seasonal-section">
          <h4>📅 Current Season Actions</h4>
          
          {enhancedData.recommendations.current.plantNow.length > 0 && (
            <div className="season-group">
              <h6>🌱 Plant Now:</h6>
              <p>{enhancedData.recommendations.current.plantNow.map(c => c.name).join(', ')}</p>
            </div>
          )}
          
          {enhancedData.recommendations.current.prepareNext.length > 0 && (
            <div className="season-group">
              <h6>📋 Prepare for Next Month:</h6>
              <p>{enhancedData.recommendations.current.prepareNext.map(c => c.name).join(', ')}</p>
            </div>
          )}
          
          {enhancedData.recommendations.yearRound.length > 0 && (
            <div className="season-group">
              <h6>🌿 Year-Round Options:</h6>
              <p>{enhancedData.recommendations.yearRound.map(c => c.name).join(', ')}</p>
            </div>
          )}
        </div>
      )}

      {/* Strategies */}
      {enhancedData.summary.bestStrategies && enhancedData.summary.bestStrategies.length > 0 && (
        <div className="strategies-section">
          <h4>🎯 Recommended Strategies</h4>
          <ul>
            {enhancedData.summary.bestStrategies.map((strategy, index) => (
              <li key={index}>{strategy}</li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .database-demo {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }

        .summary-stats {
          display: flex;
          gap: 20px;
          margin: 15px 0;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          background: white;
          border-radius: 4px;
          min-width: 80px;
        }

        .stat-item strong {
          font-size: 1.2em;
          color: #28a745;
        }

        .stat-item span {
          font-size: 0.9em;
          color: #6c757d;
        }

        .crop-card {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 15px;
          margin: 10px 0;
        }

        .crop-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .crop-header h5 {
          margin: 0;
          color: #495057;
        }

        .suitability-score {
          background: #28a745;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.85em;
          font-weight: bold;
        }

        .crop-details {
          margin: 10px 0;
          font-size: 0.9em;
          color: #6c757d;
        }

        .crop-details p {
          margin: 5px 0;
        }

        .growing-tips, .companions {
          margin: 10px 0;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .growing-tips h6, .companions h6 {
          margin: 0 0 8px 0;
          color: #495057;
          font-size: 0.9em;
        }

        .growing-tips ul {
          margin: 0;
          padding-left: 15px;
        }

        .tip-item {
          margin: 5px 0;
          font-size: 0.85em;
        }

        .tip-category {
          color: #6c757d;
          font-weight: bold;
          margin-right: 5px;
        }

        .companions p {
          margin: 5px 0;
          font-size: 0.85em;
        }

        .varieties {
          margin: 10px 0;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .varieties h6 {
          margin: 0 0 8px 0;
          color: #495057;
          font-size: 0.9em;
        }

        .variety-item {
          margin: 8px 0;
          padding: 8px;
          background: white;
          border-radius: 3px;
          border-left: 3px solid #28a745;
        }

        .variety-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .variety-name {
          font-weight: bold;
          color: #495057;
          font-size: 0.9em;
        }

        .variety-score {
          font-size: 0.75em;
          padding: 2px 6px;
          border-radius: 8px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .variety-score.excellent {
          background: #d4edda;
          color: #155724;
        }

        .variety-score.good {
          background: #fff3cd;
          color: #856404;
        }

        .variety-score.fair {
          background: #f8d7da;
          color: #721c24;
        }

        .variety-recommendation {
          font-size: 0.8em;
          color: #6c757d;
          margin: 4px 0;
          font-style: italic;
        }

        .variety-details {
          font-size: 0.75em;
          color: #6c757d;
          margin-top: 4px;
        }

        .seasonal-section, .strategies-section {
          margin: 20px 0;
          padding: 15px;
          background: white;
          border-radius: 6px;
        }

        .season-group {
          margin: 10px 0;
        }

        .season-group h6 {
          margin: 0 0 5px 0;
          color: #495057;
        }

        .season-group p {
          margin: 0;
          color: #6c757d;
          font-size: 0.9em;
        }

        .strategies-section ul {
          margin: 10px 0;
          padding-left: 20px;
        }

        .strategies-section li {
          margin: 5px 0;
          color: #6c757d;
        }

        @media (max-width: 768px) {
          .summary-stats {
            justify-content: center;
          }
          
          .crop-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedPlantRecommendations;