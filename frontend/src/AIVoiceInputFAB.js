import React, { useRef, useState } from 'react';
import Fab from '@mui/material/Fab';
import MicIcon from '@mui/icons-material/Mic';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import { keyframes } from '@mui/system';

export default function AIVoiceInputFAB({ mobile }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(156,39,176, 0.8), 0 0 16px 4px #d500f9; }
  70% { box-shadow: 0 0 0 20px rgba(156,39,176, 0), 0 0 32px 8px #d500f9; }
  100% { box-shadow: 0 0 0 0 rgba(156,39,176, 0), 0 0 16px 4px #d500f9; }
`;
  const idlePulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(156,39,176, 0.2); }
  70% { box-shadow: 0 0 0 8px rgba(156,39,176, 0); }
  100% { box-shadow: 0 0 0 0 rgba(156,39,176, 0.2); }
`;

  const handleRecord = async () => {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setSnackbar({ open: true, message: 'Audio recording not supported in this browser.' });
      return;
    }
    setRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new window.MediaRecorder(stream);
    audioChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = e => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = async () => {
      setRecording(false);
      setLoading(true);
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      try {
        const res = await fetch('/api/whisper', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.text) {
          insertTextAtCursor(data.text);
          setSnackbar({ open: true, message: 'Transcribed: ' + data.text });
        } else {
          const errorMessage = data.error || 'Transcription failed.';
          if (errorMessage.includes('OpenAI API key not configured')) {
            setSnackbar({ 
              open: true, 
              message: 'Voice transcription not configured. Please contact administrator.' 
            });
          } else {
            setSnackbar({ open: true, message: errorMessage });
          }
        }
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to transcribe audio.' });
      } finally {
        setLoading(false);
      }
    };
    mediaRecorderRef.current.start();
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        stream.getTracks().forEach(track => track.stop());
      }
    }, 10000); // Max 10 seconds
  };

  const handleStop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  function insertTextAtCursor(text) {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
      const start = active.selectionStart;
      const end = active.selectionEnd;
      const value = active.value;
      active.value = value.slice(0, start) + text + value.slice(end);
      active.dispatchEvent(new Event('input', { bubbles: true }));
      active.focus();
      active.selectionStart = active.selectionEnd = start + text.length;
    }
  }

  return (
    <>
      <Tooltip title={recording ? 'Recording... Click to stop.' : 'AI Voice Input - Click to speak'}>
        <Fab
          onClick={recording ? handleStop : handleRecord}
          disabled={loading}
          aria-label="AI Voice Input"
          className="ai-voice-fab"
          sx={{
            position: 'fixed',
            bottom: mobile ? 80 : 24,
            right: mobile ? 16 : 24,
            zIndex: 9999,
            width: 64,
            height: 64,
            background: recording 
              ? 'linear-gradient(135deg, #ff1744 0%, #d500f9 100%)'
              : 'linear-gradient(135deg, #d500f9 0%, #8e24aa 100%)',
            color: '#fff',
            boxShadow: recording
              ? '0 0 0 0 #ff1744, 0 0 32px 12px #ff1744, 0 8px 32px rgba(255, 23, 68, 0.4)'
              : '0 0 0 0 #d500f9, 0 8px 32px rgba(213, 0, 249, 0.3)',
            animation: recording
              ? `${pulse} 1.5s infinite`
              : `${idlePulse} 4s infinite`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: recording
                ? 'linear-gradient(135deg, #d500f9 0%, #ff1744 100%)'
                : 'linear-gradient(135deg, #8e24aa 0%, #d500f9 100%)',
              transform: 'scale(1.1)',
              boxShadow: recording
                ? '0 0 0 0 #ff1744, 0 0 40px 16px #ff1744, 0 12px 40px rgba(255, 23, 68, 0.5)'
                : '0 0 0 0 #d500f9, 0 12px 40px rgba(213, 0, 249, 0.4)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
            '&.Mui-disabled': {
              background: 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
              boxShadow: '0 0 0 0 #9e9e9e, 0 8px 32px rgba(158, 158, 158, 0.3)',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: '#fff' }} />
          ) : (
            <MicIcon 
              sx={{ 
                fontSize: 28,
                filter: recording 
                  ? 'drop-shadow(0 0 20px #ff1744)' 
                  : 'drop-shadow(0 0 8px #d500f9)',
                animation: recording ? 'pulse 1s infinite' : 'none'
              }} 
            />
          )}
        </Fab>
      </Tooltip>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            background: 'linear-gradient(135deg, #d500f9 0%, #8e24aa 100%)',
            color: '#fff',
            fontWeight: 'bold',
          }
        }}
      />
    </>
  );
} 