import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import Tooltip from '@mui/material/Tooltip';

export default function VoiceInputButton({ onResult, disabled }) {
  const [listening, setListening] = useState(false);
  let recognition;

  const handleClick = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser.');
      return;
    }
    recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.onresult = event => {
      setListening(false);
      if (event.results && event.results[0] && event.results[0][0]) {
        onResult(event.results[0][0].transcript);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  return (
    <Tooltip title={listening ? 'Listening...' : 'Voice input'}>
      <span>
        <IconButton onClick={handleClick} color={listening ? 'primary' : 'default'} disabled={disabled || listening}>
          {listening ? <MicIcon /> : <MicOffIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
} 