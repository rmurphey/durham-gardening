// Vercel API for Garden Forecast Data
// Provides 10-day forecast data optimized for garden planning and simulation

import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { zipCode, lat, lon } = req.query;
  
  try {
    // Get forecast data from KV storage first
    let forecastData = null;
    
    // In development, allow bypassing KV with query param
    const forceRefresh = req.query.refresh === 'true';
    
    if (process.env.BLOB_READ_WRITE_TOKEN && !forceRefresh) {
      try {
        // Try to get cached forecast from blob storage
        const { blobs } = await list({ prefix: `forecast-${zipCode}` });
        
        if (blobs.length > 0) {
          const response = await fetch(blobs[0].url);
          if (response.ok) {
            forecastData = await response.json();
            
            // Check if data is fresh (less than 6 hours old)
            const dataAge = Date.now() - new Date(forecastData.timestamp).getTime();
            const maxAge = 6 * 60 * 60 * 1000; // 6 hours
            
            if (dataAge > maxAge) {
              forecastData = null; // Data is stale
            }
          }
        }
      } catch (blobError) {
        console.log('Blob fetch failed, will fetch fresh data:', blobError.message);
      }
    }

    // If no fresh data, fetch from NWS
    if (!forecastData) {
      forecastData = await fetchFreshForecastData(zipCode, lat, lon);
      
      // Store fresh data in blob storage for caching
      if (process.env.BLOB_READ_WRITE_TOKEN && forecastData) {
        try {
          await put(`forecast-${zipCode}.json`, JSON.stringify(forecastData), {
            access: 'public',
            contentType: 'application/json'
          });
        } catch (storeError) {
          console.log('Failed to cache forecast data:', storeError.message);
        }
      }
    }

    // Transform data for garden planning
    const gardenForecast = transformForGardenPlanning(forecastData);

    res.status(200).json({
      success: true,
      data: gardenForecast,
      cached: !!forecastData.fromCache,
      timestamp: forecastData.timestamp
    });

  } catch (error) {
    console.error('Forecast API error:', error);
    
    // Return fallback data based on historical averages
    const fallbackData = generateFallbackForecast(zipCode);
    
    res.status(200).json({
      success: false,
      error: 'Weather service unavailable',
      data: fallbackData,
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
}

async function fetchFreshForecastData(zipCode, lat, lon) {
  // Require coordinates - no defaults
  if (!lat || !lon) {
    throw new Error('Latitude and longitude are required for forecast data');
  }
  
  const latitude = lat;
  const longitude = lon;
  
  // Get NWS grid coordinates
  const pointsResponse = await fetch(`https://api.weather.gov/points/${latitude},${longitude}`);
  if (!pointsResponse.ok) throw new Error('NWS points API failed');
  
  const pointsData = await pointsResponse.json();
  const { gridX, gridY, cwa } = pointsData.properties;

  // Get extended forecast (up to 7 days from NWS)
  const forecastResponse = await fetch(
    `https://api.weather.gov/gridpoints/${cwa}/${gridX},${gridY}/forecast`
  );
  if (!forecastResponse.ok) throw new Error('NWS forecast API failed');

  const forecastData = await forecastResponse.json();

  // Get hourly forecast for more detailed data
  const hourlyResponse = await fetch(
    `https://api.weather.gov/gridpoints/${cwa}/${gridX},${gridY}/forecast/hourly`
  );
  
  let hourlyData = null;
  if (hourlyResponse.ok) {
    hourlyData = await hourlyResponse.json();
  }

  return {
    forecast: forecastData,
    hourly: hourlyData,
    timestamp: new Date().toISOString(),
    fromCache: false
  };
}

function transformForGardenPlanning(weatherData) {
  const { forecast, hourly } = weatherData;
  
  // Extract 10-day forecast data (extend with patterns if needed)
  const periods = forecast?.properties?.periods || [];
  const hourlyPeriods = hourly?.properties?.periods || [];
  
  const dailyForecasts = [];
  const uniqueDays = new Set();
  
  // Process daily periods from NWS
  periods.forEach(period => {
    const date = new Date(period.startTime);
    const dayKey = date.toDateString();
    
    if (!uniqueDays.has(dayKey) && dailyForecasts.length < 10) {
      uniqueDays.add(dayKey);
      
      // Find corresponding hourly data for this day
      const dayHourlyData = hourlyPeriods.filter(h => {
        const hDate = new Date(h.startTime);
        return hDate.toDateString() === dayKey;
      });
      
      const dailyForecast = {
        date: date.toISOString().split('T')[0],
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        
        // Temperature data (crucial for growing degree days)
        highTemp: period.temperature,
        lowTemp: findLowTemp(dayHourlyData, period),
        avgTemp: null, // Will calculate from hourly data
        
        // Weather comfort indices
        humidity: findAverageHumidity(dayHourlyData),
        heatIndex: null, // Will calculate
        windChill: null, // Will calculate
        apparentTemp: null, // Will calculate
        
        // Precipitation (affects irrigation planning)
        precipChance: period.probabilityOfPrecipitation?.value || 0,
        precipAmount: estimatePrecipAmount(period),
        
        // Garden-specific calculations
        growingDegreeDays: null, // Will calculate
        frostRisk: period.temperature < 35,
        heatStress: period.temperature > 90,
        
        // Conditions
        shortForecast: period.shortForecast,
        detailedForecast: period.detailedForecast,
        windSpeed: period.windSpeed,
        windDirection: period.windDirection,
        
        // Garden recommendations
        gardenConditions: generateGardenConditions(period),
        recommendedActions: generateDailyRecommendations(period)
      };
      
      // Calculate growing degree days (base 50°F for most vegetables)
      if (dailyForecast.lowTemp !== null) {
        dailyForecast.avgTemp = (dailyForecast.highTemp + dailyForecast.lowTemp) / 2;
        dailyForecast.growingDegreeDays = Math.max(0, dailyForecast.avgTemp - 50);
        
        // Calculate comfort indices
        dailyForecast.heatIndex = calculateHeatIndex(dailyForecast.highTemp, dailyForecast.humidity);
        dailyForecast.windChill = calculateWindChill(dailyForecast.lowTemp, dailyForecast.windSpeed);
        dailyForecast.apparentTemp = getApparentTemperature(dailyForecast.avgTemp, dailyForecast.humidity, dailyForecast.windSpeed);
      }
      
      dailyForecasts.push(dailyForecast);
    }
  });
  
  // If no forecast data available, generate fallback data
  if (dailyForecasts.length === 0) {
    console.warn('No forecast data available, generating fallback data');
    // Generate 10 days of fallback data starting from today
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const fallbackDay = generateFallbackDay(date, i);
      dailyForecasts.push(fallbackDay);
    }
  } else {
    // Extend to 10 days using pattern projection if needed
    while (dailyForecasts.length < 10) {
      const lastDay = dailyForecasts[dailyForecasts.length - 1];
      const extendedDay = projectForecastDay(lastDay, dailyForecasts.length);
      dailyForecasts.push(extendedDay);
    }
  }
  
  // Calculate summary statistics for simulation
  const summary = calculateForecastSummary(dailyForecasts);
  
  return {
    dailyForecasts: dailyForecasts.slice(0, 10),
    summary,
    gardenAlerts: generateGardenAlerts(dailyForecasts),
    simulationFactors: calculateSimulationFactors(dailyForecasts)
  };
}

function findLowTemp(hourlyData, dailyPeriod) {
  if (!hourlyData.length) {
    // Estimate low temp as 15-20°F below high temp
    return dailyPeriod.temperature - 18;
  }
  
  const temps = hourlyData.map(h => h.temperature).filter(t => t != null);
  return temps.length > 0 ? Math.min(...temps) : dailyPeriod.temperature - 18;
}

function findAverageHumidity(hourlyData) {
  if (!hourlyData.length) {
    return 50; // Default moderate humidity
  }
  
  const humidities = hourlyData
    .map(h => h.relativeHumidity?.value)
    .filter(h => h != null);
  
  if (humidities.length === 0) {
    return 50; // Default moderate humidity
  }
  
  return Math.round(humidities.reduce((sum, h) => sum + h, 0) / humidities.length);
}

// Calculate heat index using simplified formula
// Only valid for temperatures >= 80°F and humidity >= 40%
function calculateHeatIndex(tempF, humidity) {
  if (!tempF || !humidity || tempF < 80 || humidity < 40) {
    return tempF; // Return actual temperature if conditions don't warrant heat index
  }
  
  // Simplified heat index formula
  const T = tempF;
  const RH = humidity;
  
  let HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094));
  
  // If initial calculation shows heat index >= 80, use more complex formula
  if (HI >= 80) {
    const c1 = -42.379;
    const c2 = 2.04901523;
    const c3 = 10.14333127;
    const c4 = -0.22475541;
    const c5 = -0.00683783;
    const c6 = -0.05481717;
    const c7 = 0.00122874;
    const c8 = 0.00085282;
    const c9 = -0.00000199;
    
    HI = c1 + (c2 * T) + (c3 * RH) + (c4 * T * RH) + (c5 * T * T) + 
         (c6 * RH * RH) + (c7 * T * T * RH) + (c8 * T * RH * RH) + 
         (c9 * T * T * RH * RH);
  }
  
  return Math.round(HI);
}

