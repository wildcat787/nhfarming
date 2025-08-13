const express = require('express');
const { authMiddleware } = require('./auth');
const { getCurrentWeather, getConfig, logConfigStatus, ECOWITT_CONFIG } = require('./ecowitt-service');

// Unit conversion functions (same as in ecowitt-service.js)
const convertToMetric = {
  // Fahrenheit to Celsius
  temperature: (fahrenheit) => fahrenheit !== null && fahrenheit !== undefined && !isNaN(fahrenheit) ? ((fahrenheit - 32) * 5/9).toFixed(1) : null,
  
  // Miles per hour to Kilometers per hour
  wind_speed: (mph) => mph !== null && mph !== undefined && !isNaN(mph) ? (mph * 1.60934).toFixed(1) : null,
  
  // Inches per hour to Millimeters per hour
  rainfall: (inches) => inches !== null && inches !== undefined && !isNaN(inches) ? (inches * 25.4).toFixed(1) : null,
  
  // Inches of mercury to Hectopascals
  pressure: (inHg) => inHg !== null && inHg !== undefined && !isNaN(inHg) ? (inHg * 33.8639).toFixed(1) : null,
  
  // Inches to Millimeters (for daily, weekly, monthly, yearly rainfall)
  rainfall_total: (inches) => inches !== null && inches !== undefined && !isNaN(inches) ? (inches * 25.4).toFixed(1) : null
};

const router = express.Router();

// Log configuration on startup
logConfigStatus();

// Get current weather from Ecowitt weather station
router.get('/current', authMiddleware, async (req, res) => {
  try {
    const weatherData = await getCurrentWeather();
    
    if (weatherData.error) {
      return res.status(404).json(weatherData);
    }
    
    res.json(weatherData);
    
  } catch (error) {
    console.error('🌤️  Ecowitt weather fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error.message
    });
  }
});

// Get historical weather data for a specific date
router.get('/historical/:date', authMiddleware, async (req, res) => {
  const { date } = req.params;
  
  if (!ECOWITT_CONFIG.applicationKey || !ECOWITT_CONFIG.userApiKey) {
    return res.status(400).json({ 
      error: 'Ecowitt cloud API not configured',
      message: 'Please configure ECOWITT_APP_KEY and ECOWITT_USER_API_KEY environment variables'
    });
  }
  
  try {
    console.log(`🌤️  Fetching historical weather for date: ${date}`);
    
    const params = new URLSearchParams({
      application_key: ECOWITT_CONFIG.applicationKey,
      api_key: ECOWITT_CONFIG.userApiKey,
      mac: ECOWITT_CONFIG.deviceMac,
      start_date: date,
      end_date: date,
      format: 'json'
    });
    
    const response = await fetch(`${ECOWITT_CONFIG.baseUrl}/device/history?${params}`, {
      timeout: 15000, // 15 second timeout
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NHFarming/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('🌤️  Historical weather response:', data);
    
    if (data.code !== 0 || !data.data || !data.data.list || data.data.list.length === 0) {
      return res.status(404).json({ 
        error: 'No historical weather data found for the specified date',
        message: 'Historical data may not be available for this date',
        date: date
      });
    }
    
    // Process the historical data to get representative values for the day
    const dayData = data.data.list;
    
    // Calculate averages for the day (convert to metric)
    const temperatures = dayData.map(d => convertToMetric.temperature(parseFloat(d.temperature))).filter(t => t !== null);
    const humidities = dayData.map(d => parseFloat(d.humidity)).filter(h => !isNaN(h));
    const windSpeeds = dayData.map(d => convertToMetric.wind_speed(parseFloat(d.wind_speed))).filter(w => w !== null);
    const rainfalls = dayData.map(d => convertToMetric.rainfall(parseFloat(d.rainfall))).filter(r => r !== null);
    
    const weatherData = {
      temperature: temperatures.length > 0 ? (temperatures.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / temperatures.length).toFixed(1) : null,
      humidity: humidities.length > 0 ? humidities.reduce((a, b) => a + b, 0) / humidities.length : null,
      wind_speed: windSpeeds.length > 0 ? (windSpeeds.reduce((a, b) => parseFloat(a) + parseFloat(b), 0) / windSpeeds.length).toFixed(1) : null,
      rainfall: rainfalls.length > 0 ? rainfalls.reduce((a, b) => parseFloat(a) + parseFloat(b), 0).toFixed(1) : null,
      // Units for reference
      units: {
        temperature: '°C',
        humidity: '%',
        wind_speed: 'km/h',
        rainfall: 'mm/h'
      },
      date: date,
      source: 'cloud_ecowitt_historical',
      data_points: dayData.length
    };
    
    console.log('🌤️  Processed historical weather data:', weatherData);
    res.json(weatherData);
    
  } catch (error) {
    console.error('🌤️  Ecowitt historical weather fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch historical weather data',
      message: error.message,
      date: date
    });
  }
});

// Get Ecowitt configuration status (without sensitive data)
router.get('/config', authMiddleware, (req, res) => {
  const config = getConfig();
  res.json(config);
});

// Test endpoint to check connectivity
router.get('/test', authMiddleware, async (req, res) => {
  try {
    const results = {
      local: { success: false, error: null, data: null },
      cloud: { success: false, error: null, data: null }
    };
    
    // Test local connection
    if (ECOWITT_CONFIG.localUrl) {
      try {
        const localResponse = await fetch(`${ECOWITT_CONFIG.localUrl}/v1/current_conditions`, {
          timeout: 3000,
          headers: { 'Accept': 'application/json' }
        });
        
        if (localResponse.ok) {
          results.local.success = true;
          results.local.data = await localResponse.json();
        } else {
          results.local.error = `HTTP ${localResponse.status}`;
        }
      } catch (error) {
        results.local.error = error.message;
      }
    }
    
    // Test cloud connection
    if (ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey) {
      try {
        const params = new URLSearchParams({
          application_key: ECOWITT_CONFIG.applicationKey,
          api_key: ECOWITT_CONFIG.userApiKey,
          mac: ECOWITT_CONFIG.deviceMac,
          format: 'json'
        });
        
        const cloudResponse = await fetch(`${ECOWITT_CONFIG.baseUrl}/device/real_time?${params}`, {
          timeout: 5000,
          headers: { 'Accept': 'application/json' }
        });
        
        if (cloudResponse.ok) {
          const data = await cloudResponse.json();
          results.cloud.success = data.code === 0;
          results.cloud.data = data;
          if (data.code !== 0) {
            results.cloud.error = data.message || 'API error';
          }
        } else {
          results.cloud.error = `HTTP ${cloudResponse.status}`;
        }
      } catch (error) {
        results.cloud.error = error.message;
      }
    }
    
    res.json({
      config: {
        localUrl: ECOWITT_CONFIG.localUrl,
        cloudConfigured: !!(ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey),
        deviceMac: ECOWITT_CONFIG.deviceMac
      },
      testResults: results
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 