// Development endpoint to manually trigger forecast updates
// Only available in development mode

export default async function handler(req, res) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Manual forecast update triggered (development)');
    
    // Import and run the cron function
    const { default: cronHandler } = await import('../cron/forecast.js');
    
    // Create a mock request object for the cron function
    const mockReq = {
      headers: { 'user-agent': 'Development Trigger' },
      method: 'GET'
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`Cron function returned ${code}:`, data);
          return { statusCode: code, data };
        }
      })
    };

    // Run the cron function
    const result = await cronHandler(mockReq, mockRes);
    
    return res.status(200).json({
      success: true,
      message: 'Forecast update triggered successfully',
      timestamp: new Date().toISOString(),
      result
    });

  } catch (error) {
    console.error('Failed to trigger forecast update:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}