// Calculate wind chill using NWS formula
// Only valid for temperatures <= 50°F and wind speeds > 3 mph
function calculateWindChill(tempF, windSpeedStr) {
  if (!tempF || !windSpeedStr || tempF > 50) {
    return tempF; // Return actual temperature if conditions don't warrant wind chill
  }
  
  // Extract wind speed number from string (e.g., "10 to 15 mph" -> 12.5)
  const windMatch = windSpeedStr.match(/(\d+)(?:\s*to\s*(\d+))?/);
  if (!windMatch) {
    return tempF;
  }
  
  let windSpeed;
  if (windMatch[2]) {
    // Range like "10 to 15 mph"
    windSpeed = (parseInt(windMatch[1]) + parseInt(windMatch[2])) / 2;
  } else {
    // Single value like "10 mph"
    windSpeed = parseInt(windMatch[1]);
  }
  
  if (windSpeed <= 3) {
    return tempF; // Wind chill not applicable at low wind speeds
  }
  
  // NWS Wind Chill Formula
  const windChill = 35.74 + (0.6215 * tempF) - (35.75 * Math.pow(windSpeed, 0.16)) + 
                   (0.4275 * tempF * Math.pow(windSpeed, 0.16));
  
  return Math.round(windChill);
}

// Get apparent temperature (feels like temperature)
function getApparentTemperature(tempF, humidity, windSpeedStr) {
  if (!tempF) return tempF;
  
  // Use heat index for hot weather
  if (tempF >= 80 && humidity >= 40) {
    return calculateHeatIndex(tempF, humidity);
  }
  
  // Use wind chill for cold weather
  if (tempF <= 50 && windSpeedStr) {
    return calculateWindChill(tempF, windSpeedStr);
  }
  
  // For moderate temperatures, return actual temperature
  return tempF;
}

