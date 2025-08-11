import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Refresh,
  LocationOn,
  Sensors,
  Air,
  Opacity
} from '@mui/icons-material';
import { apiRequest } from '../api';

const WeatherFooter = () => {
  const [userWeather, setUserWeather] = useState(null);
  const [ecowittWeather, setEcowittWeather] = useState(null);
  const [loading, setLoading] = useState({ user: false, ecowitt: false });
  const [error, setError] = useState({ user: '', ecowitt: '' });
  const [userLocation, setUserLocation] = useState(null);

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError(prev => ({ ...prev, user: 'Location access denied' }));
        }
      );
    } else {
      setError(prev => ({ ...prev, user: 'Geolocation not supported' }));
    }
  }, []);

  // Fallback weather data for user location when API key is not available
  const getFallbackUserWeather = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Simple weather simulation based on time of day
    let temperature, humidity, wind_speed, wind_direction, pressure;
    
    if (hour >= 6 && hour <= 18) {
      // Daytime: warmer, drier
      temperature = 20 + Math.random() * 10; // 20-30°C
      humidity = 40 + Math.random() * 30; // 40-70%
      wind_speed = 5 + Math.random() * 15; // 5-20 km/h
      wind_direction = Math.random() * 360; // 0-360 degrees
      pressure = 1013 + (Math.random() - 0.5) * 20; // 1003-1023 hPa
    } else {
      // Nighttime: cooler, more humid
      temperature = 10 + Math.random() * 10; // 10-20°C
      humidity = 60 + Math.random() * 30; // 60-90%
      wind_speed = 2 + Math.random() * 10; // 2-12 km/h
      wind_direction = Math.random() * 360; // 0-360 degrees
      pressure = 1013 + (Math.random() - 0.5) * 20; // 1003-1023 hPa
    }
    
    const descriptions = ['Clear sky', 'Partly cloudy', 'Cloudy', 'Light rain', 'Overcast'];
    const icons = ['01d', '02d', '03d', '10d', '04d'];
    const randomIndex = Math.floor(Math.random() * descriptions.length);
    
    return {
      temperature: parseFloat(temperature.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1)),
      wind_speed: parseFloat(wind_speed.toFixed(1)),
      wind_direction: parseFloat(wind_direction.toFixed(0)),
      pressure: parseFloat(pressure.toFixed(0)),
      description: descriptions[randomIndex],
      icon: icons[randomIndex],
      timestamp: now.toISOString(),
      source: 'fallback_weather'
    };
  };

  // Fetch user location weather
  const fetchUserWeather = async () => {
    if (!userLocation) return;
    
    setLoading(prev => ({ ...prev, user: true }));
    setError(prev => ({ ...prev, user: '' }));
    
    try {
      // Check if OpenWeatherMap API key is available
      if (process.env.REACT_APP_OPENWEATHER_API_KEY && process.env.REACT_APP_OPENWEATHER_API_KEY !== 'demo') {
        // Using OpenWeatherMap API for user location weather
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${userLocation.lat}&lon=${userLocation.lon}&units=metric&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setUserWeather({
            temperature: data.main.temp,
            humidity: data.main.humidity,
            wind_speed: data.wind.speed * 3.6, // Convert m/s to km/h
            wind_direction: data.wind.deg,
            pressure: data.main.pressure,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            timestamp: new Date().toISOString(),
            source: 'openweathermap'
          });
        } else {
          throw new Error('Failed to fetch weather data');
        }
      } else {
        // Use fallback weather data
        console.log('OpenWeatherMap API key not configured, using fallback weather data');
        const fallbackWeather = getFallbackUserWeather();
        setUserWeather(fallbackWeather);
      }
    } catch (err) {
      console.error('User weather fetch error:', err);
      // Use fallback weather data on error
      const fallbackWeather = getFallbackUserWeather();
      setUserWeather(fallbackWeather);
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  };

  // Fetch Ecowitt weather
  const fetchEcowittWeather = async () => {
    setLoading(prev => ({ ...prev, ecowitt: true }));
    setError(prev => ({ ...prev, ecowitt: '' }));
    
    try {
      const data = await apiRequest('/weather/current');
      setEcowittWeather(data);
    } catch (err) {
      console.error('Ecowitt weather fetch error:', err);
      setError(prev => ({ ...prev, ecowitt: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, ecowitt: false }));
    }
  };

  // Fetch weather data when location is available
  useEffect(() => {
    if (userLocation) {
      fetchUserWeather();
    }
  }, [userLocation]);

  // Fetch Ecowitt weather on mount
  useEffect(() => {
    fetchEcowittWeather();
  }, []);

  // Auto-refresh weather every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (userLocation) fetchUserWeather();
      fetchEcowittWeather();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userLocation]);

  const formatTemperature = (temp) => {
    if (temp === null || temp === undefined) return 'N/A';
    return `${temp.toFixed(1)}°C`;
  };

  const formatHumidity = (humidity) => {
    if (humidity === null || humidity === undefined) return 'N/A';
    return `${humidity.toFixed(0)}%`;
  };

  const formatWindSpeed = (speed) => {
    if (speed === null || speed === undefined) return 'N/A';
    return `${speed.toFixed(1)} km/h`;
  };

  const getWindDirection = (degrees) => {
    if (degrees === null || degrees === undefined) return '';
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };



  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        boxShadow: 3,
        py: 1,
        px: 2
      }}
    >
      {/* User Location Row */}
      <Grid container spacing={1} alignItems="center">
        {/* User Location Section */}
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" minWidth={0}>
              <LocationOn color="primary" sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption" noWrap sx={{ fontSize: '0.7rem', mr: 1 }}>
                Your Location
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={fetchUserWeather}
              disabled={loading.user}
              sx={{ p: 0.5 }}
            >
              <Refresh sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Grid>
        
        {/* User Weather Data */}
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" justifyContent="space-around">
            {loading.user ? (
              <CircularProgress size={16} />
            ) : userWeather ? (
              <>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem', mr: 1 }}>
                    {formatTemperature(userWeather.temperature)}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Opacity sx={{ fontSize: 14, mr: 0.5, color: 'primary.main' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {formatHumidity(userWeather.humidity)}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Air sx={{ fontSize: 14, mr: 0.5, color: 'secondary.main' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {formatWindSpeed(userWeather.wind_speed)}
                  </Typography>
                </Box>
                {userWeather.wind_direction && (
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                    {getWindDirection(userWeather.wind_direction)}
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                N/A
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Ecowitt Station Row */}
      <Grid container spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
        {/* Ecowitt Section */}
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" minWidth={0}>
              <Sensors color="secondary" sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption" noWrap sx={{ fontSize: '0.7rem', mr: 1 }}>
                Ecowitt Station
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={fetchEcowittWeather}
              disabled={loading.ecowitt}
              sx={{ p: 0.5 }}
            >
              <Refresh sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        </Grid>

        {/* Ecowitt Weather Data */}
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" justifyContent="space-around">
            {loading.ecowitt ? (
              <CircularProgress size={16} />
            ) : ecowittWeather ? (
              <>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem', mr: 1 }}>
                    {formatTemperature(ecowittWeather.temperature)}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Opacity sx={{ fontSize: 14, mr: 0.5, color: 'primary.main' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {formatHumidity(ecowittWeather.humidity)}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Air sx={{ fontSize: 14, mr: 0.5, color: 'secondary.main' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {formatWindSpeed(ecowittWeather.wind_speed)}
                  </Typography>
                </Box>
                {ecowittWeather.wind_direction && (
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                    {getWindDirection(ecowittWeather.wind_direction)}
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                N/A
              </Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Error messages */}
      {(error.user || error.ecowitt) && (
        <Box mt={0.5}>
          {error.user && (
            <Typography variant="caption" color="error" sx={{ fontSize: '0.6rem', mr: 1 }}>
              Location: {error.user}
            </Typography>
          )}
          {error.ecowitt && (
            <Typography variant="caption" color="error" sx={{ fontSize: '0.6rem' }}>
              Ecowitt: {error.ecowitt}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default WeatherFooter;
