const express = require('express');
const { authMiddleware } = require('./auth');
const { getCurrentWeather, getConfig } = require('./ecowitt-service');

const router = express.Router();

// Fallback weather data for testing when Ecowitt is not available
const getFallbackWeather = () => {
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth(); // 0-11
  
  // Generic weather simulation based on season and time of day
  let temperature, humidity, wind_speed, wind_direction, rainfall;
  
  // Get location from environment or use generic seasonal data
  const latitude = parseFloat(process.env.WEATHER_LATITUDE) || null;
  const longitude = parseFloat(process.env.WEATHER_LONGITUDE) || null;
  
  // Determine hemisphere and seasonal adjustments
  const isSouthernHemisphere = latitude && latitude < 0;
  let seasonalTemp = 0;
  
  if (isSouthernHemisphere) {
    // Southern Hemisphere seasons
    if (month >= 11 || month <= 1) {
      // Summer (Dec-Feb): 15-35°C
      seasonalTemp = 15 + Math.random() * 20;
    } else if (month >= 2 && month <= 4) {
      // Autumn (Mar-May): 10-25°C
      seasonalTemp = 10 + Math.random() * 15;
    } else if (month >= 5 && month <= 7) {
      // Winter (Jun-Aug): 5-18°C
      seasonalTemp = 5 + Math.random() * 13;
    } else {
      // Spring (Sep-Nov): 10-25°C
      seasonalTemp = 10 + Math.random() * 15;
    }
  } else {
    // Northern Hemisphere seasons (default if no location set)
    if (month >= 5 && month <= 7) {
      // Summer (Jun-Aug): 15-35°C
      seasonalTemp = 15 + Math.random() * 20;
    } else if (month >= 8 && month <= 10) {
      // Autumn (Sep-Nov): 10-25°C
      seasonalTemp = 10 + Math.random() * 15;
    } else if (month >= 11 || month <= 1) {
      // Winter (Dec-Feb): -5-15°C
      seasonalTemp = -5 + Math.random() * 20;
    } else {
      // Spring (Mar-May): 5-20°C
      seasonalTemp = 5 + Math.random() * 15;
    }
  }
  
  if (hour >= 6 && hour <= 18) {
    // Daytime: warmer, drier
    temperature = seasonalTemp + 2 + Math.random() * 3; // Add 2-5°C for daytime
    humidity = 30 + Math.random() * 40; // 30-70%
    wind_speed = 5 + Math.random() * 15; // 5-20 km/h
    wind_direction = Math.floor(Math.random() * 360); // 0-359 degrees
    rainfall = Math.random() > 0.85 ? Math.random() * 3 : 0; // 15% chance of rain
  } else {
    // Nighttime: cooler, more humid
    temperature = seasonalTemp - 2 + Math.random() * 3; // Subtract 2-5°C for nighttime
    humidity = 50 + Math.random() * 40; // 50-90%
    wind_speed = 2 + Math.random() * 10; // 2-12 km/h
    wind_direction = Math.floor(Math.random() * 360); // 0-359 degrees
    rainfall = Math.random() > 0.9 ? Math.random() * 2 : 0; // 10% chance of rain
  }
  
  return {
    temperature: parseFloat(temperature.toFixed(1)),
    humidity: parseFloat(humidity.toFixed(1)),
    wind_speed: parseFloat(wind_speed.toFixed(1)),
    wind_direction: wind_direction,
    rainfall: parseFloat(rainfall.toFixed(1)),
    pressure: 1013 + (Math.random() - 0.5) * 20, // 1003-1023 hPa
    uv: hour >= 6 && hour <= 18 ? Math.floor(Math.random() * 8) + 2 : 0, // 2-10 UV index during day
    solar_radiation: hour >= 6 && hour <= 18 ? 200 + Math.random() * 800 : 0, // 200-1000 W/m² during day
    timestamp: now.toISOString(),
    source: latitude && longitude ? 'fallback_weather_location' : 'fallback_weather_generic',
    location: latitude && longitude ? { latitude, longitude } : null
  };
};

// Get current weather (with fallback)
router.get('/current', authMiddleware, async (req, res) => {
  try {
    // Try to get weather from Ecowitt first
    const ecowittData = await getCurrentWeather();
    
    // Check if Ecowitt returned valid data
    if (ecowittData && !ecowittData.error && (ecowittData.temperature !== null || ecowittData.humidity !== null)) {
      return res.json(ecowittData);
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
      const ecowittResponse = await fetch(`http://localhost:3001/api/ecowitt/historical/${date}`, {
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
    const ecowittConfig = getConfig();
    res.json({
      ...ecowittConfig,
      fallbackAvailable: true
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