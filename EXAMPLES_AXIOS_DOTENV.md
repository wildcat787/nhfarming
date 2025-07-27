# Axios and Dotenv Usage Examples

## 📦 **Packages Installed**

- **axios**: HTTP client for making API requests
- **dotenv**: Load environment variables from .env files

## 🔧 **Backend Usage Examples**

### **1. Using Dotenv for Environment Variables**

Create a `.env` file in the backend directory:

```env
# Database
DB_PATH=./nhfarming.db

# JWT
JWT_SECRET=your-super-secret-key-here

# Server
PORT=5000
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://nhfarming-frontend.onrender.com

# Weather Station (Optional)
ECOWITT_LOCAL_URL=http://192.168.1.100
ECOWITT_APP_KEY=your_application_key
ECOWITT_USER_API_KEY=your_api_key
ECOWITT_DEVICE_MAC=your_device_mac

# Email (if using email features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OpenAI API (for voice transcription)
OPENAI_API_KEY=your_openai_api_key
```

Load environment variables in your backend:

```javascript
// In backend/index.js
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
```

### **2. Using Axios for External API Calls**

Example: Enhanced weather integration with multiple sources:

```javascript
// In backend/weather-enhanced.js
const axios = require('axios');
require('dotenv').config();

// Fetch weather from multiple sources
async function getWeatherData(lat, lon, date) {
  try {
    // Try Ecowitt first
    if (process.env.ECOWITT_LOCAL_URL) {
      try {
        const ecowittResponse = await axios.get(`${process.env.ECOWITT_LOCAL_URL}/v1/current_conditions`, {
          timeout: 5000
        });
        return {
          source: 'ecowitt_local',
          data: ecowittResponse.data
        };
      } catch (error) {
        console.log('Ecowitt local failed, trying cloud...');
      }
    }

    // Try Open-Meteo as fallback
    const openMeteoResponse = await axios.get(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation`,
      { timeout: 10000 }
    );

    return {
      source: 'open_meteo',
      data: openMeteoResponse.data
    };

  } catch (error) {
    console.error('Weather fetch error:', error.message);
    throw new Error('Failed to fetch weather data');
  }
}

// Fetch soil data from external API
async function getSoilData(lat, lon) {
  try {
    const response = await axios.get(
      `https://api.soil-data.com/soil?lat=${lat}&lon=${lon}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SOIL_API_KEY}`
        },
        timeout: 10000
      }
    );
    return response.data;
  } catch (error) {
    console.error('Soil data fetch error:', error.message);
    return null;
  }
}

module.exports = { getWeatherData, getSoilData };
```

### **3. Enhanced Ecowitt Integration with Axios**

```javascript
// In backend/ecowitt-enhanced.js
const axios = require('axios');
require('dotenv').config();

class EcowittWeatherService {
  constructor() {
    this.localUrl = process.env.ECOWITT_LOCAL_URL;
    this.cloudConfig = {
      appKey: process.env.ECOWITT_APP_KEY,
      userApiKey: process.env.ECOWITT_USER_API_KEY,
      deviceMac: process.env.ECOWITT_DEVICE_MAC
    };
  }

