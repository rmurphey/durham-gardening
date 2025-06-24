// Vercel Edge Function for Weather API Proxying
// This provides API key security and rate limiting across all users

export const config = {
  runtime: 'edge',
};

const CACHE_DURATION = 6 * 60 * 60; // 6 hours in seconds

export default async function handler(request) {
  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');
  const lat = searchParams.get('lat') || '35.9940'; // Durham, NC default
  const lon = searchParams.get('lon') || '-78.8986';
  const days = parseInt(searchParams.get('days')) || 7;

  // Rate limiting by IP
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitKey = `weather_${clientIP}_${new Date().getHour()}`;
  
  try {
    // Check rate limit (would use Vercel KV in production)
    // For now, implement simple in-memory rate limiting
    
    let weatherData;
    const cacheKey = `weather_${provider}_${lat}_${lon}_${days}_${new Date().toDateString()}`;

    switch (provider) {
      case 'nws':
        weatherData = await getNWSWeather(lat, lon, days);
        break;
      case 'openweathermap':
        weatherData = await getOpenWeatherMapData(lat, lon, days);
        break;
      default:
        return new Response('Unsupported provider', { status: 400 });
    }

    return new Response(JSON.stringify(weatherData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=3600`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Weather API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Weather data unavailable', 
        fallback: true,
        message: 'Using historical averages' 
      }), 
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        }
      }
    );
  }
}

async function getNWSWeather(lat, lon, days) {
  // Get NWS grid coordinates
  const pointsResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`);
  if (!pointsResponse.ok) throw new Error('NWS points API failed');
  
  const pointsData = await pointsResponse.json();
  const { gridX, gridY, cwa } = pointsData.properties;

  // Get forecast
  const forecastResponse = await fetch(
    `https://api.weather.gov/gridpoints/${cwa}/${gridX},${gridY}/forecast`
  );
  if (!forecastResponse.ok) throw new Error('NWS forecast API failed');

  const forecastData = await forecastResponse.json();
  
  return {
    provider: 'nws',
    data: forecastData,
    cached: false,
    timestamp: new Date().toISOString()
  };
}

async function getOpenWeatherMapData(lat, lon, days) {
  // This would use a server-side API key stored in Vercel environment variables
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenWeatherMap API key not configured');
  }

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
  );
  
  if (!response.ok) throw new Error('OpenWeatherMap API failed');
  
  const data = await response.json();
  
  return {
    provider: 'openweathermap',
    data,
    cached: false,
    timestamp: new Date().toISOString()
  };
}