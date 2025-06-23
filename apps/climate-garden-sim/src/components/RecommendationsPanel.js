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
  const validRecommendations = recommendations.filter(rec => rec.content && rec.content.trim());

  if (validRecommendations.length === 0) {
    return (
      <section className="recommendations-section">
        <h2>Smart Recommendations</h2>
        <p>Loading recommendations...</p>
      </section>
    );
  }

  return (
    <section className="recommendations-section">
      <h2>Smart Recommendations</h2>
      <div className="recommendations-grid">
        {validRecommendations.map((recommendation, index) => (
          <div key={index} className="recommendation-card">
            <h3>
              <span className="recommendation-icon">{recommendation.icon}</span>
              {recommendation.title}
            </h3>
            <p>{recommendation.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendationsPanel;