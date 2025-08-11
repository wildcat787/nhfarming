const express = require('express');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Fallback weather data for testing when Ecowitt is not available
const getFallbackWeather = () => {
  const now = new Date();
  const hour = now.getHours();
  
  // Simple weather simulation based on time of day
  let temperature, humidity, wind_speed, rainfall;
  
  if (hour >= 6 && hour <= 18) {
    // Daytime: warmer, drier
    temperature = 20 + Math.random() * 10; // 20-30°C
    humidity = 40 + Math.random() * 30; // 40-70%
    wind_speed = 5 + Math.random() * 15; // 5-20 km/h
    rainfall = Math.random() > 0.8 ? Math.random() * 5 : 0; // 20% chance of rain
  } else {
    // Nighttime: cooler, more humid
    temperature = 10 + Math.random() * 10; // 10-20°C
    humidity = 60 + Math.random() * 30; // 60-90%
    wind_speed = 2 + Math.random() * 10; // 2-12 km/h
    rainfall = Math.random() > 0.9 ? Math.random() * 3 : 0; // 10% chance of rain
  }
  
  return {
    temperature: parseFloat(temperature.toFixed(1)),
    humidity: parseFloat(humidity.toFixed(1)),
    wind_speed: parseFloat(wind_speed.toFixed(1)),
    rainfall: parseFloat(rainfall.toFixed(1)),
    pressure: 1013 + (Math.random() - 0.5) * 20, // 1003-1023 hPa
    uv: Math.floor(Math.random() * 10) + 1, // 1-10 UV index
    solar_radiation: hour >= 6 && hour <= 18 ? 200 + Math.random() * 800 : 0, // 200-1000 W/m² during day
    timestamp: now.toISOString(),
    source: 'fallback_weather'
  };
};

// Get current weather (with fallback)
router.get('/current', authMiddleware, async (req, res) => {
  try {
    // Try to get weather from Ecowitt first
    try {
      const ecowittResponse = await fetch('http://localhost:5001/api/ecowitt/current', {
        headers: {
          'Authorization': req.header('Authorization')
        }
      });
      
      if (ecowittResponse.ok) {
        const ecowittData = await ecowittResponse.json();
        
        // Check if Ecowitt returned valid data
        if (ecowittData.temperature !== null || ecowittData.humidity !== null) {
          return res.json(ecowittData);
        }
      }
    } catch (ecowittError) {
      console.log('Ecowitt weather unavailable, using fallback:', ecowittError.message);
    }
    
    // Use fallback weather data
    const fallbackWeather = getFallbackWeather();
    res.json(fallbackWeather);
    
  } catch (error) {
    console.error('Weather fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error.message 
    });
  }
});

// Get historical weather for a specific date
router.get('/historical/:date', authMiddleware, async (req, res) => {
  const { date } = req.params;
  
  try {
    // Try to get historical weather from Ecowitt first
    try {
      const ecowittResponse = await fetch(`http://localhost:5001/api/ecowitt/historical/${date}`, {
        headers: {
          'Authorization': req.header('Authorization')
        }
      });
      
      if (ecowittResponse.ok) {
        const ecowittData = await ecowittResponse.json();
        
        // Check if Ecowitt returned valid data
        if (ecowittData.temperature !== null || ecowittData.humidity !== null) {
          return res.json(ecowittData);
        }
      }
    } catch (ecowittError) {
      console.log('Ecowitt historical weather unavailable, using fallback:', ecowittError.message);
    }
    
    // Use fallback historical weather data
    const fallbackWeather = getFallbackWeather();
    fallbackWeather.date = date;
    fallbackWeather.source = 'fallback_weather_historical';
    
    res.json(fallbackWeather);
    
  } catch (error) {
    console.error('Historical weather fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch historical weather data',
      message: error.message 
    });
  }
});

// Get weather configuration status
router.get('/config', authMiddleware, async (req, res) => {
  try {
    // Try to get Ecowitt config
    try {
      const ecowittResponse = await fetch('http://localhost:5001/api/ecowitt/config', {
        headers: {
          'Authorization': req.header('Authorization')
        }
      });
      
      if (ecowittResponse.ok) {
        const ecowittConfig = await ecowittResponse.json();
        return res.json({
          ...ecowittConfig,
          fallbackAvailable: true
        });
      }
    } catch (ecowittError) {
      console.log('Ecowitt config unavailable:', ecowittError.message);
    }
    
    // Return fallback config
    res.json({
      localConfigured: false,
      cloudConfigured: false,
      deviceConfigured: false,
      available: true,
      fallbackAvailable: true,
      localUrl: 'Not configured',
      cloudApi: 'Not configured',
      deviceMac: 'Not configured'
    });
    
  } catch (error) {
    console.error('Weather config error:', error);
    res.status(500).json({ 
      error: 'Failed to get weather configuration',
      message: error.message 
    });
  }
});

module.exports = router; 