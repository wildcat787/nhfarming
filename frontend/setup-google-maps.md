# 🗺️ Quick Google Maps Setup

## The Issue
The "Draw Border" functionality is not working because the Google Maps API key is not configured.

## Quick Fix (3 Steps)

### 1. Get a Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for Maps API)
4. Go to "APIs & Services" > "Library"
5. Search for "Maps JavaScript API" and enable it
6. Go to "APIs & Services" > "Credentials"
7. Click "Create Credentials" > "API Key"
8. Copy the generated key

### 2. Add API Key to Environment
Edit your `frontend/.env` file and uncomment/update this line:
```bash
REACT_APP_GOOGLE_MAPS_API_KEY=your-actual-api-key-here
```

### 3. Restart the Frontend
```bash
# Stop the frontend (Ctrl+C)
# Then restart it
npm start
```

## Alternative: Manual Coordinates
If you don't want to set up Google Maps, you can manually enter border coordinates in the "Border Coordinates" field using this format:
```json
[
  {"lat": -33.8688, "lng": 151.2093},
  {"lat": -33.8690, "lng": 151.2095},
  {"lat": -33.8692, "lng": 151.2093},
  {"lat": -33.8690, "lng": 151.2091}
]
```

## Cost
- Google Maps has a generous free tier ($200/month)
- Typical farming app usage is very low cost
- You can set up billing alerts

## Security
- Restrict your API key to `localhost:3000/*` for development
- Add your production domain when deploying 