function estimatePrecipAmount(period) {
  const precipChance = period.probabilityOfPrecipitation?.value || 0;
  const forecast = (period.shortForecast || '').toLowerCase();
  
  // Rough estimation based on forecast text and probability
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
  
  if (period.temperature < 32) conditions.push('Freezing');
  else if (period.temperature < 40) conditions.push('Very Cold');
  else if (period.temperature < 50) conditions.push('Cool');
  else if (period.temperature < 80) conditions.push('Ideal');
  else if (period.temperature < 90) conditions.push('Warm');
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
  
  // Temperature-based recommendations
  if (temp < 32) {
    recommendations.push('Protect tender plants from frost');
    recommendations.push('Avoid outdoor planting');
  } else if (temp < 40) {
    recommendations.push('Good day for cool-season crop care');
    recommendations.push('Check cold frames and row covers');
  } else if (temp > 90) {
    recommendations.push('Provide shade for heat-sensitive plants');
    recommendations.push('Water early morning or evening');
  }
  
  // Precipitation-based recommendations
  if (precipChance > 70) {
    recommendations.push('Skip watering - rain expected');
    recommendations.push('Good day for indoor tasks');
  } else if (precipChance < 20 && temp > 75) {
    recommendations.push('Extra watering may be needed');
  }
  
  // Wind recommendations
  const windSpeed = period.windSpeed || '';
  if (windSpeed.includes('20') || windSpeed.includes('25')) {
    recommendations.push('Secure tall plants and covers');
  }
  
  return recommendations;
}

