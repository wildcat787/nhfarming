const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const OPENAI_API_KEY = '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';

// POST /api/whisper
router.post('/', upload.single('audio'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });
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