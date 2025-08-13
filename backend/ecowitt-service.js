// Shared Ecowitt service for internal use
// This can be used by both ecowitt.js routes and weather.js without authentication

// Unit conversion functions
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

// Get current weather from Ecowitt weather station
const getCurrentWeather = async () => {
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
            temperature: convertToMetric.temperature(parseFloat(localData.temperature?.value || localData.temperature)),
            humidity: parseFloat(localData.humidity?.value || localData.humidity) || null,
            wind_speed: convertToMetric.wind_speed(parseFloat(localData.wind_speed?.value || localData.wind_speed)),
            wind_direction: parseFloat(localData.wind_direction?.value || localData.wind_direction) || null,
            rainfall: convertToMetric.rainfall(parseFloat(localData.rainfall?.value || localData.rainfall)),
            pressure: convertToMetric.pressure(parseFloat(localData.pressure?.value || localData.pressure)),
            uv: parseFloat(localData.uv?.value || localData.uv) || null,
            solar_radiation: parseFloat(localData.solar_radiation?.value || localData.solar_radiation) || null,
            // Units for reference
            units: {
              temperature: '°C',
              humidity: '%',
              wind_speed: 'km/h',
              wind_direction: '°',
              rainfall: 'mm/h',
              pressure: 'hPa',
              uv: '',
              solar_radiation: 'W/m²'
            },
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
        
        // First, try to get device list to verify the device
        const deviceListParams = new URLSearchParams({
          application_key: ECOWITT_CONFIG.applicationKey,
          api_key: ECOWITT_CONFIG.userApiKey,
          format: 'json'
        });
        
        console.log('🌤️  Fetching device list...');
        const deviceListResponse = await fetch(`${ECOWITT_CONFIG.baseUrl}/device/list?${deviceListParams}`, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'NHFarming/1.0'
          }
        });
        
        if (deviceListResponse.ok) {
          const deviceListData = await deviceListResponse.json();
          console.log('🌤️  Device list response:', deviceListData);
          
          if (deviceListData.code === 0 && deviceListData.data && deviceListData.data.list && deviceListData.data.list.length > 0) {
            // Find our device in the list
            const ourDevice = deviceListData.data.list.find(device => 
              device.mac === ECOWITT_CONFIG.deviceMac || 
              device.mac === ECOWITT_CONFIG.deviceMac.toUpperCase() ||
              device.mac === ECOWITT_CONFIG.deviceMac.toLowerCase()
            );
            
            if (ourDevice) {
              console.log('🌤️  Found device:', ourDevice);
              
              // Try to get real-time data for this specific device
              const realTimeParams = new URLSearchParams({
                application_key: ECOWITT_CONFIG.applicationKey,
                api_key: ECOWITT_CONFIG.userApiKey,
                mac: ourDevice.mac,
                format: 'json'
              });
              
              console.log('🌤️  Trying real-time data...');
              const realTimeResponse = await fetch(`${ECOWITT_CONFIG.baseUrl}/device/real_time?${realTimeParams}`, {
                timeout: 10000,
                headers: {
                  'Accept': 'application/json',
                  'User-Agent': 'NHFarming/1.0'
                }
              });
              
              if (realTimeResponse.ok) {
                const realTimeData = await realTimeResponse.json();
                console.log('🌤️  Real-time data response:', realTimeData);
                
                if (realTimeData.code === 0 && realTimeData.data) {
                  const data = realTimeData.data;
                  weatherData = {
                    temperature: convertToMetric.temperature(parseFloat(data.outdoor?.temperature?.value)),
                    humidity: parseFloat(data.outdoor?.humidity?.value) || null,
                    wind_speed: convertToMetric.wind_speed(parseFloat(data.wind?.wind_speed?.value)),
                    wind_direction: parseFloat(data.wind?.wind_direction?.value) || null,
                    rainfall: convertToMetric.rainfall(parseFloat(data.rainfall?.rain_rate?.value)),
                    pressure: convertToMetric.pressure(parseFloat(data.pressure?.relative?.value)),
                    uv: parseFloat(data.solar_and_uvi?.uvi?.value) || null,
                    solar_radiation: parseFloat(data.solar_and_uvi?.solar?.value) || null,
                    // Additional rainfall data in metric
                    rainfall_daily: convertToMetric.rainfall_total(parseFloat(data.rainfall?.daily?.value)),
                    rainfall_weekly: convertToMetric.rainfall_total(parseFloat(data.rainfall?.weekly?.value)),
                    rainfall_monthly: convertToMetric.rainfall_total(parseFloat(data.rainfall?.monthly?.value)),
                    rainfall_yearly: convertToMetric.rainfall_total(parseFloat(data.rainfall?.yearly?.value)),
                    // Units for reference
                    units: {
                      temperature: '°C',
                      humidity: '%',
                      wind_speed: 'km/h',
                      wind_direction: '°',
                      rainfall: 'mm/h',
                      pressure: 'hPa',
                      uv: '',
                      solar_radiation: 'W/m²',
                      rainfall_daily: 'mm',
                      rainfall_weekly: 'mm',
                      rainfall_monthly: 'mm',
                      rainfall_yearly: 'mm'
                    },
                    timestamp: new Date().toISOString(),
                    source: 'cloud_ecowitt'
                  };
                  
                  console.log('🌤️  Processed real-time weather data:', weatherData);
                } else {
                  // If real-time fails, try historical data
                  console.log('🌤️  Real-time data empty, trying historical data...');
                  const now = new Date();
                  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
                  
                  const historyParams = new URLSearchParams({
                    application_key: ECOWITT_CONFIG.applicationKey,
                    api_key: ECOWITT_CONFIG.userApiKey,
                    mac: ourDevice.mac,
                    start_date: today,
                    end_date: today,
                    format: 'json'
                  });
                  
                  const historyResponse = await fetch(`${ECOWITT_CONFIG.baseUrl}/device/history?${historyParams}`, {
                    timeout: 10000,
                    headers: {
                      'Accept': 'application/json',
                      'User-Agent': 'NHFarming/1.0'
                    }
                  });
                  
                  if (historyResponse.ok) {
                    const historyData = await historyResponse.json();
                    console.log('🌤️  Historical data response:', historyData);
                    
                    if (historyData.code === 0 && historyData.data && historyData.data.list && historyData.data.list.length > 0) {
                      // Get the most recent data point
                      const data = historyData.data.list[historyData.data.list.length - 1];
                      weatherData = {
                        temperature: convertToMetric.temperature(parseFloat(data.temperature)),
                        humidity: parseFloat(data.humidity) || null,
                        wind_speed: convertToMetric.wind_speed(parseFloat(data.wind_speed)),
                        wind_direction: parseFloat(data.wind_direction) || null,
                        rainfall: convertToMetric.rainfall(parseFloat(data.rainfall)),
                        pressure: convertToMetric.pressure(parseFloat(data.pressure)),
                        uv: parseFloat(data.uv) || null,
                        solar_radiation: parseFloat(data.solar_radiation) || null,
                        // Units for reference
                        units: {
                          temperature: '°C',
                          humidity: '%',
                          wind_speed: 'km/h',
                          wind_direction: '°',
                          rainfall: 'mm/h',
                          pressure: 'hPa',
                          uv: '',
                          solar_radiation: 'W/m²'
                        },
                        timestamp: new Date().toISOString(),
                        source: 'cloud_ecowitt_historical'
                      };
                      
                      console.log('🌤️  Processed historical weather data:', weatherData);
                    } else {
                      errorDetails.push(`Historical API error: ${historyData.msg || 'No data available'}`);
                    }
                  } else {
                    errorDetails.push(`Historical API returned ${historyResponse.status}: ${historyResponse.statusText}`);
                  }
                }
              } else {
                errorDetails.push(`Real-time API returned ${realTimeResponse.status}: ${realTimeResponse.statusText}`);
              }
            } else {
              errorDetails.push(`Device with MAC ${ECOWITT_CONFIG.deviceMac} not found in device list`);
            }
                      } else {
              errorDetails.push(`Device list API error: ${deviceListData.msg || 'No devices found'}`);
            }
        } else {
          errorDetails.push(`Device list API returned ${deviceListResponse.status}: ${deviceListResponse.statusText}`);
        }
      } catch (cloudError) {
        console.log('🌤️  Cloud Ecowitt connection failed:', cloudError.message);
        errorDetails.push(`Cloud connection error: ${cloudError.message}`);
      }
    }
    
    if (!weatherData) {
      console.log('🌤️  No weather data available. Error details:', errorDetails);
      return {
        error: 'Unable to fetch weather data from Ecowitt station',
        message: 'Please check your Ecowitt configuration and ensure the device is online',
        details: errorDetails,
        config: {
          localConfigured: !!ECOWITT_CONFIG.localUrl,
          cloudConfigured: !!(ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey),
          deviceConfigured: !!ECOWITT_CONFIG.deviceMac
        }
      };
    }
    
    return weatherData;
    
  } catch (error) {
    console.error('🌤️  Ecowitt weather fetch error:', error);
    return {
      error: 'Failed to fetch weather data',
      message: error.message,
      config: {
        localConfigured: !!ECOWITT_CONFIG.localUrl,
        cloudConfigured: !!(ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey),
        deviceConfigured: !!ECOWITT_CONFIG.deviceMac
      }
    };
  }
};

// Get configuration status
const getConfig = () => {
  return {
    localConfigured: !!ECOWITT_CONFIG.localUrl,
    cloudConfigured: !!(ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey),
    deviceConfigured: !!ECOWITT_CONFIG.deviceMac,
    available: !!(ECOWITT_CONFIG.localUrl || (ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey)),
    localUrl: ECOWITT_CONFIG.localUrl || 'Not configured',
    cloudApi: ECOWITT_CONFIG.applicationKey && ECOWITT_CONFIG.userApiKey ? 'Configured' : 'Not configured',
    deviceMac: ECOWITT_CONFIG.deviceMac || 'Not configured'
  };
};

module.exports = {
  getCurrentWeather,
  getConfig,
  logConfigStatus,
  ECOWITT_CONFIG
};
