const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

// GET /api/weather?date=YYYY-MM-DD&lat=...&lon=...
router.get('/', async (req, res) => {
  const { date, lat, lon } = req.query;
  if (!date || !lat || !lon) {
    return res.status(400).json({ error: 'date, lat, and lon are required' });
  }
  try {
    // Open-Meteo API for historical weather
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation`;
    const response = await fetch(url);
    const data = await response.json();
    if (!data.hourly) return res.status(404).json({ error: 'No weather data found' });
    // Use noon (12:00) as representative value if available, else first hour
    const hourIdx = data.hourly.time.findIndex(t => t.endsWith('T12:00'));
    const idx = hourIdx !== -1 ? hourIdx : 0;
    res.json({
      temperature: data.hourly.temperature_2m[idx],
      humidity: data.hourly.relative_humidity_2m[idx],
      wind: data.hourly.wind_speed_10m[idx],
      rain: data.hourly.precipitation[idx],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
});

module.exports = router; 