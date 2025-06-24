/**
 * Simplified Investment Service
 * Provides 2-3 focused, high-impact recommendations
 */

export const generateSimpleInvestmentRecommendations = () => {
  const currentMonth = new Date().getMonth() + 1;
  const recommendations = [];

  // Focus on just 2-3 high-impact items per season
  
  if (currentMonth >= 12 || currentMonth <= 2) {
    // Winter: Planning season
    recommendations.push({
      id: 'seed-order',
      item: 'Heat-tolerant seed collection',
      price: 35,
      urgency: 'medium',
      why: 'Get best variety selection before spring'
    });
    
    if (currentMonth >= 1) {
      recommendations.push({
        id: 'seed-starting',
        item: 'Indoor seed starting kit',
        price: 45,
        urgency: 'high',
        why: 'Start peppers and tomatoes indoors soon'
      });
    }
  }

  else if (currentMonth >= 3 && currentMonth <= 4) {
    // Spring: Infrastructure setup
    recommendations.push({
      id: 'irrigation',
      item: 'Drip irrigation system',
      price: 75,
      urgency: 'urgent',
      why: 'Must install before summer heat arrives'
    });

    recommendations.push({
      id: 'shade-prep',
      item: 'Shade cloth and support frame',
      price: 50,
      urgency: 'high',
      why: 'Essential for Durham summer survival'
    });
  }

  else if (currentMonth >= 5 && currentMonth <= 8) {
    // Summer: Emergency protection only
    recommendations.push({
      id: 'emergency-shade',
      item: 'Quick-install shade cloth',
      price: 25,
      urgency: 'urgent',
      why: 'Save struggling plants from heat stress'
    });

    recommendations.push({
      id: 'mulch',
      item: 'Organic mulch (5 bags)',
      price: 30,
      urgency: 'high',
      why: 'Reduce watering and keep roots cool'
    });
  }

  else if (currentMonth >= 9 && currentMonth <= 11) {
    // Fall: Season extension
    recommendations.push({
      id: 'fall-seeds',
      item: 'Fall garden seed collection',
      price: 20,
      urgency: 'medium',
      why: 'Plant now for winter harvest'
    });

    if (currentMonth >= 10) {
      recommendations.push({
        id: 'winter-protection',
        item: 'Row covers and frost protection',
        price: 35,
        urgency: 'high',
        why: 'Extend harvest through winter'
      });
    }
  }

  return recommendations.slice(0, 3); // Maximum 3 items
};