# Weather Location Setup Guide

## 🌤️ Setting Your Exact Location for Accurate Weather Data

Since your Ecowitt weather station is not currently sending data to the cloud API, the system uses fallback weather data. To make this data more accurate for your location, you can configure your exact coordinates.

### 📍 Step 1: Find Your Coordinates

1. **Visit**: https://www.latlong.net/
2. **Search** for your city/town or drag the map to your exact location
3. **Copy** the latitude and longitude values

**Example**: If you're in New Holland, South Australia, you might get:
- Latitude: `-34.0222563`
- Longitude: `137.8448953`

### 📝 Step 2: Update Your Environment File

1. **Open** `NHFarming/backend/.env`
2. **Add** these lines (replace with your actual coordinates):

```env
# Weather Location for Fallback Data
WEATHER_LATITUDE=-34.0222563
WEATHER_LONGITUDE=137.8448953
```

### 🔄 Step 3: Restart the Backend

```bash
cd NHFarming/backend
# Stop the current server (Ctrl+C)
node index.js
```

### ✅ Step 4: Test the Weather

1. **Open** your NHFarming app: `http://localhost:3000`
2. **Go to** Applications page
3. **Click** "Add Application"
4. **Click** the weather icon (cloud download)
5. **Check** the weather data - it should now be more appropriate for your location

### 🌍 How It Works

- **With coordinates**: Uses seasonal data appropriate for your hemisphere and latitude
- **Without coordinates**: Uses generic Northern Hemisphere seasonal data
- **Source indicator**: Shows `fallback_weather_location` when coordinates are set

### 🎯 Benefits

- **Seasonal accuracy**: Correct summer/winter temperatures for your hemisphere
- **Realistic ranges**: Temperature, humidity, and wind patterns appropriate for your region
- **Consistent data**: Same weather for multiple requests (not completely random)

### 🔧 Troubleshooting

**Weather still seems wrong?**
- Double-check your coordinates
- Ensure the `.env` file is saved
- Restart the backend server
- Check the weather source in the response (should show `fallback_weather_location`)

**Want to disable location-based weather?**
- Remove or comment out the `WEATHER_LATITUDE` and `WEATHER_LONGITUDE` lines
- Restart the backend

### 📊 Example Weather Data

**With coordinates set** (Southern Hemisphere, August):
- Temperature: 5-18°C (winter range)
- Humidity: 30-90% (higher at night)
- Wind: 2-20 km/h
- Source: `fallback_weather_location`

**Without coordinates** (Northern Hemisphere, August):
- Temperature: 15-35°C (summer range)
- Humidity: 30-90%
- Wind: 2-20 km/h
- Source: `fallback_weather_generic`

---

**Note**: This is still simulated weather data. For real-time weather, you'll need to configure your Ecowitt device to send data to the cloud API.
