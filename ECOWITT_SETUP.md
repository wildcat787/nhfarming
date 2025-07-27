# Ecowitt Weather Station Integration Setup

This guide will help you configure your local Ecowitt weather station to automatically provide weather data to your NHFarming applications.

## Overview

The NHFarming application can now fetch weather data from your Ecowitt weather station in two ways:
1. **Local Network Connection** - Direct connection to your weather station on your local network
2. **Cloud API Connection** - Connection through Ecowitt's cloud service

## Prerequisites

- Ecowitt weather station (WH2600, WS2902, WS2000, etc.)
- Weather station connected to your local network
- Ecowitt account (for cloud API access)

## Setup Options

### Option 1: Local Network Connection (Recommended)

This method connects directly to your weather station on your local network for faster, more reliable data.

1. **Find your weather station's IP address:**
   - Log into your Ecowitt app
   - Go to Device Settings
   - Note the IP address of your weather station

2. **Set environment variable:**
   ```bash
   export ECOWITT_LOCAL_URL="http://YOUR_STATION_IP"
   ```
   
   Example:
   ```bash
   export ECOWITT_LOCAL_URL="http://192.168.1.100"
   ```

3. **Test the connection:**
   - Open your browser and go to `http://YOUR_STATION_IP/v1/current_conditions`
   - You should see JSON weather data

### Option 2: Cloud API Connection

This method uses Ecowitt's cloud API service.

1. **Get your API credentials:**
   - Log into [Ecowitt.net](https://www.ecowitt.net)
   - Go to API Settings
   - Note your Application Key and API Key

2. **Get your device MAC address:**
   - In your Ecowitt app, go to Device Settings
   - Note the MAC address of your weather station

3. **Set environment variables:**
   ```bash
   export ECOWITT_APP_KEY="your_application_key"
   export ECOWITT_USER_API_KEY="your_api_key"
   export ECOWITT_DEVICE_MAC="your_device_mac_address"
   ```

## Environment Variables Reference

| Variable | Description | Required For |
|----------|-------------|--------------|
| `ECOWITT_LOCAL_URL` | Local IP address of your weather station | Local connection |
| `ECOWITT_APP_KEY` | Your Ecowitt application key | Cloud API |
| `ECOWITT_USER_API_KEY` | Your Ecowitt user API key | Cloud API |
| `ECOWITT_DEVICE_MAC` | MAC address of your weather station | Cloud API |

## Usage in NHFarming

Once configured, the weather integration provides:

### Automatic Weather Fetching
- When you select a date in the Applications form, historical weather data is automatically fetched
- Click the cloud download icon next to the temperature field to fetch current weather

### Weather Data Fields
- **Temperature** (°C)
- **Humidity** (%)
- **Wind Speed** (km/h)
- **Rainfall** (mm)

### Features
- **Current Weather**: Fetch real-time weather data from your station
- **Historical Weather**: Automatically fetch weather data for past dates
- **Fallback Support**: If local connection fails, automatically tries cloud API
- **Error Handling**: Clear error messages if weather station is unavailable

## Troubleshooting

### Local Connection Issues
1. **Check IP address**: Ensure the IP address is correct and the station is on the same network
2. **Test connectivity**: Try accessing the station's web interface directly
3. **Firewall**: Ensure no firewall is blocking the connection

### Cloud API Issues
1. **Check credentials**: Verify your API keys are correct
2. **Device MAC**: Ensure the MAC address matches your weather station
3. **Internet connection**: Verify your weather station has internet access

### General Issues
1. **Check logs**: Look at the backend console for error messages
2. **Test endpoint**: Try accessing `/api/ecowitt/config` to check configuration
3. **Restart backend**: Restart the backend server after changing environment variables

## Security Notes

- Keep your API keys secure and don't commit them to version control
- Use environment variables or a secure configuration file
- The local connection is more secure as it doesn't require internet access

## Supported Weather Station Models

Most Ecowitt weather stations are supported, including:
- WH2600
- WS2902
- WS2000
- WH2650
- WH2680
- And other Ecowitt-compatible models

## API Endpoints

The integration provides these endpoints:
- `GET /api/ecowitt/current` - Get current weather data
- `GET /api/ecowitt/historical/:date` - Get historical weather for a specific date
- `GET /api/ecowitt/config` - Check configuration status

All endpoints require authentication and will return weather data in the format expected by the applications system. 