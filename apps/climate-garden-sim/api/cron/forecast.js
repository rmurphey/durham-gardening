// Vercel Cron Function for Forecast Data Updates
// Runs every 6 hours to fetch and cache fresh weather forecast data

export default async function handler(req, res) {
  // Verify this is a cron request (Vercel adds this header)
  if (req.headers['user-agent'] !== 'Vercel Cron' && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('🌤️ Starting forecast data update cron job');
  
  const startTime = Date.now();
  const results = [];
  
  try {
    // Durham, NC (27707) - primary location
    const durhamResult = await updateForecastForLocation('27707', '35.9940', '-78.8986');
    results.push({ location: 'Durham, NC (27707)', ...durhamResult });
    
    // Could add more locations here in the future
    // const ashvilleResult = await updateForecastForLocation('28801', '35.5951', '-82.5515');
    // results.push({ location: 'Asheville, NC (28801)', ...ashvilleResult });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Forecast update completed in ${duration}ms`);
    
    return res.status(200).json({
      success: true,
      message: 'Forecast data updated successfully',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      results
    });
    
  } catch (error) {
    console.error('❌ Forecast update failed:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      duration: `${Date.now() - startTime}ms`
    });
  }
}

async function updateForecastForLocation(zipCode, lat, lon) {
  console.log(`📡 Fetching forecast data for ${zipCode} (${lat}, ${lon})`);
  
  try {
    // Fetch fresh forecast data from National Weather Service
    const forecastData = await fetchNWSForecast(lat, lon);
    
    // Transform data for garden planning
    const gardenForecast = transformForGardenPlanning(forecastData);
    
    // Store in Vercel KV if available
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await storeInKV(`forecast:${zipCode}`, {
        ...gardenForecast,
        timestamp: new Date().toISOString(),
        fromCache: false
      });
      
      console.log(`💾 Stored forecast data for ${zipCode} in KV storage`);
    }
    
    return {
      success: true,
      zipCode,
      forecastDays: gardenForecast.dailyForecasts.length,
      alerts: gardenForecast.gardenAlerts.length
    };
    
  } catch (error) {
    console.error(`Failed to update forecast for ${zipCode}:`, error);
    return {
      success: false,
      zipCode,
      error: error.message
    };
  }
}

async function fetchNWSForecast(lat, lon) {
  // Get NWS grid coordinates
  console.log(`🌐 Fetching NWS grid data for ${lat}, ${lon}`);
  const pointsResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`, {
    headers: {
      'User-Agent': 'GardenPlannerApp/1.0 (contact@example.com)'
    }
  });
  
  if (!pointsResponse.ok) {
    throw new Error(`NWS points API failed: ${pointsResponse.status} ${pointsResponse.statusText}`);
  }
  
  const pointsData = await pointsResponse.json();
  const { gridX, gridY, cwa } = pointsData.properties;
  
  console.log(`📍 Grid coordinates: ${cwa}/${gridX},${gridY}`);

  // Fetch both daily and hourly forecasts
  const [forecastResponse, hourlyResponse] = await Promise.allSettled([
    fetch(`https://api.weather.gov/gridpoints/${cwa}/${gridX},${gridY}/forecast`, {
      headers: {
        'User-Agent': 'GardenPlannerApp/1.0 (contact@example.com)'
      }
    }),
    fetch(`https://api.weather.gov/gridpoints/${cwa}/${gridX},${gridY}/forecast/hourly`, {
      headers: {
        'User-Agent': 'GardenPlannerApp/1.0 (contact@example.com)'
      }
    })
  ]);

  let forecastData = null;
  let hourlyData = null;

  if (forecastResponse.status === 'fulfilled' && forecastResponse.value.ok) {
    forecastData = await forecastResponse.value.json();
    console.log(`📅 Retrieved ${forecastData.properties.periods.length} forecast periods`);
  } else {
    throw new Error('Failed to fetch daily forecast data');
  }

  if (hourlyResponse.status === 'fulfilled' && hourlyResponse.value.ok) {
    hourlyData = await hourlyResponse.value.json();
    console.log(`⏰ Retrieved ${hourlyData.properties.periods.length} hourly periods`);
  } else {
    console.log('⚠️ Hourly data unavailable, proceeding with daily forecast only');
  }

  return {
    forecast: forecastData,
    hourly: hourlyData,
    timestamp: new Date().toISOString(),
    fromCache: false
  };
}

