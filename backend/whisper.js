const express = require('express');
const multer = require('multer');
const fs = require('fs');
const FormData = require('form-data');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Load environment variables
require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// POST /api/whisper
router.post('/', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });
  if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OpenAI API key not configured' });
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));
    formData.append('model', 'whisper-1');
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });
    const data = await response.json();
    fs.unlinkSync(req.file.path);
    if (data.text) {
      res.json({ text: data.text });
    } else {
      res.status(500).json({ error: data.error?.message || 'Transcription failed' });
    }
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

module.exports = router; 