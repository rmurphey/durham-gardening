/**
 * Temporal Shopping Service
 * Links shopping items to planting dates and timing requirements
 */

export const generateTemporalShoppingRecommendations = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const recommendations = [];
  
  console.log('🗓️ Current month:', currentMonth, '- Generating temporal recommendations...');

  // Helper function to calculate days until target date
  const daysUntil = (targetMonth, targetDay = 15) => {
    const target = new Date(currentDate.getFullYear(), targetMonth - 1, targetDay);
    if (target < currentDate) {
      target.setFullYear(currentDate.getFullYear() + 1);
    }
    return Math.ceil((target - currentDate) / (1000 * 60 * 60 * 24));
  };

  // Helper function to format planting timeline
  const formatPlantingDate = (month, activity) => {
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[month]} ${activity}`;
  };

  // December-February: Order for Spring
  if (currentMonth >= 12 || currentMonth <= 2) {
    if (currentMonth === 12) {
      recommendations.push({
        id: 'spring-seeds-early',
        item: 'Cool-season seed collection (kale, lettuce, peas)',
        price: 25,
        category: 'Seeds',
        urgency: 'medium',
        why: 'Order now for best variety selection',
        timing: 'Buy now',
        plantingDate: formatPlantingDate(2, 'direct sowing'),
        daysUntilPlanting: daysUntil(2),
        leadTime: 'Order 6-8 weeks early',
        plantingWindow: 'February 15 - March 15',
        consequences: 'Popular varieties sell out by January'
      });

      recommendations.push({
        id: 'heat-tolerant-varieties',
        item: 'Heat-tolerant summer varieties (okra, amaranth)',
        price: 18,
        category: 'Seeds',
        urgency: 'low',
        why: 'Durham heat specialists - order early',
        timing: 'Buy now',
        plantingDate: formatPlantingDate(5, 'transplanting'),
        daysUntilPlanting: daysUntil(5),
        leadTime: 'Order 5 months early',
        plantingWindow: 'May 15 - June 15',
        consequences: 'Heat-adapted varieties have limited availability'
      });
    }

    if (currentMonth >= 1) {
      recommendations.push({
        id: 'seed-starting-setup',
        item: 'Seed starting kit with heat mat',
        price: 67,
        category: 'Equipment',
        urgency: 'high',
        why: 'Need to start peppers/tomatoes indoors soon',
        timing: 'Buy immediately',
        plantingDate: formatPlantingDate(2, 'seed starting'),
        daysUntilPlanting: daysUntil(2, 1),
        leadTime: 'Setup 2 weeks before starting seeds',
        plantingWindow: 'Start seeds February 1-15',
        consequences: 'Late start = weaker transplants'
      });
    }
  }

  // March-April: Critical Infrastructure Window
  else if (currentMonth >= 3 && currentMonth <= 4) {
    recommendations.push({
      id: 'irrigation-system',
      item: 'Drip irrigation system',
      price: 89,
      category: 'Infrastructure',
      urgency: 'urgent',
      why: 'Must install before summer heat arrives',
      timing: 'Install NOW',
      plantingDate: formatPlantingDate(5, 'transplant protection'),
      daysUntilPlanting: daysUntil(5),
      leadTime: 'Install 1 month before needed',
      plantingWindow: 'Ready for May transplants',
      consequences: 'Summer plantings will fail without irrigation'
    });

    recommendations.push({
      id: 'shade-cloth-system',
      item: 'Shade cloth and support framework',
      price: 75,
      category: 'Protection',
      urgency: 'urgent',
      why: 'Essential for Durham summer survival',
      timing: 'Install by April 15',
      plantingDate: formatPlantingDate(5, 'heat protection'),
      daysUntilPlanting: daysUntil(5),
      leadTime: 'Install before heat waves start',
      plantingWindow: 'Protect May plantings',
      consequences: 'Plants will burn without shade protection'
    });

    if (currentMonth === 4) {
      recommendations.push({
        id: 'transplant-supplies',
        item: 'Transplant supplies (root stimulator, protection)',
        price: 35,
        category: 'Plant Care',
        urgency: 'high',
        why: 'Transplant shock prevention for tender starts',
        timing: 'Buy now',
        plantingDate: formatPlantingDate(5, 'transplanting'),
        daysUntilPlanting: daysUntil(5),
        leadTime: 'Have ready 2 weeks before transplanting',
        plantingWindow: 'May 1-15 transplant window',
        consequences: 'Poor transplant survival without proper care'
      });
    }
  }

  // May-August: Summer Management
  else if (currentMonth >= 5 && currentMonth <= 8) {
    if (currentMonth <= 6) {
      recommendations.push({
        id: 'summer-mulch',
        item: 'Organic mulch (8 bags)',
        price: 48,
        category: 'Soil Care',
        urgency: 'high',
        why: 'Critical for water retention in summer heat',
        timing: 'Apply before heat waves',
        plantingDate: 'Protect current plantings',
        daysUntilPlanting: 0,
        leadTime: 'Apply immediately',
        plantingWindow: 'Ongoing protection',
        consequences: 'Plants stress and fail without mulch'
      });
    }

    if (currentMonth >= 6) {
      recommendations.push({
        id: 'fall-garden-seeds',
        item: 'Fall garden seed collection (kale, lettuce, spinach)',
        price: 28,
        category: 'Seeds',
        urgency: 'medium',
        why: 'Order now while varieties available for fall planting',
        timing: 'Order in June',
        plantingDate: formatPlantingDate(8, 'fall sowing'),
        daysUntilPlanting: daysUntil(8),
        leadTime: 'Order 6-8 weeks early',
        plantingWindow: 'August 15 - September 15',
        consequences: 'Popular fall varieties sell out by July'
      });
    }

    if (currentMonth >= 7) {
      recommendations.push({
        id: 'fall-transplant-supplies',
        item: 'Fall transplant starting supplies',
        price: 18,
        category: 'Supplies',
        urgency: 'high',
        why: 'Start fall transplants indoors during summer heat',
        timing: 'Buy now',
        plantingDate: formatPlantingDate(7, 'indoor starting'),
        daysUntilPlanting: daysUntil(7, 15),
        leadTime: 'Start seeds in July',
        plantingWindow: 'July 15 - August 1',
        consequences: 'Fall transplants fail without proper starting setup'
      });
    }
  }

  // September-November: Winter Preparation
  else if (currentMonth >= 9 && currentMonth <= 11) {
    recommendations.push({
      id: 'row-covers',
      item: 'Row covers and hoops for winter protection',
      price: 45,
      category: 'Protection',
      urgency: 'high',
      why: 'Extend harvest season through winter',
      timing: 'Install before first frost',
      plantingDate: formatPlantingDate(11, 'frost protection'),
      daysUntilPlanting: daysUntil(11, 15),
      leadTime: 'Install 2-4 weeks before frost',
      plantingWindow: 'Protect through winter',
      consequences: 'Lose winter harvest without protection'
    });

    if (currentMonth >= 10) {
      recommendations.push({
        id: 'spring-prep-supplies',
        item: 'Compost and soil amendments for spring prep',
        price: 35,
        category: 'Soil Care',
        urgency: 'medium',
        why: 'Prep beds during winter for spring planting',
        timing: 'Apply in late fall',
        plantingDate: formatPlantingDate(2, 'spring bed prep'),
        daysUntilPlanting: daysUntil(2),
        leadTime: 'Apply 3-4 months before planting',
        plantingWindow: 'Winter soil conditioning',
        consequences: 'Poor soil quality for spring crops'
      });
    }
  }

  return recommendations.slice(0, 4); // Top 4 temporal recommendations
};

/**
 * Get urgency level based on days until planting
 */
export const getTemporalUrgency = (daysUntilPlanting, leadTimeNeeded) => {
  if (daysUntilPlanting <= 7) return 'urgent';
  if (daysUntilPlanting <= 21) return 'high';
  if (daysUntilPlanting <= 60) return 'medium';
  return 'low';
};

/**
 * Get temporal context for display
 */
export const getTemporalContext = (item) => {
  const { daysUntilPlanting } = item;
  
  if (daysUntilPlanting === 0) return 'needed now';
  if (daysUntilPlanting <= 7) return `${daysUntilPlanting} days`;
  if (daysUntilPlanting <= 30) return `${Math.ceil(daysUntilPlanting / 7)} weeks`;
  if (daysUntilPlanting <= 365) return `${Math.ceil(daysUntilPlanting / 30)} months`;
  return 'next year';
};