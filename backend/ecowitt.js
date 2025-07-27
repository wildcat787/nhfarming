const express = require('express');
const { authMiddleware } = require('./auth');

const router = express.Router();

// Configuration for Ecowitt weather station
// These should be set as environment variables
const ECOWITT_CONFIG = {
  // Ecowitt API credentials
  applicationKey: process.env.ECOWITT_APP_KEY || '',
  applicationSecret: process.env.ECOWITT_APP_SECRET || '',
  userApiKey: process.env.ECOWITT_USER_API_KEY || '',
  userApiSecret: process.env.ECOWITT_USER_API_SECRET || '',
  
  // Device information
  deviceMac: process.env.ECOWITT_DEVICE_MAC || '',
  
  // API endpoints
  baseUrl: 'https://api.ecowitt.net/api/v3',
  
  // Fallback to local network if available
  localUrl: process.env.ECOWITT_LOCAL_URL || null, // e.g., 'http://192.168.1.100'
};

// Get current weather from Ecowitt weather station
router.get('/current', authMiddleware, async (req, res) => {
  try {
    let weatherData = null;
    
    // Try local network first if configured
    if (ECOWITT_CONFIG.localUrl) {
      try {
        const localResponse = await fetch(`${ECOWITT_CONFIG.localUrl}/v1/current_conditions`, {
          timeout: 5000, // 5 second timeout
        });
        
        if (localResponse.ok) {
          const localData = await localResponse.json();
          weatherData = {
            temperature: localData.temperature?.value || null,
            humidity: localData.humidity?.value || null,
            wind_speed: localData.wind_speed?.value || null,
            rainfall: localData.rainfall?.value || null,
            pressure: localData.pressure?.value || null,
            uv: localData.uv?.value || null,
            solar_radiation: localData.solar_radiation?.value || null,
            timestamp: new Date().toISOString(),
            source: 'local_ecowitt'
          };
        }
      } catch (localError) {
        console.log('Local Ecowitt connection failed, trying cloud API:', localError.message);
      }
    }
    
    // If local failed or not configured, try cloud API
    if (!weatherData && ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey) {
      const params = new URLSearchParams({
        application_key: ECOWITT_CONFIG.applicationKey,
        api_key: ECOWITT_CONFIG.userApiKey,
        mac: ECOWITT_CONFIG.deviceMac,
        call_back: 0,
        format: 'json'
      });
      
      const cloudResponse = await fetch(`${ECOWITT_CONFIG.baseUrl}/device/real_time?${params}`, {
        timeout: 10000, // 10 second timeout
      });
      
      if (cloudResponse.ok) {
        const cloudData = await cloudResponse.json();
        
        if (cloudData.code === 0 && cloudData.data) {
          const data = cloudData.data;
          weatherData = {
            temperature: parseFloat(data.temperature) || null,
            humidity: parseFloat(data.humidity) || null,
            wind_speed: parseFloat(data.wind_speed) || null,
            rainfall: parseFloat(data.rainfall) || null,
            pressure: parseFloat(data.pressure) || null,
            uv: parseFloat(data.uv) || null,
            solar_radiation: parseFloat(data.solar_radiation) || null,
            timestamp: new Date().toISOString(),
            source: 'cloud_ecowitt'
          };
        }
      }
    }
    
    if (!weatherData) {
      return res.status(404).json({ 
        error: 'Unable to fetch weather data from Ecowitt station',
        message: 'Please check your Ecowitt configuration and ensure the device is online'
      });
    }
    
    res.json(weatherData);
    
  } catch (error) {
    console.error('Ecowitt weather fetch error:', error);
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
    const params = new URLSearchParams({
      application_key: ECOWITT_CONFIG.applicationKey,
      api_key: ECOWITT_CONFIG.userApiKey,
      mac: ECOWITT_CONFIG.deviceMac,
      start_date: date,
      end_date: date,
      call_back: 0,
      format: 'json'
    });
    
    const response = await fetch(`${ECOWITT_CONFIG.baseUrl}/device/history?${params}`, {
      timeout: 15000, // 15 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 0 || !data.data || !data.data.list || data.data.list.length === 0) {
      return res.status(404).json({ 
        error: 'No historical weather data found for the specified date',
        message: 'Historical data may not be available for this date'
      });
    }
    
    // Process the historical data to get representative values for the day
    const dayData = data.data.list;
    
    // Calculate averages for the day
    const temperatures = dayData.map(d => parseFloat(d.temperature)).filter(t => !isNaN(t));
    const humidities = dayData.map(d => parseFloat(d.humidity)).filter(h => !isNaN(h));
    const windSpeeds = dayData.map(d => parseFloat(d.wind_speed)).filter(w => !isNaN(w));
    const rainfalls = dayData.map(d => parseFloat(d.rainfall)).filter(r => !isNaN(r));
    
    const weatherData = {
      temperature: temperatures.length > 0 ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : null,
      humidity: humidities.length > 0 ? humidities.reduce((a, b) => a + b, 0) / humidities.length : null,
      wind_speed: windSpeeds.length > 0 ? windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length : null,
      rainfall: rainfalls.length > 0 ? rainfalls.reduce((a, b) => a + b, 0) : null,
      date: date,
      source: 'cloud_ecowitt_historical'
    };
    
    res.json(weatherData);
    
  } catch (error) {
    console.error('Ecowitt historical weather fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch historical weather data',
      message: error.message 
    });
  }
});

// Get Ecowitt configuration status (without sensitive data)
router.get('/config', authMiddleware, (req, res) => {
  const config = {
    localConfigured: !!ECOWITT_CONFIG.localUrl,
    cloudConfigured: !!(ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey),
    deviceConfigured: !!ECOWITT_CONFIG.deviceMac,
    available: !!(ECOWITT_CONFIG.localUrl || (ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey))
  };
  
  res.json(config);
});

module.exports = router; 