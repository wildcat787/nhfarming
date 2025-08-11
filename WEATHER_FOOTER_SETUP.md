# 🌤️ Weather Footer Setup Guide

The NHFarming application now includes a compact weather footer that displays current weather information from both the user's location and your Ecowitt weather station. The footer is always visible at the bottom of the screen, even when scrolling.

## Features

- **Always Visible**: Compact weather bar stays at the bottom of the screen
- **User Location Weather**: Shows temperature, humidity, wind speed, and wind direction for the user's current location
- **Ecowitt Station Weather**: Displays temperature, humidity, wind speed, and wind direction from your Ecowitt weather station
- **Auto-refresh**: Weather data updates automatically every 5 minutes
- **Manual Refresh**: Users can manually refresh weather data using the refresh buttons
- **Fallback Support**: Works even when external APIs are not configured
- **Responsive Design**: Adapts to different screen sizes
- **Non-intrusive**: Small footprint that doesn't interfere with content

## Setup Instructions

### 1. User Location Weather (Optional)

To get real weather data for the user's location, you can configure the OpenWeatherMap API:

1. **Get an API Key**:
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Configure the API Key**:
   - Copy `frontend/env.example` to `frontend/.env`
   - Add your API key:
   ```env
   REACT_APP_OPENWEATHER_API_KEY=your-api-key-here
   ```

3. **Restart the Frontend**:
   ```bash
   cd frontend
   npm start
   ```

**Note**: If no API key is configured, the system will use demo weather data.

### 2. Ecowitt Weather Station (Optional)

To connect your Ecowitt weather station:

1. **Configure Environment Variables**:
   - Copy `backend/env.example` to `backend/.env`
   - Add your Ecowitt configuration:
   ```env
   # Local network connection (optional)
   ECOWITT_LOCAL_URL=http://192.168.1.100
   
   # Cloud API connection (optional)
   ECOWITT_APP_KEY=your-app-key
   ECOWITT_APP_SECRET=your-app-secret
   ECOWITT_USER_API_KEY=your-user-api-key
   ECOWITT_USER_API_SECRET=your-user-api-secret
   ECOWITT_DEVICE_MAC=your-device-mac
   ```

2. **Restart the Backend**:
   ```bash
   cd backend
   npm start
   ```

**Note**: If Ecowitt is not configured, the system will use fallback weather data.

## How It Works

### Weather Data Sources

1. **User Location Weather**:
   - Uses browser geolocation to get user's coordinates
   - Fetches weather from OpenWeatherMap API
   - Falls back to simulated weather if API is unavailable

2. **Ecowitt Station Weather**:
   - Connects to your Ecowitt weather station
   - Tries local network connection first
   - Falls back to cloud API if local connection fails
   - Uses simulated data if neither is available

### Data Display

The compact weather footer shows:
- **Temperature** in Celsius for both weather sources
- **Humidity** percentage with water drop icon
- **Wind Speed** in km/h with wind icon
- **Wind Direction** using compass directions (N, NE, E, SE, S, SW, W, NW, etc.)
- **Weather source labels** with location and sensor icons
- **Loading indicators** when fetching data
- **Error messages** when services are unavailable
- **Refresh buttons** for manual updates

### Auto-refresh

- Weather data refreshes automatically every 5 minutes
- Users can manually refresh using the refresh button
- Loading indicators show when data is being fetched

## Troubleshooting

### User Location Weather Issues

1. **"Location access denied"**:
   - User needs to allow location access in their browser
   - Check browser settings for location permissions

2. **"Failed to fetch weather data"**:
   - Check if OpenWeatherMap API key is valid
   - Verify internet connection
   - System will use fallback data

### Ecowitt Weather Issues

1. **"Unable to fetch weather data from Ecowitt station"**:
   - Check Ecowitt device is online
   - Verify network connectivity
   - Check API credentials
   - System will use fallback data

2. **Configuration Issues**:
   - Verify all environment variables are set correctly
   - Check device MAC address format
   - Ensure API keys are valid

### General Issues

1. **Footer not showing**:
   - Make sure user is logged in
   - Check browser console for errors
   - Verify both frontend and backend are running

2. **Data not updating**:
   - Check network connectivity
   - Verify API endpoints are accessible
   - Look for error messages in browser console

## API Endpoints

### Weather API
- `GET /api/weather/current` - Get current weather data
- `GET /api/weather/historical/:date` - Get historical weather data
- `GET /api/weather/config` - Get weather configuration status

### Ecowitt API
- `GET /api/ecowitt/current` - Get current Ecowitt data
- `GET /api/ecowitt/historical/:date` - Get historical Ecowitt data
- `GET /api/ecowitt/config` - Get Ecowitt configuration status
- `GET /api/ecowitt/test` - Test Ecowitt connectivity

## Customization

### Styling
The compact weather footer uses Material-UI components and can be customized by modifying:
- `src/components/WeatherFooter.js` - Main component
- `src/theme.js` - Theme configuration

### Layout
The footer is positioned as a fixed element at the bottom of the screen with:
- **Fixed positioning** - Always visible when scrolling
- **High z-index** - Appears above other content
- **Shadow effect** - Subtle elevation for visual separation
- **Bottom padding** - Content area has padding to prevent overlap
- **Two-line layout** - User location weather on first line, Ecowitt station on second line
- **Responsive design** - Adapts to different screen sizes

### Data Sources
To add additional weather data sources:
1. Add new API endpoints in the backend
2. Update the WeatherFooter component to fetch from new sources
3. Add appropriate error handling and fallbacks

### Refresh Intervals
To change the auto-refresh interval, modify the interval in `WeatherFooter.js`:
```javascript
// Change from 5 minutes to 10 minutes
setInterval(() => {
  // refresh logic
}, 10 * 60 * 1000);
```

## Security Considerations

- API keys are stored in environment variables (not in code)
- User location is only used for weather data
- No location data is stored or transmitted elsewhere
- All API requests use HTTPS where available

## Support

For issues with:
- **OpenWeatherMap**: Check their [API documentation](https://openweathermap.org/api)
- **Ecowitt**: Refer to their [API documentation](https://doc.ecowitt.net/)
- **Application**: Check the browser console and server logs for error messages
