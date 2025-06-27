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
        why: 'Heat-tolerant varieties - order early',
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

      // CRITICAL: Indoor starting timing for spring hot crops
      recommendations.push({
        id: 'start-hot-crops-indoors-feb',
        item: '🏠 START INDOORS: Peppers & tomatoes (8-10 weeks before transplant)',
        price: 0,
        category: 'Indoor Starting',
        urgency: 'urgent',
        why: 'Must start 8-10 weeks before last frost (April 15)',
        timing: 'Start seeds February 1-15',
        plantingDate: formatPlantingDate(2, 'indoor starting'),
        daysUntilPlanting: daysUntil(2, 1),
        leadTime: 'Start now for May transplant',
        plantingWindow: 'Start Feb 1-15, transplant May 1-15',
        consequences: 'Short growing season if started late'
      });
    }
  }

  // March-April: Critical Infrastructure Window + Cool Crop Indoor Starting
  else if (currentMonth >= 3 && currentMonth <= 4) {
    // CRITICAL: Indoor starting timing for cool season crops
    if (currentMonth === 3) {
      recommendations.push({
        id: 'start-cool-crops-indoors-march',
        item: '🏠 START INDOORS: Cool crops (broccoli, cabbage, kale) for spring',
        price: 0,
        category: 'Indoor Starting',
        urgency: 'high',
        why: 'Start 6-8 weeks before transplant for spring harvest',
        timing: 'Start seeds March 1-15',
        plantingDate: formatPlantingDate(3, 'indoor starting'),
        daysUntilPlanting: daysUntil(3, 1),
        leadTime: 'Start now for April transplant',
        plantingWindow: 'Start March 1-15, transplant April 15-30',
        consequences: 'Miss optimal spring growing window'
      });
    }
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
      why: 'Essential for summer heat survival',
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

      // CRITICAL: Indoor starting timing for fall crops
      recommendations.push({
        id: 'start-fall-indoors-july',
        item: '🏠 START INDOORS: Fall brassicas (kale, broccoli, cabbage)',
        price: 0,
        category: 'Indoor Starting',
        urgency: 'high',
        why: 'Summer heat makes outdoor germination difficult',
        timing: 'Start indoors July 15-30',
        plantingDate: formatPlantingDate(7, 'indoor starting'),
        daysUntilPlanting: daysUntil(7, 15),
        leadTime: 'Start seeds 6-8 weeks before transplant',
        plantingWindow: 'Start July 15, transplant August 15-30',
        consequences: 'Seeds fail to germinate in July heat outdoors'
      });
    }

    if (currentMonth >= 7) {
      // CRITICAL: Indoor starting timing - July is prime time for fall crops
      recommendations.push({
        id: 'start-fall-indoors-july-active',
        item: '🏠 START INDOORS NOW: Fall brassicas (kale, broccoli, cabbage)',
        price: 0,
        category: 'Indoor Starting',
        urgency: 'urgent',
        why: 'CRITICAL WINDOW: Start now for August transplant',
        timing: 'Start seeds July 15-30 ONLY',
        plantingDate: formatPlantingDate(7, 'indoor starting'),
        daysUntilPlanting: daysUntil(7, 15),
        leadTime: 'Window closes July 30th',
        plantingWindow: 'Start July 15-30, transplant August 15-30',
        consequences: 'Miss this window = no fall garden this year'
      });

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
 * Generate garden tasks (non-purchase actions) with timing
 */
export const generateGardenTasks = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const tasks = [];
  
  console.log('📋 Current month:', currentMonth, '- Generating garden tasks...');

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

  // January-February: Indoor starting for spring
  if (currentMonth >= 1 && currentMonth <= 2) {
    tasks.push({
      id: 'start-hot-crops-indoors-feb',
      item: '🏠 START INDOORS: Peppers & tomatoes',
      category: 'Indoor Starting',
      urgency: 'urgent',
      why: 'Must start 8-10 weeks before last frost (April 15)',
      timing: 'Start seeds February 1-15',
      plantingDate: formatPlantingDate(2, 'indoor starting'),
      daysUntilPlanting: daysUntil(2, 1),
      plantingWindow: 'Feb 1-15 (transplant May 1-15)',
      consequences: 'Short growing season if started late'
    });
  }

  // March: Cool season indoor starting
  if (currentMonth === 3) {
    tasks.push({
      id: 'start-cool-crops-indoors-march',
      item: '🏠 START INDOORS: Cool crops (broccoli, cabbage, kale)',
      category: 'Indoor Starting',
      urgency: 'high',
      why: 'Start 6-8 weeks before transplant for spring harvest',
      timing: 'Start seeds March 1-15',
      plantingDate: formatPlantingDate(3, 'indoor starting'),
      daysUntilPlanting: daysUntil(3, 1),
      plantingWindow: 'Mar 1-15 (transplant Apr 15-30)',
      consequences: 'Miss optimal spring growing window'
    });
  }

  // June-July: Fall crop indoor starting
  if (currentMonth >= 6 && currentMonth <= 7) {
    tasks.push({
      id: 'start-fall-indoors-july',
      item: '🏠 START INDOORS: Fall brassicas (kale, broccoli, cabbage)',
      category: 'Indoor Starting',
      urgency: currentMonth === 7 ? 'urgent' : 'high',
      why: 'Durham heat makes outdoor germination difficult',
      timing: 'Start indoors July 15-30 ONLY',
      plantingDate: formatPlantingDate(7, 'indoor starting'),
      daysUntilPlanting: daysUntil(7, 15),
      plantingWindow: 'Jul 15-30 (transplant Aug 15-30)',
      consequences: currentMonth === 7 ? 'Miss this window = no fall garden this year' : 'Seeds fail to germinate in July heat outdoors'
    });
  }

  // Seasonal care tasks
  if (currentMonth >= 5 && currentMonth <= 8) {
    tasks.push({
      id: 'summer-care-routine',
      item: '🌱 Daily summer care routine',
      category: 'Plant Care',
      urgency: 'medium',
      why: 'Summer heat requires consistent daily attention',
      timing: 'Daily morning checks',
      plantingDate: 'Ongoing protection',
      daysUntilPlanting: 0,
      plantingWindow: 'Daily through summer',
      consequences: 'Plants stress and fail without daily care'
    });
  }

  return tasks.slice(0, 3); // Top 3 tasks
};

/**
 * Separate shopping recommendations (purchases only)
 */
export const generatePureShoppingRecommendations = () => {
  const recommendations = generateTemporalShoppingRecommendations();
  
  // Filter out $0 task items, keep only actual purchases
  return recommendations.filter(item => item.price > 0);
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