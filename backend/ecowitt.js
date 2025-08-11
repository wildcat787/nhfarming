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

// Helper function to log configuration status
const logConfigStatus = () => {
  console.log('🌤️  Ecowitt Configuration Status:');
  console.log(`   Local URL: ${ECOWITT_CONFIG.localUrl ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   Cloud API: ${ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   Device MAC: ${ECOWITT_CONFIG.deviceMac ? '✅ Configured' : '❌ Not configured'}`);
  

  
  if (!ECOWITT_CONFIG.localUrl && (!ECOWITT_CONFIG.applicationKey || !ECOWITT_CONFIG.userApiKey)) {
    console.log('   ⚠️  No weather station configuration found. Weather data will not be available.');
  }
};

// Log configuration on startup
logConfigStatus();

// Get current weather from Ecowitt weather station
router.get('/current', authMiddleware, async (req, res) => {
  try {
    let weatherData = null;
    let errorDetails = [];
    
    // Try local network first if configured
    if (ECOWITT_CONFIG.localUrl) {
      try {
        console.log(`🌤️  Attempting local Ecowitt connection to: ${ECOWITT_CONFIG.localUrl}`);
        
        const localResponse = await fetch(`${ECOWITT_CONFIG.localUrl}/v1/current_conditions`, {
          timeout: 5000, // 5 second timeout
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'NHFarming/1.0'
          }
        });
        
        if (localResponse.ok) {
          const localData = await localResponse.json();
          console.log('🌤️  Local Ecowitt data received:', localData);
          
          weatherData = {
            temperature: localData.temperature?.value || localData.temperature || null,
            humidity: localData.humidity?.value || localData.humidity || null,
            wind_speed: localData.wind_speed?.value || localData.wind_speed || null,
            rainfall: localData.rainfall?.value || localData.rainfall || null,
            pressure: localData.pressure?.value || localData.pressure || null,
            uv: localData.uv?.value || localData.uv || null,
            solar_radiation: localData.solar_radiation?.value || localData.solar_radiation || null,
            timestamp: new Date().toISOString(),
            source: 'local_ecowitt'
          };
          
          console.log('🌤️  Processed local weather data:', weatherData);
        } else {
          errorDetails.push(`Local API returned ${localResponse.status}: ${localResponse.statusText}`);
        }
      } catch (localError) {
        console.log('🌤️  Local Ecowitt connection failed:', localError.message);
        errorDetails.push(`Local connection error: ${localError.message}`);
      }
    }
    
    // If local failed or not configured, try cloud API
    if (!weatherData && ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey) {
      try {
        console.log('🌤️  Attempting cloud Ecowitt API connection...');
        
        const params = new URLSearchParams({
          application_key: ECOWITT_CONFIG.applicationKey,
          api_key: ECOWITT_CONFIG.userApiKey,
          mac: ECOWITT_CONFIG.deviceMac,
          call_back: 0,
          format: 'json'
        });
        
        const cloudResponse = await fetch(`${ECOWITT_CONFIG.baseUrl}/device/real_time?${params}`, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'NHFarming/1.0'
          }
        });
        
        if (cloudResponse.ok) {
          const cloudData = await cloudResponse.json();
          console.log('🌤️  Cloud Ecowitt response:', cloudData);
          
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
            
            console.log('🌤️  Processed cloud weather data:', weatherData);
          } else {
            errorDetails.push(`Cloud API error: ${cloudData.message || 'Unknown error'}`);
          }
        } else {
          errorDetails.push(`Cloud API returned ${cloudResponse.status}: ${cloudResponse.statusText}`);
        }
      } catch (cloudError) {
        console.log('🌤️  Cloud Ecowitt connection failed:', cloudError.message);
        errorDetails.push(`Cloud connection error: ${cloudError.message}`);
      }
    }
    
    if (!weatherData) {
      console.log('🌤️  No weather data available. Error details:', errorDetails);
      return res.status(404).json({ 
        error: 'Unable to fetch weather data from Ecowitt station',
        message: 'Please check your Ecowitt configuration and ensure the device is online',
        details: errorDetails,
        config: {
          localConfigured: !!ECOWITT_CONFIG.localUrl,
          cloudConfigured: !!(ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey),
          deviceConfigured: !!ECOWITT_CONFIG.deviceMac
        }
      });
    }
    
    res.json(weatherData);
    
  } catch (error) {
    console.error('🌤️  Ecowitt weather fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error.message,
      config: {
        localConfigured: !!ECOWITT_CONFIG.localUrl,
        cloudConfigured: !!(ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey),
        deviceConfigured: !!ECOWITT_CONFIG.deviceMac
      }
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
      call_back: 0,
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
  const config = {
    localConfigured: !!ECOWITT_CONFIG.localUrl,
    cloudConfigured: !!(ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey),
    deviceConfigured: !!ECOWITT_CONFIG.deviceMac,
    available: !!(ECOWITT_CONFIG.localUrl || (ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey)),
    localUrl: ECOWITT_CONFIG.localUrl ? 'Configured' : 'Not configured',
    cloudApi: ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey ? 'Configured' : 'Not configured',
    deviceMac: ECOWITT_CONFIG.deviceMac ? 'Configured' : 'Not configured'
  };
  
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
          call_back: 0,
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