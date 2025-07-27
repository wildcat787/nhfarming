# 🗺️ Google Maps Setup Guide

## Overview
The Fields page includes Google Maps integration for visualizing field locations and drawing field boundaries. Follow these steps to set up Google Maps API access.

## Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project (required for Maps API)

## Step 2: Enable Maps JavaScript API
1. In Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Maps JavaScript API"
3. Click on it and press "Enable"

## Step 3: Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

## Step 4: Restrict API Key (Recommended)
1. Click on the created API key
2. Under "Application restrictions", select "HTTP referrers"
3. Add your domain(s):
   - `localhost:3000/*` (for development)
   - `https://nhfarming-frontend.onrender.com/*` (for production)
4. Under "API restrictions", select "Restrict key"
5. Select "Maps JavaScript API" from the dropdown
6. Click "Save"

## Step 5: Add API Key to Environment
1. Create a `.env` file in the `frontend` directory
2. Add your API key:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

## Step 6: Deploy to Render
1. Add the environment variable to your Render frontend service:
   - Go to your Render dashboard
   - Select your frontend service
   - Go to "Environment" tab
   - Add: `REACT_APP_GOOGLE_MAPS_API_KEY` = your_api_key

## Features Available
- **Satellite View**: High-resolution satellite imagery
- **Field Boundaries**: Draw and edit field borders
- **Location Markers**: Mark field centers
- **Drawing Tools**: Interactive polygon drawing
- **Map Controls**: Zoom, pan, fullscreen

## Cost Considerations
- Google Maps JavaScript API has a generous free tier
- First $200 of usage per month is free
- Typical usage for farming applications is very low cost
- Monitor usage in Google Cloud Console

## Troubleshooting
- **Map not loading**: Check API key and billing setup
- **Drawing not working**: Ensure "drawing" library is included
- **CORS errors**: Verify domain restrictions are correct
- **Quota exceeded**: Check usage in Google Cloud Console

## Security Notes
- Always restrict your API key to specific domains
- Never commit API keys to version control
- Use environment variables for all deployments
- Monitor API usage regularly 