async function storeInKV(key, data) {
  const kvUrl = `${process.env.KV_REST_API_URL}/set/${key}`;
  
  const response = await fetch(kvUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      value: JSON.stringify(data),
      ex: 21600 // Expire in 6 hours (in seconds)
    })
  });

  if (!response.ok) {
    throw new Error(`KV storage failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

function transformForGardenPlanning(weatherData) {
  const { forecast, hourly } = weatherData;
  
  // Extract forecast periods
  const periods = forecast?.properties?.periods || [];
  const hourlyPeriods = hourly?.properties?.periods || [];
  
  const dailyForecasts = [];
  const uniqueDays = new Set();
  
  // Process daily periods from NWS (group day/night pairs)
  for (let i = 0; i < periods.length && dailyForecasts.length < 10; i++) {
    const period = periods[i];
    const date = new Date(period.startTime);
    const dayKey = date.toDateString();
    
    if (!uniqueDays.has(dayKey)) {
      uniqueDays.add(dayKey);
      
      // Find night period for same day to get low temperature
      const nightPeriod = periods.find((p, idx) => {
        const pDate = new Date(p.startTime);
        return pDate.toDateString() === dayKey && p.isDaytime === false && idx > i;
      });
      
      // Find corresponding hourly data for this day
      const dayHourlyData = hourlyPeriods.filter(h => {
        const hDate = new Date(h.startTime);
        return hDate.toDateString() === dayKey;
      });
      
      const highTemp = period.isDaytime ? period.temperature : (nightPeriod?.temperature || period.temperature + 20);
      const lowTemp = nightPeriod ? nightPeriod.temperature : 
                     (period.isDaytime ? period.temperature - 20 : period.temperature);
      
      const avgTemp = (highTemp + lowTemp) / 2;
      
      const dailyForecast = {
        date: date.toISOString().split('T')[0],
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        
        // Temperature data
        highTemp: Math.round(highTemp),
        lowTemp: Math.round(lowTemp),
        avgTemp: Math.round(avgTemp),
        
        // Precipitation
        precipChance: period.probabilityOfPrecipitation?.value || 0,
        precipAmount: estimatePrecipAmount(period),
        
        // Garden calculations
        growingDegreeDays: Math.max(0, Math.round(avgTemp - 50)),
        frostRisk: lowTemp < 35,
        heatStress: highTemp > 90,
        
        // Conditions
        shortForecast: period.shortForecast || 'No forecast available',
        detailedForecast: period.detailedForecast || '',
        windSpeed: period.windSpeed || 'Unknown',
        windDirection: period.windDirection || 'Variable',
        
        // Garden-specific data
        gardenConditions: generateGardenConditions({ temperature: highTemp, ...period }),
        recommendedActions: generateDailyRecommendations({ temperature: highTemp, ...period })
      };
      
      dailyForecasts.push(dailyForecast);
    }
  }
  
  // Extend to 10 days using pattern projection if we have less than 10 days
  while (dailyForecasts.length < 10) {
    const lastDay = dailyForecasts[dailyForecasts.length - 1];
    const extendedDay = projectForecastDay(lastDay, dailyForecasts.length);
    dailyForecasts.push(extendedDay);
  }
  
  // Calculate summary statistics
  const summary = calculateForecastSummary(dailyForecasts);
  
  return {
    dailyForecasts: dailyForecasts.slice(0, 10),
    summary,
    gardenAlerts: generateGardenAlerts(dailyForecasts),
    simulationFactors: calculateSimulationFactors(dailyForecasts)
  };
}

// Helper functions (reused from forecast.js)
function estimatePrecipAmount(period) {
  const precipChance = period.probabilityOfPrecipitation?.value || 0;
  const forecast = (period.shortForecast || '').toLowerCase();
  
  if (forecast.includes('heavy rain') || forecast.includes('thunderstorm')) {
    return precipChance > 50 ? 0.5 : 0.25;
  }
  if (forecast.includes('rain') || forecast.includes('shower')) {
    return precipChance > 50 ? 0.25 : 0.1;
  }
  if (forecast.includes('light rain') || forecast.includes('drizzle')) {
    return precipChance > 50 ? 0.1 : 0.05;
  }
  
  return 0;
}

function generateGardenConditions(period) {
  const conditions = [];
  const temp = period.temperature;
  
  if (temp < 32) conditions.push('Freezing');
  else if (temp < 40) conditions.push('Very Cold');
  else if (temp < 50) conditions.push('Cool');
  else if (temp < 80) conditions.push('Ideal');
  else if (temp < 90) conditions.push('Warm');
  else conditions.push('Hot');
  
  const precipChance = period.probabilityOfPrecipitation?.value || 0;
  if (precipChance > 70) conditions.push('Heavy Rain Expected');
  else if (precipChance > 40) conditions.push('Rain Likely');
  else if (precipChance > 20) conditions.push('Possible Rain');
  
  return conditions;
}

function generateDailyRecommendations(period) {
  const recommendations = [];
  const temp = period.temperature;
  const precipChance = period.probabilityOfPrecipitation?.value || 0;
  
  if (temp < 32) {
    recommendations.push('Protect tender plants from frost');
  } else if (temp > 90) {
    recommendations.push('Provide shade and extra water');
  }
  
  if (precipChance > 70) {
    recommendations.push('Skip watering - rain expected');
  } else if (precipChance < 20 && temp > 75) {
    recommendations.push('Extra watering may be needed');
  }
  
  return recommendations;
}

function projectForecastDay(lastDay, dayIndex) {
  const baseDate = new Date(lastDay.date);
  baseDate.setDate(baseDate.getDate() + 1);
  
  const highTemp = Math.round(lastDay.highTemp + (Math.random() - 0.5) * 6);
  const lowTemp = Math.round(lastDay.lowTemp + (Math.random() - 0.5) * 6);
  const avgTemp = Math.round((highTemp + lowTemp) / 2);
  
  return {
    date: baseDate.toISOString().split('T')[0],
    dayOfWeek: baseDate.toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp,
    lowTemp,
    avgTemp,
    precipChance: Math.max(0, Math.min(100, lastDay.precipChance + (Math.random() - 0.5) * 20)),
    precipAmount: 0,
    growingDegreeDays: Math.max(0, avgTemp - 50),
    frostRisk: lowTemp < 35,
    heatStress: highTemp > 90,
    shortForecast: 'Extended forecast (projected)',
    detailedForecast: 'Weather pattern projection',
    windSpeed: lastDay.windSpeed,
    windDirection: lastDay.windDirection,
    gardenConditions: ['Projected'],
    recommendedActions: ['Monitor weather updates'],
    projected: true
  };
}

function calculateForecastSummary(forecasts) {
  const temps = forecasts.map(f => f.avgTemp);
  const precipTotal = forecasts.reduce((sum, f) => sum + (f.precipAmount || 0), 0);
  const gddTotal = forecasts.reduce((sum, f) => sum + (f.growingDegreeDays || 0), 0);
  
  return {
    avgTemp: Math.round(temps.reduce((sum, t) => sum + t, 0) / temps.length),
    minTemp: Math.min(...forecasts.map(f => f.lowTemp)),
    maxTemp: Math.max(...forecasts.map(f => f.highTemp)),
    totalPrecip: Math.round(precipTotal * 100) / 100,
    totalGrowingDegreeDays: gddTotal,
    frostDays: forecasts.filter(f => f.frostRisk).length,
    heatStressDays: forecasts.filter(f => f.heatStress).length,
    rainDays: forecasts.filter(f => f.precipChance > 50).length
  };
}

function generateGardenAlerts(forecasts) {
  const alerts = [];
  
  // Frost alert
  const earlyForecasts = forecasts.slice(0, 3);
  if (earlyForecasts.some(f => f.frostRisk)) {
    alerts.push({
      type: 'frost',
      severity: 'high',
      message: 'Frost expected in next 3 days',
      days: earlyForecasts.filter(f => f.frostRisk).map(f => f.dayOfWeek).join(', ')
    });
  }
  
  // Heat stress alert
  const hotDays = forecasts.filter(f => f.heatStress);
  if (hotDays.length > 3) {
    alerts.push({
      type: 'heat',
      severity: 'medium',
      message: `Extended heat period - ${hotDays.length} days above 90°F`
    });
  }
  
  return alerts;
}

function calculateSimulationFactors(forecasts) {
  const summary = calculateForecastSummary(forecasts);
  
  return {
    temperatureStability: calculateTempStability(forecasts),
    moistureIndex: Math.round(calculateMoistureIndex(forecasts)),
    growthPotential: Math.min(100, Math.round((summary.totalGrowingDegreeDays / 10) * 10)),
    riskFactors: {
      frost: summary.frostDays > 0,
      heat: summary.heatStressDays > 2,
      drought: summary.totalPrecip < 0.5 && summary.rainDays < 2,
      excess_moisture: summary.totalPrecip > 2.0
    }
  };
}

function calculateTempStability(forecasts) {
  const temps = forecasts.map(f => f.avgTemp);
  const avg = temps.reduce((sum, t) => sum + t, 0) / temps.length;
  const variance = temps.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / temps.length;
  
  return Math.round(Math.max(0, 100 - Math.sqrt(variance) * 2));
}

function calculateMoistureIndex(forecasts) {
  const totalPrecip = forecasts.reduce((sum, f) => sum + (f.precipAmount || 0), 0);
  const rainDays = forecasts.filter(f => f.precipChance > 30).length;
  
  const precipScore = Math.max(0, 100 - Math.abs(totalPrecip - 1.5) * 50);
  const frequencyScore = Math.max(0, 100 - Math.abs(rainDays - 4) * 25);
  
  return (precipScore + frequencyScore) / 2;
}