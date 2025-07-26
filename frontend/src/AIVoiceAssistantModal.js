import React, { useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MicIcon from '@mui/icons-material/Mic';
import CircularProgress from '@mui/material/CircularProgress';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { keyframes } from '@mui/system';
import Box from '@mui/material/Box';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(156,39,176, 0.8), 0 0 32px 8px #d500f9; }
  70% { box-shadow: 0 0 0 40px rgba(156,39,176, 0), 0 0 64px 16px #d500f9; }
  100% { box-shadow: 0 0 0 0 rgba(156,39,176, 0), 0 0 32px 8px #d500f9; }
`;

export default function AIVoiceAssistantModal({ open, onClose }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleRecord = async () => {
    setTranscript('');
    setError('');
    setLiveTranscript('');
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setError('Audio recording not supported in this browser.');
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
          setTranscript(data.text);
        } else {
          setError(data.error || 'Transcription failed.');
        }
      } catch (err) {
        setError('Failed to transcribe audio.');
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

  const handleInsert = () => {
    if (!transcript) return;
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
      const start = active.selectionStart;
      const end = active.selectionEnd;
      const value = active.value;
      active.value = value.slice(0, start) + transcript + value.slice(end);
      active.dispatchEvent(new Event('input', { bubbles: true }));
      active.focus();
      active.selectionStart = active.selectionEnd = start + transcript.length;
    }
    onClose();
  };

  const handleCopy = () => {
    if (transcript) navigator.clipboard.writeText(transcript);
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: '#1a0036', color: '#fff', p: 0 }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16, color: '#fff' }}><CloseIcon /></IconButton>
        <Box sx={{ mt: 8, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #d500f9 0%, #8e24aa 100%)',
              animation: recording ? `${pulse} 2s infinite` : undefined,
              boxShadow: recording ? '0 0 32px 8px #d500f9' : '0 0 8px 2px #d500f9',
              mb: 2,
            }}
          >
            <MicIcon sx={{ fontSize: 64, color: '#fff', filter: recording ? 'drop-shadow(0 0 24px #d500f9)' : 'drop-shadow(0 0 8px #d500f9)' }} />
          </Box>
          <Button
            variant="contained"
            size="large"
            sx={{ mb: 2, bgcolor: recording ? '#d500f9' : '#8e24aa', color: '#fff', fontWeight: 'bold', fontSize: 18, px: 4, py: 1.5, borderRadius: 8, boxShadow: '0 2px 16px #d500f9' }}
            onClick={recording ? handleStop : handleRecord}
            disabled={loading}
          >
            {recording ? 'Stop Recording' : 'Start AI Voice'}
          </Button>
          {loading && <CircularProgress sx={{ color: '#fff', mb: 2 }} />}
          <Typography variant="body1" sx={{ mb: 2, textAlign: 'center', maxWidth: 400 }}>
            {recording ? 'Listening... Speak now.' : 'Tap the mic and speak to fill any field or ask for help.'}
          </Typography>
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          {(transcript || liveTranscript) && (
            <Box sx={{ bgcolor: '#fff', color: '#222', borderRadius: 2, p: 2, minWidth: 280, maxWidth: 400, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#8e24aa', mb: 1 }}>Transcript</Typography>
              <Typography variant="body1">{transcript || liveTranscript}</Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button variant="contained" color="primary" onClick={handleInsert} disabled={!transcript}>Insert</Button>
          <Button variant="outlined" color="secondary" onClick={handleCopy} disabled={!transcript} startIcon={<ContentCopyIcon />}>Copy</Button>
          <Button variant="text" color="inherit" onClick={onClose}>Cancel</Button>
        </Box>
        <Box sx={{ mt: 2, mb: 4, maxWidth: 400, mx: 'auto', bgcolor: 'rgba(255,255,255,0.07)', borderRadius: 2, p: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#d500f9', mb: 1 }}>What can I say?</Typography>
          <Typography variant="body2">
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>"Set crop type to corn and notes to planted in field 1"</li>
              <li>"Add maintenance: oil change, cost 50 dollars"</li>
              <li>"Input: Roundup, rate 2 liters per hectare"</li>
              <li>Or just dictate any text for the current field</li>
            </ul>
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ display: 'none' }} />
    </Dialog>
  );
} 