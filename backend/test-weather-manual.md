# Manual Weather Integration Testing Guide

Since Node.js isn't currently installed, here's how to manually test the weather integration once you have the backend running.

## Prerequisites

1. **Install Node.js** (if not already installed):
   ```bash
   # Option 1: Download from nodejs.org
   # Visit https://nodejs.org and download the LTS version
   
   # Option 2: Using Homebrew (if available)
   brew install node
   
   # Option 3: Using nvm (Node Version Manager)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install node
   nvm use node
   ```

2. **Install Dependencies**:
   ```bash
   cd NHFarming/backend
   npm install
   ```

## Testing Steps

### Step 1: Configure Environment Variables

Set up your Ecowitt weather station configuration:

```bash
# For local network connection (recommended)
export ECOWITT_LOCAL_URL="http://YOUR_STATION_IP"

# OR for cloud API connection
export ECOWITT_APP_KEY="your_application_key"
export ECOWITT_USER_API_KEY="your_api_key"
export ECOWITT_DEVICE_MAC="your_device_mac"
```

### Step 2: Start the Backend Server

```bash
cd NHFarming/backend
npm start
```

The server should start on http://localhost:5000

### Step 3: Test the Weather Endpoints

Use curl or a web browser to test the endpoints:

#### Test 1: Check Configuration
```bash
curl http://localhost:5000/api/ecowitt/config
```
**Expected Response:**
```json
{
  "localConfigured": true,
  "cloudConfigured": false,
  "deviceConfigured": false,
  "available": true
}
```

#### Test 2: Get Current Weather
```bash
curl http://localhost:5000/api/ecowitt/current
```
**Expected Response (if configured):**
```json
{
  "temperature": 22.5,
  "humidity": 65.2,
  "wind_speed": 12.3,
  "rainfall": 0.0,
  "pressure": 1013.2,
  "uv": 3.5,
  "solar_radiation": 450.2,
  "timestamp": "2024-01-15T14:30:00.000Z",
  "source": "local_ecowitt"
}
```

#### Test 3: Get Historical Weather
```bash
curl http://localhost:5000/api/ecowitt/historical/2024-01-15
```
**Expected Response (if configured):**
```json
{
  "temperature": 18.5,
  "humidity": 70.1,
  "wind_speed": 8.2,
  "rainfall": 2.5,
  "date": "2024-01-15",
  "source": "cloud_ecowitt_historical"
}
```

### Step 4: Test Frontend Integration

1. **Start the Frontend** (in a new terminal):
   ```bash
   cd NHFarming/frontend
   npm install
   npm start
   ```

2. **Test in Browser**:
   - Go to http://localhost:3000
   - Log in to your account
   - Navigate to Applications page
   - Try adding a new application
   - Look for the cloud download icon next to the temperature field
   - Click it to fetch current weather
   - Select a date to test historical weather fetching

## Troubleshooting

### Common Issues:

1. **"node: command not found"**
   - Install Node.js from https://nodejs.org
   - Restart your terminal after installation

2. **"ECOWITT_LOCAL_URL not configured"**
   - Set the environment variable: `export ECOWITT_LOCAL_URL="http://YOUR_IP"`
   - Replace YOUR_IP with your weather station's IP address

3. **"Failed to fetch weather data"**
   - Check if your weather station is online
   - Verify the IP address is correct
   - Test direct access: `curl http://YOUR_IP/v1/current_conditions`

4. **"CORS error"**
   - Ensure the backend is running on port 5000
   - Check that the frontend is configured to proxy to localhost:5000

### Testing Without a Weather Station

If you don't have an Ecowitt weather station yet, you can test the integration with mock data:

1. **Create a mock weather endpoint**:
   ```bash
   # In a separate terminal, create a simple mock server
   python3 -m http.server 8080
   ```

2. **Set the local URL to the mock server**:
   ```bash
   export ECOWITT_LOCAL_URL="http://localhost:8080"
   ```

3. **Create a mock response file** (`mock-weather.json`):
   ```json
   {
     "temperature": {"value": 22.5},
     "humidity": {"value": 65.2},
     "wind_speed": {"value": 12.3},
     "rainfall": {"value": 0.0}
   }
   ```

## Expected Behavior

When working correctly, you should see:

1. **Configuration Check**: Shows your weather station is available
2. **Current Weather**: Returns real-time weather data
3. **Historical Weather**: Returns weather data for past dates
4. **Frontend Integration**: Weather data automatically populates in application forms
5. **Error Handling**: Clear error messages if the weather station is unavailable

## Next Steps

Once the weather integration is working:

1. **Configure your actual Ecowitt weather station**
2. **Test with real weather data**
3. **Verify historical data is available**
4. **Test the frontend integration thoroughly**

## Support

If you encounter issues:
1. Check the backend console for error messages
2. Verify your environment variables are set correctly
3. Test the weather station connection directly
4. Review the ECOWITT_SETUP.md file for detailed configuration instructions 