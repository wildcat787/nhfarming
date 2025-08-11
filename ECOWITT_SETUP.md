# 🌤️ Ecowitt Weather Station Setup Guide

This guide will help you configure your Ecowitt weather station to automatically populate weather data in your NHFarming applications.

## 📋 Prerequisites

- Ecowitt weather station (WH2600, WS2000, WS2900, etc.)
- Station connected to your local network
- Optional: Ecowitt cloud account for backup access

## 🔧 Configuration Options

NHFarming supports two methods to connect to your Ecowitt weather station:

### Option 1: Local Network Connection (Recommended)
- **Faster**: Direct connection to your station
- **More reliable**: No internet dependency
- **Free**: No cloud account required

### Option 2: Cloud API Connection
- **Backup**: Works when local connection fails
- **Remote access**: Works from anywhere
- **Historical data**: Access to past weather records

## 🏠 Local Network Setup

### Step 1: Find Your Station's IP Address

1. **Check your router's admin panel**:
   - Log into your router (usually 192.168.1.1 or 192.168.0.1)
   - Look for connected devices
   - Find your Ecowitt station (usually named "Ecowitt" or similar)

2. **Use network scanner**:
   ```bash
   # On Windows
   arp -a | findstr "ecowitt"
   
   # On Mac/Linux
   arp -a | grep -i ecowitt
   ```

3. **Check station display**: Some models show IP on the display

### Step 2: Test Local Connection

Once you have the IP address, test the connection:

```bash
# Replace 192.168.1.100 with your station's IP
curl http://192.168.1.100/v1/current_conditions
```

You should see JSON data like:
```json
{
  "temperature": {"value": 22.5, "unit": "°C"},
  "humidity": {"value": 65, "unit": "%"},
  "wind_speed": {"value": 12.3, "unit": "km/h"},
  "rainfall": {"value": 0, "unit": "mm"}
}
```

### Step 3: Configure Environment Variables

Add to your `.env` file:
```bash
# Local Network Access (replace with your station's IP)
ECOWITT_LOCAL_URL=http://192.168.1.100
```

## ☁️ Cloud API Setup (Optional)

### Step 1: Create Ecowitt Cloud Account

1. Go to [https://api.ecowitt.net/](https://api.ecowitt.net/)
2. Sign up for a free account
3. Log in to your account

### Step 2: Get API Credentials

1. **Application Key**:
   - Go to "Application Management"
   - Create a new application
   - Copy the Application Key

2. **User API Key**:
   - Go to "User Management"
   - Copy your User API Key

3. **Device MAC Address**:
   - Go to "Device Management"
   - Find your device
   - Copy the MAC address

### Step 3: Configure Environment Variables

Add to your `.env` file:
```bash
# Cloud API Access
ECOWITT_APP_KEY=your_application_key_here
ECOWITT_USER_API_KEY=your_user_api_key_here
ECOWITT_DEVICE_MAC=your_device_mac_here
```

## 🔍 Testing Your Configuration

### Method 1: Check Configuration Status

Visit: `http://localhost:3001/api/ecowitt/config`

Expected response:
```json
{
  "localConfigured": true,
  "cloudConfigured": true,
  "deviceConfigured": true,
  "available": true,
  "localUrl": "Configured",
  "cloudApi": "Configured",
  "deviceMac": "Configured"
}
```

### Method 2: Test Connectivity

Visit: `http://localhost:3001/api/ecowitt/test`

This will test both local and cloud connections and show detailed results.

### Method 3: Get Current Weather

Visit: `http://localhost:3001/api/ecowitt/current`

Expected response:
```json
{
  "temperature": 22.5,
  "humidity": 65,
  "wind_speed": 12.3,
  "rainfall": 0,
  "pressure": 1013.2,
  "uv": 3,
  "solar_radiation": 450,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "local_ecowitt"
}
```

## 🚨 Troubleshooting

### Local Connection Issues

**Problem**: "Local connection failed"
**Solutions**:
1. Verify IP address is correct
2. Ensure station is on same network
3. Check firewall settings
4. Try accessing station directly in browser

**Problem**: "HTTP 404" or "HTTP 500"
**Solutions**:
1. Check if station supports API (some older models don't)
2. Verify API endpoint: `/v1/current_conditions`
3. Try different endpoints: `/v1/current_weather`, `/api/current`

### Cloud API Issues

**Problem**: "Invalid API key"
**Solutions**:
1. Verify Application Key and User API Key
2. Check if keys are active in Ecowitt dashboard
3. Ensure device MAC is correct

**Problem**: "Device not found"
**Solutions**:
1. Verify device MAC address
2. Ensure device is registered to your account
3. Check if device is online

### General Issues

**Problem**: "No weather data available"
**Solutions**:
1. Check server logs for detailed error messages
2. Verify environment variables are set correctly
3. Restart the backend server after configuration changes

## 📝 Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `ECOWITT_LOCAL_URL` | Local station IP address | No* | `http://192.168.1.100` |
| `ECOWITT_APP_KEY` | Cloud application key | No* | `abc123def456` |
| `ECOWITT_USER_API_KEY` | Cloud user API key | No* | `xyz789uvw012` |
| `ECOWITT_DEVICE_MAC` | Device MAC address | No* | `AA:BB:CC:DD:EE:FF` |

*At least one method (local or cloud) must be configured.

## 🔄 Automatic Weather Population

Once configured, weather data will automatically populate when:

1. **Creating applications**: Click the cloud download icon next to weather fields
2. **Historical data**: Select a date and weather data will be fetched automatically
3. **Current conditions**: Real-time weather from your station

## 📊 Weather Data Fields

The system captures these weather parameters:
- **Temperature** (°C)
- **Humidity** (%)
- **Wind Speed** (km/h)
- **Rainfall** (mm)
- **Pressure** (hPa)
- **UV Index**
- **Solar Radiation** (W/m²)

## 🆘 Getting Help

If you're still having issues:

1. **Check server logs** for detailed error messages
2. **Test connectivity** using the `/api/ecowitt/test` endpoint
3. **Verify configuration** using the `/api/ecowitt/config` endpoint
4. **Contact support** with your error logs and configuration details

## 🔗 Useful Links

- [Ecowitt API Documentation](https://api.ecowitt.net/)
- [Ecowitt Device Compatibility](https://www.ecowitt.com/support)
- [Network Troubleshooting Guide](https://www.ecowitt.com/support/network) 