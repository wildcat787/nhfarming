# OpenAI API Key Setup for Voice Transcription

## 🎤 **Overview**

The NHFarming application uses OpenAI's Whisper API for voice transcription, allowing you to:
- Record voice notes for applications
- Use voice input for form fields
- Transcribe audio recordings to text

## 🔑 **Getting Your OpenAI API Key**

### **Step 1: Create OpenAI Account**
1. Go to [OpenAI.com](https://openai.com)
2. Sign up for an account
3. Verify your email address

### **Step 2: Get API Key**
1. Log into your OpenAI account
2. Go to [API Keys](https://platform.openai.com/api-keys)
3. Click "Create new secret key"
4. Give it a name (e.g., "NHFarming Voice Transcription")
5. Copy the API key (starts with `sk-`)

### **Step 3: Check Usage Limits**
- Free tier: $5 credit per month
- Whisper API: $0.006 per minute of audio
- Perfect for personal use and small farms

## 🔧 **Configuration**

### **Local Development**

1. **Create `.env` file in backend directory:**
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Edit `.env` file:**
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Restart your backend server:**
   ```bash
   npm start
   ```

### **Render Deployment**

1. **Go to your Render dashboard**
2. **Select your backend service**
3. **Go to Environment tab**
4. **Add environment variable:**
   ```
   Key: OPENAI_API_KEY
   Value: sk-your-actual-api-key-here
   ```
5. **Redeploy the service**

## 🧪 **Testing Voice Transcription**

### **Test the API Endpoint**
```bash
# Test with curl (replace with your actual backend URL)
curl -X POST \
  -F "audio=@test-audio.wav" \
  https://your-backend-url.onrender.com/api/whisper
```

### **Test in Browser**
1. Go to your NHFarming application
2. Navigate to Applications page
3. Try the voice input features
4. Record a short audio clip
5. Check if transcription works

## 💰 **Cost Management**

### **Free Tier Limits**
- **Monthly Credit**: $5
- **Whisper Cost**: $0.006 per minute
- **Estimated Usage**: ~833 minutes per month (free)

### **Monitoring Usage**
1. Go to [OpenAI Usage](https://platform.openai.com/usage)
2. Check your current usage
3. Monitor costs

### **Upgrading (if needed)**
- Pay-as-you-go: No monthly commitment
- Automatic billing when credit is used
- Set spending limits in your account

## 🔐 **Security Best Practices**

### **API Key Security**
- ✅ Never commit API keys to git
- ✅ Use environment variables
- ✅ Rotate keys regularly
- ✅ Monitor usage for unusual activity

### **Rate Limiting**
- OpenAI has rate limits per API key
- Implement retry logic in your application
- Handle rate limit errors gracefully

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"OpenAI API key not configured"**
   - Check if OPENAI_API_KEY is set in environment
   - Verify the key is correct
   - Restart the backend server

2. **"Invalid API key"**
   - Verify the key starts with `sk-`
   - Check if the key is active
   - Ensure no extra spaces or characters

3. **"Rate limit exceeded"**
   - Wait a few minutes before retrying
   - Check your usage in OpenAI dashboard
   - Consider upgrading if needed

4. **"Audio file too large"**
   - Whisper supports files up to 25MB
   - Compress audio if needed
   - Use shorter recordings

### **Testing Commands**

```bash
# Test API key validity
curl -H "Authorization: Bearer sk-your-key" \
  https://api.openai.com/v1/models

# Test Whisper endpoint
curl -X POST \
  -H "Authorization: Bearer sk-your-key" \
  -F "file=@test.wav" \
  -F "model=whisper-1" \
  https://api.openai.com/v1/audio/transcriptions
```

## 📱 **Voice Features in NHFarming**

### **Available Voice Features**
- **Voice Input Button**: Click to record voice notes
- **Form Field Voice Input**: Speak to fill form fields
- **Application Notes**: Voice-to-text for application notes
- **Voice Commands**: Navigate the app with voice

### **Supported Audio Formats**
- **MP3**: Most common, good compression
- **MP4**: Video files (audio extracted)
- **Mpeg**: Standard audio format
- **MPGA**: MPEG audio
- **WAV**: Uncompressed audio
- **WebM**: Web audio format

### **Audio Requirements**
- **File Size**: Up to 25MB
- **Duration**: No strict limit (costs per minute)
- **Quality**: Works with various quality levels
- **Language**: Supports 99+ languages

## 🎯 **Next Steps**

1. **Get your OpenAI API key**
2. **Configure it in your environment**
3. **Test voice transcription**
4. **Monitor usage and costs**
5. **Enjoy voice-enabled farming management!**

## 🆘 **Support**

- **OpenAI Documentation**: [Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- **OpenAI Support**: [Help Center](https://help.openai.com/)
- **NHFarming Issues**: Check GitHub repository

---

**Your voice-enabled farm management app is ready! 🎤🚜** 