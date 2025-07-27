const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🎤 OpenAI Voice Transcription Setup');
console.log('===================================');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

console.log(`📁 .env file exists: ${envExists ? '✅ Yes' : '❌ No'}`);

// Check current OpenAI API key
const currentKey = process.env.OPENAI_API_KEY;
console.log(`🔑 OpenAI API Key: ${currentKey ? '✅ Configured' : '❌ NOT CONFIGURED'}`);

if (!currentKey) {
  console.log('\n📋 Setup Instructions:');
  console.log('======================');
  console.log('1. Get your OpenAI API key:');
  console.log('   • Go to https://platform.openai.com/api-keys');
  console.log('   • Sign in or create an account');
  console.log('   • Click "Create new secret key"');
  console.log('   • Copy the key (starts with "sk-")');
  console.log('');
  console.log('2. Configure the API key:');
  console.log('   • Create a .env file in the backend folder');
  console.log('   • Add this line: OPENAI_API_KEY=your_api_key_here');
  console.log('   • Replace "your_api_key_here" with your actual key');
  console.log('');
  console.log('3. For production (Render):');
  console.log('   • Go to your Render dashboard');
  console.log('   • Find your backend service');
  console.log('   • Go to Environment tab');
  console.log('   • Add: OPENAI_API_KEY=your_api_key_here');
  console.log('');
  console.log('4. Test the setup:');
  console.log('   • Run: node test-voice-transcription.js');
  console.log('');
  
  // Create .env file if it doesn't exist
  if (!envExists) {
    console.log('📝 Creating .env file template...');
    const envTemplate = `# OpenAI API Key for Voice Transcription
# Get your key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Other environment variables
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000

# Optional: Weather station configuration
# ECOWITT_LOCAL_URL=http://YOUR_STATION_IP
# ECOWITT_APP_KEY=your_application_key
# ECOWITT_USER_API_KEY=your_api_key
# ECOWITT_DEVICE_MAC=your_device_mac
`;
    
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ .env file created with template');
    console.log('📝 Edit the file and add your OpenAI API key');
  }
} else {
  console.log('\n✅ OpenAI API Key is configured!');
  console.log('🔍 Testing configuration...');
  
  // Test the API key format
  if (currentKey.startsWith('sk-')) {
    console.log('✅ API key format looks correct');
  } else {
    console.log('⚠️  API key format may be incorrect (should start with "sk-")');
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Test voice transcription: node test-voice-transcription.js');
  console.log('2. Use the voice button in your app');
  console.log('3. Check the browser console for any errors');
}

console.log('\n💰 Cost Information:');
console.log('===================');
console.log('• Free tier: $5 credit per month');
console.log('• Cost per minute: $0.006');
console.log('• Estimated usage: ~833 minutes per month (free)');
console.log('• Voice transcription is very affordable');

console.log('\n🔧 Troubleshooting:');
console.log('==================');
console.log('• Make sure your API key is correct');
console.log('• Check your OpenAI account has credits');
console.log('• Ensure microphone permissions are granted');
console.log('• Try in a different browser if issues persist');
console.log('• Check browser console for detailed error messages'); 