function generateFallbackDay(date, dayIndex) {
  // Historical averages for Durham, NC in late June
  const baseHighTemp = 88;
  const baseLowTemp = 68;
  const variation = (Math.random() - 0.5) * 10; // ±5°F daily variation
  
  const highTemp = Math.round(baseHighTemp + variation);
  const lowTemp = Math.round(baseLowTemp + variation);
  const avgTemp = (highTemp + lowTemp) / 2;
  
  return {
    date: date.toISOString().split('T')[0],
    dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp,
    lowTemp,
    avgTemp,
    precipChance: Math.round(Math.random() * 60), // 0-60% chance
    precipAmount: Math.random() * 0.3, // 0-0.3 inches
    growingDegreeDays: Math.max(0, avgTemp - 50),
    frostRisk: false,
    heatStress: highTemp > 90,
    shortForecast: 'Historical average',
    detailedForecast: 'Fallback data based on seasonal averages',
    windSpeed: '5 to 10 mph',
    windDirection: 'Variable',
    gardenConditions: ['Average'],
    recommendedActions: ['Normal garden care'],
    fallback: true
  };
}

function projectForecastDay(lastDay, dayIndex) {
  const baseDate = new Date(lastDay.date);
  baseDate.setDate(baseDate.getDate() + 1);
  
  return {
    date: baseDate.toISOString().split('T')[0],
    dayOfWeek: baseDate.toLocaleDateString('en-US', { weekday: 'long' }),
    highTemp: lastDay.highTemp + (Math.random() - 0.5) * 6, // ±3°F variation
    lowTemp: lastDay.lowTemp + (Math.random() - 0.5) * 6,
    avgTemp: null,
    precipChance: Math.max(0, Math.min(100, lastDay.precipChance + (Math.random() - 0.5) * 20)),
    precipAmount: 0,
    growingDegreeDays: null,
    frostRisk: false,
    heatStress: false,
    shortForecast: 'Extended forecast (estimated)',
    detailedForecast: 'Weather pattern projection based on recent trends',
    windSpeed: lastDay.windSpeed,
    windDirection: lastDay.windDirection,
    gardenConditions: ['Projected'],
    recommendedActions: ['Monitor weather updates'],
    projected: true
  };
}

function calculateForecastSummary(forecasts) {
  const temps = forecasts.map(f => f.avgTemp || (f.highTemp + f.lowTemp) / 2);
  const precipTotal = forecasts.reduce((sum, f) => sum + (f.precipAmount || 0), 0);
  const gddTotal = forecasts.reduce((sum, f) => sum + (f.growingDegreeDays || 0), 0);
  
  return {
    avgTemp: temps.reduce((sum, t) => sum + t, 0) / temps.length,
    minTemp: Math.min(...forecasts.map(f => f.lowTemp)),
    maxTemp: Math.max(...forecasts.map(f => f.highTemp)),
    totalPrecip: precipTotal,
    totalGrowingDegreeDays: gddTotal,
    frostDays: forecasts.filter(f => f.frostRisk).length,
    heatStressDays: forecasts.filter(f => f.heatStress).length,
    rainDays: forecasts.filter(f => f.precipChance > 50).length
  };
}

function generateGardenAlerts(forecasts) {
  const alerts = [];
  
  // Check for frost in next 3 days
  const earlyForecasts = forecasts.slice(0, 3);
  if (earlyForecasts.some(f => f.frostRisk)) {
    alerts.push({
      type: 'frost',
      severity: 'high',
      message: 'Frost expected in next 3 days - protect tender plants',
      days: earlyForecasts.filter(f => f.frostRisk).map(f => f.dayOfWeek).join(', ')
    });
  }
  
  // Check for heat stress
  const hotDays = forecasts.filter(f => f.heatStress);
  if (hotDays.length > 3) {
    alerts.push({
      type: 'heat',
      severity: 'medium',
      message: `Extended heat period - ${hotDays.length} days above 90°F`,
      recommendation: 'Increase watering and provide shade'
    });
  }
  
  // Check for heavy rain
  const heavyRainDays = forecasts.filter(f => f.precipChance > 80);
  if (heavyRainDays.length > 0) {
    alerts.push({
      type: 'rain',
      severity: 'low',
      message: `Heavy rain expected - adjust watering schedule`,
      days: heavyRainDays.map(f => f.dayOfWeek).join(', ')
    });
  }
  
  return alerts;
}

