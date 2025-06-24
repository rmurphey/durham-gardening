/**
 * RecommendationsPanel Component
 * Displays smart recommendations and actionable insights
 */

import React from 'react';

const RecommendationsPanel = ({
  monthlyFocus,
  weeklyActions,
  successOutlook,
  investmentPriority,
  topCropRecommendations,
  siteSpecificRecommendations
}) => {
  const recommendations = [
    {
      title: "This Month's Focus",
      content: monthlyFocus,
      icon: "📅"
    },
    {
      title: "Weekly Actions", 
      content: weeklyActions,
      icon: "✅"
    },
    {
      title: "Success Outlook",
      content: successOutlook,
      icon: "🎯"
    },
    {
      title: "Investment Priority",
      content: investmentPriority,
      icon: "💰"
    },
    {
      title: "Top Crop Recommendations",
      content: topCropRecommendations,
      icon: "🌱"
    },
    {
      title: "Site-Specific Tips",
      content: siteSpecificRecommendations,
      icon: "🏡"
    }
  ];


  // Filter out recommendations with empty content
  const validRecommendations = recommendations.filter(rec => {
    if (!rec.content) return false;
    
    // Handle string content
    if (typeof rec.content === 'string') {
      return rec.content.trim().length > 0;
    }
    
    // Handle object/array content (like siteSpecificRecommendations)
    if (typeof rec.content === 'object') {
      if (Array.isArray(rec.content)) {
        return rec.content.length > 0;
      }
      // For objects, check if they have meaningful content
      return Object.keys(rec.content).length > 0;
    }
    
    return false;
  });

  if (validRecommendations.length === 0) {
    return (
      <section className="card recommendations-section">
        <div className="card-header">
          <h2 className="card-title">Smart Recommendations</h2>
        </div>
        <p>Loading recommendations...</p>
      </section>
    );
  }

  return (
    <section className="card recommendations-section">
      <div className="card-header">
        <h2 className="card-title">Smart Recommendations</h2>
        <p className="card-subtitle">Durham-specific gardening guidance</p>
      </div>
      <div className="recommendations-grid">
        {validRecommendations.map((recommendation, index) => (
          <div key={index} className="recommendation-card">
            <h3>
              <span className="recommendation-icon">{recommendation.icon}</span>
              {recommendation.title}
            </h3>
            {typeof recommendation.content === 'string' ? (
              <div className="recommendation-content">
                {recommendation.content.split('\n').map((line, lineIdx) => {
                  if (line.trim() === '') return <br key={lineIdx} />;
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h4 key={lineIdx} className="content-header">{line.slice(2, -2)}</h4>;
                  }
                  if (line.startsWith('- ')) {
                    return <div key={lineIdx} className="content-bullet">{line.slice(2)}</div>;
                  }
                  return <p key={lineIdx}>{line}</p>;
                })}
              </div>
            ) : Array.isArray(recommendation.content) ? (
              <div className="recommendation-list">
                {recommendation.content.map((item, idx) => (
                  <div key={idx} className="recommendation-item">
                    {item.icon && <span className="item-icon">{item.icon}</span>}
                    {item.task && (
                      <div className="task-item">
                        <strong>{item.task}</strong>
                        {item.timing && <span className="timing"> - {item.timing}</span>}
                        {item.urgency && <span className={`urgency urgency-${item.urgency}`}>{item.urgency}</span>}
                      </div>
                    )}
                    {item.crop && (
                      <div className="crop-item">
                        <strong>{item.crop}</strong>
                        {item.reason && <span className="reason"> - {item.reason}</span>}
                        {item.varieties && item.varieties.length > 0 && (
                          <div className="varieties">Try: {item.varieties.join(', ')}</div>
                        )}
                      </div>
                    )}
                    {item.category && (
                      <div className="priority-item">
                        <strong>{item.category}:</strong> {item.description}
                        {item.amount && <span className="amount"> (${item.amount})</span>}
                        {item.timing && <span className="timing"> - {item.timing}</span>}
                      </div>
                    )}
                    {item.tip && (
                      <div className="site-tip">
                        <strong>{item.category}:</strong> {item.tip}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>Complex recommendation data available</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendationsPanel;