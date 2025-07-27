const fetch = require('node-fetch');
require('dotenv').config();

async function testVoiceTranscription() {
  console.log('🎤 Testing Voice Transcription API');
  console.log('==================================');
  
  // Check if API key is configured
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('❌ OpenAI API key not configured');
    console.log('📋 Run: node setup-openai-voice.js');
    return;
  }
  
  console.log('✅ OpenAI API key found');
  
  // Test the whisper endpoint
  const testUrl = 'http://localhost:5000/api/whisper';
  
  try {
    console.log('🔍 Testing whisper endpoint...');
    
    // Create a simple test request
    const formData = new FormData();
    
    // Create a minimal audio file (this is just for testing the endpoint structure)
    const testResponse = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData
    });
    
    if (testResponse.status === 400) {
      console.log('✅ Endpoint is working (expected error for no audio file)');
      console.log('📋 The API is ready to receive audio files');
    } else if (testResponse.status === 500) {
      const errorData = await testResponse.json();
      if (errorData.error === 'OpenAI API key not configured') {
        console.log('❌ OpenAI API key not configured in server');
        console.log('📋 Make sure your .env file is in the backend folder');
      } else {
        console.log('⚠️  Server error:', errorData.error);
      }
    } else {
      console.log(`⚠️  Unexpected response: ${testResponse.status}`);
    }
    
  } catch (error) {
    console.log('❌ Cannot connect to server');
    console.log('📋 Make sure your backend server is running:');
    console.log('   cd backend && npm start');
  }
  
  console.log('\n📋 Manual Testing Steps:');
  console.log('========================');
  console.log('1. Start your backend server:');
  console.log('   cd backend && npm start');
  console.log('');
  console.log('2. Start your frontend:');
  console.log('   cd frontend && npm start');
  console.log('');
  console.log('3. Log into your app');
  console.log('');
  console.log('4. Click the purple voice button');
  console.log('');
  console.log('5. Allow microphone access when prompted');
  console.log('');
  console.log('6. Speak clearly and click again to stop');
  console.log('');
  console.log('7. Check for transcription results');
  
  console.log('\n🔧 Common Issues:');
  console.log('================');
  console.log('• "OpenAI API key not configured" - Add your API key to .env');
  console.log('• "No audio file uploaded" - Microphone not working');
  console.log('• "Transcription failed" - Check API key and credits');
  console.log('• "Failed to transcribe audio" - Network/server issue');
  
  console.log('\n💰 Cost Check:');
  console.log('==============');
  console.log('• Check your OpenAI usage: https://platform.openai.com/usage');
  console.log('• Free tier: $5/month');
  console.log('• Voice transcription: $0.006/minute');
}

// Run the test
testVoiceTranscription(); 