  async getCurrentWeather() {
    // Try local connection first
    if (this.localUrl) {
      try {
        const response = await axios.get(`${this.localUrl}/v1/current_conditions`, {
          timeout: 5000,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        return {
          success: true,
          source: 'local',
          data: this.formatLocalData(response.data)
        };
      } catch (error) {
        console.log('Local connection failed:', error.message);
      }
    }

    // Try cloud API
    if (this.cloudConfig.appKey && this.cloudConfig.userApiKey) {
      try {
        const params = new URLSearchParams({
          application_key: this.cloudConfig.appKey,
          api_key: this.cloudConfig.userApiKey,
          mac: this.cloudConfig.deviceMac,
          call_back: 0,
          format: 'json'
        });

        const response = await axios.get(
          `https://api.ecowitt.net/api/v3/device/real_time?${params}`,
          { timeout: 10000 }
        );

        if (response.data.code === 0) {
          return {
            success: true,
            source: 'cloud',
            data: this.formatCloudData(response.data.data)
          };
        }
      } catch (error) {
        console.error('Cloud API failed:', error.message);
      }
    }

    return {
      success: false,
      error: 'No weather station available'
    };
  }

  formatLocalData(data) {
    return {
      temperature: data.temperature?.value || null,
      humidity: data.humidity?.value || null,
      wind_speed: data.wind_speed?.value || null,
      rainfall: data.rainfall?.value || null,
      pressure: data.pressure?.value || null,
      uv: data.uv?.value || null,
      solar_radiation: data.solar_radiation?.value || null,
      timestamp: new Date().toISOString()
    };
  }

  formatCloudData(data) {
    return {
      temperature: parseFloat(data.temperature) || null,
      humidity: parseFloat(data.humidity) || null,
      wind_speed: parseFloat(data.wind_speed) || null,
      rainfall: parseFloat(data.rainfall) || null,
      pressure: parseFloat(data.pressure) || null,
      uv: parseFloat(data.uv) || null,
      solar_radiation: parseFloat(data.solar_radiation) || null,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = EcowittWeatherService;
```

## 🌐 **Frontend Usage Examples**

### **1. Enhanced API Service with Axios**

```javascript
// In frontend/src/api-enhanced.js
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Enhanced API functions
export const apiService = {
  // Weather functions
  async getCurrentWeather() {
    try {
      const response = await api.get('/ecowitt/current');
      return response.data;
    } catch (error) {
      console.error('Weather fetch failed:', error);
      throw error;
    }
  },

  async getHistoricalWeather(date) {
    try {
      const response = await api.get(`/ecowitt/historical/${date}`);
      return response.data;
    } catch (error) {
      console.error('Historical weather fetch failed:', error);
      throw error;
    }
  },

  // Enhanced application functions
  async createApplication(applicationData) {
    try {
      // Fetch current weather if not provided
      if (!applicationData.weather_temp) {
        const weather = await this.getCurrentWeather();
        applicationData = {
          ...applicationData,
          weather_temp: weather.temperature,
          weather_humidity: weather.humidity,
          weather_wind: weather.wind_speed,
          weather_rain: weather.rainfall
        };
      }

      const response = await api.post('/applications', applicationData);
      return response.data;
    } catch (error) {
      console.error('Application creation failed:', error);
      throw error;
    }
  },

  // Batch operations
  async batchCreateApplications(applications) {
    try {
      const promises = applications.map(app => this.createApplication(app));
      const results = await Promise.allSettled(promises);
      
      return {
        successful: results.filter(r => r.status === 'fulfilled').length,
        failed: results.filter(r => r.status === 'rejected').length,
        results
      };
    } catch (error) {
      console.error('Batch operation failed:', error);
      throw error;
    }
  }
};

export default api;
```

### **2. Using Environment Variables in Frontend**

Create a `.env` file in the frontend directory:

```env
# API Configuration
REACT_APP_API_URL=https://nhfarming-backend.onrender.com/api

# Feature Flags
REACT_APP_ENABLE_VOICE_AI=true
REACT_APP_ENABLE_WEATHER=true
REACT_APP_ENABLE_ANALYTICS=false

# External Services
REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_key
REACT_APP_WEATHER_API_KEY=your_weather_api_key
```

Use in React components:

```javascript
// In frontend/src/components/WeatherWidget.js
import React, { useState, useEffect } from 'react';
import { apiService } from '../api-enhanced';

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async () => {
    if (!process.env.REACT_APP_ENABLE_WEATHER) {
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.getCurrentWeather();
      setWeather(data);
    } catch (error) {
      console.error('Weather fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Refresh every 5 minutes
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!process.env.REACT_APP_ENABLE_WEATHER) {
    return null;
  }

  return (
    <div className="weather-widget">
      {loading ? (
        <div>Loading weather...</div>
      ) : weather ? (
        <div>
          <h3>Current Weather</h3>
          <p>Temperature: {weather.temperature}°C</p>
          <p>Humidity: {weather.humidity}%</p>
          <p>Wind: {weather.wind_speed} km/h</p>
          <p>Source: {weather.source}</p>
        </div>
      ) : (
        <div>Weather unavailable</div>
      )}
    </div>
  );
};

export default WeatherWidget;
```

## 🔐 **Security Best Practices**

### **1. Environment Variables**
- Never commit `.env` files to git
- Use different `.env` files for different environments
- Use strong, unique secrets for production

### **2. API Security**
- Always validate input data
- Use HTTPS in production
- Implement rate limiting
- Add request timeouts

### **3. Error Handling**
- Don't expose sensitive information in error messages
- Log errors for debugging
- Provide user-friendly error messages

## 📝 **Next Steps**

1. **Create `.env` files** for your environment variables
2. **Update your existing code** to use axios instead of fetch
3. **Add error handling** for better user experience
4. **Test the enhanced weather integration**
5. **Deploy to Render** with the new dependencies

The axios and dotenv packages are now ready to use in your NHFarming application! 