function calculateSimulationFactors(forecasts) {
  const summary = calculateForecastSummary(forecasts);
  
  return {
    temperatureStability: calculateTempStability(forecasts),
    moistureIndex: calculateMoistureIndex(forecasts),
    growthPotential: Math.min(100, (summary.totalGrowingDegreeDays / 10) * 10), // Scale 0-100
    riskFactors: {
      frost: summary.frostDays > 0,
      heat: summary.heatStressDays > 2,
      drought: summary.totalPrecip < 0.5 && summary.rainDays < 2,
      excess_moisture: summary.totalPrecip > 2.0
    }
  };
}

function calculateTempStability(forecasts) {
  const temps = forecasts.map(f => f.avgTemp || (f.highTemp + f.lowTemp) / 2);
  const avg = temps.reduce((sum, t) => sum + t, 0) / temps.length;
  const variance = temps.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / temps.length;
  
  // Return stability score 0-100 (100 = very stable)
  return Math.max(0, 100 - Math.sqrt(variance) * 2);
}

function calculateMoistureIndex(forecasts) {
  const totalPrecip = forecasts.reduce((sum, f) => sum + (f.precipAmount || 0), 0);
  const rainDays = forecasts.filter(f => f.precipChance > 30).length;
  
  // Optimal range: 1-2 inches over 10 days with 3-5 rain days
  const precipScore = Math.max(0, 100 - Math.abs(totalPrecip - 1.5) * 50);
  const frequencyScore = Math.max(0, 100 - Math.abs(rainDays - 4) * 25);
  
  return (precipScore + frequencyScore) / 2;
}

function generateFallbackForecast(zipCode) {
  // Generate reasonable fallback data based on Durham seasonal averages
  const now = new Date();
  const month = now.getMonth();
  
  // Durham seasonal temperature averages (rough estimates)
  const seasonalTemps = {
    high: [55, 60, 68, 76, 82, 88, 91, 90, 84, 75, 66, 57][month],
    low: [35, 38, 45, 52, 61, 69, 73, 72, 65, 53, 44, 37][month]
  };
  
  const forecasts = [];
  for (let i = 0; i < 10; i++) {
    const forecastDate = new Date(now);
    forecastDate.setDate(forecastDate.getDate() + i);
    
    const highTemp = seasonalTemps.high + (Math.random() - 0.5) * 10;
    const lowTemp = seasonalTemps.low + (Math.random() - 0.5) * 8;
    const avgTemp = (highTemp + lowTemp) / 2;
    
    forecasts.push({
      date: forecastDate.toISOString().split('T')[0],
      dayOfWeek: forecastDate.toLocaleDateString('en-US', { weekday: 'long' }),
      highTemp: Math.round(highTemp),
      lowTemp: Math.round(lowTemp),
      avgTemp: Math.round(avgTemp),
      precipChance: Math.floor(Math.random() * 60),
      precipAmount: Math.random() * 0.3,
      growingDegreeDays: Math.max(0, avgTemp - 50),
      frostRisk: lowTemp < 35,
      heatStress: highTemp > 90,
      shortForecast: 'Historical average',
      detailedForecast: 'Fallback data based on seasonal averages',
      windSpeed: '5 to 10 mph',
      windDirection: 'Variable',
      humidity: 55,
      heatIndex: Math.round(highTemp),
      windChill: Math.round(lowTemp),
      apparentTemp: Math.round(avgTemp),
      gardenConditions: ['Average'],
      recommendedActions: ['Normal garden care'],
      fallback: true
    });
  }
  
  return {
    dailyForecasts: forecasts,
    summary: calculateForecastSummary(forecasts),
    gardenAlerts: [],
    simulationFactors: calculateSimulationFactors(forecasts),
    fallback: true
  };
}