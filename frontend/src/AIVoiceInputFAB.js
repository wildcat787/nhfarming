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
          setSnackbar({ open: true, message: data.error || 'Transcription failed.' });
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
      <Tooltip title={recording ? 'Recording... Click to stop.' : 'AI Voice Input'}>
        <Fab
          onClick={recording ? handleStop : handleRecord}
          sx={{
            position: 'fixed',
            bottom: mobile ? 80 : 32,
            right: mobile ? 16 : 32,
            zIndex: 2000,
            background: 'linear-gradient(135deg, #d500f9 0%, #8e24aa 100%)',
            color: '#fff',
            boxShadow: recording
              ? '0 0 0 0 #d500f9, 0 0 32px 8px #d500f9'
              : '0 0 0 0 #d500f9',
            animation: recording
              ? `${pulse} 2s infinite`
              : `${idlePulse} 3s infinite`,
            transition: 'background 0.3s',
            '&:hover': {
              background: 'linear-gradient(135deg, #8e24aa 0%, #d500f9 100%)',
            },
          }}
        >
          <MicIcon sx={recording ? { filter: 'drop-shadow(0 0 16px #d500f9)' } : { filter: 'drop-shadow(0 0 4px #d500f9)' }} />
        </Fab>
      </Tooltip>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
} 