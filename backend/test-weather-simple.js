#!/usr/bin/env node

// Simple weather integration test script
// Run with: node test-weather-simple.js

console.log('🌤️  NHFarming Weather Integration Test');
console.log('=====================================\n');

// Test 1: Check if Ecowitt module can be loaded
console.log('1. Testing module import...');
try {
  const ecowitt = require('./ecowitt');
  console.log('   ✅ Ecowitt module loaded successfully\n');
} catch (error) {
  console.log('   ❌ Failed to load Ecowitt module:', error.message);
  console.log('   Make sure all dependencies are installed: npm install\n');
  process.exit(1);
}

// Test 2: Check environment variables
console.log('2. Checking environment variables...');
const envVars = {
  localUrl: process.env.ECOWITT_LOCAL_URL,
  appKey: process.env.ECOWITT_APP_KEY,
  userApiKey: process.env.ECOWITT_USER_API_KEY,
  deviceMac: process.env.ECOWITT_DEVICE_MAC
};

console.log('   Local URL configured:', envVars.localUrl ? '✅ Yes' : '❌ No');
console.log('   Cloud API configured:', (envVars.appKey && envVars.userApiKey) ? '✅ Yes' : '❌ No');
console.log('   Device MAC configured:', envVars.deviceMac ? '✅ Yes' : '❌ No');

const isConfigured = envVars.localUrl || (envVars.appKey && envVars.userApiKey);
console.log('   Overall configuration:', isConfigured ? '✅ Ready' : '❌ Needs setup\n');

if (!isConfigured) {
  console.log('   To configure your weather station:');
  console.log('   - Set ECOWITT_LOCAL_URL for local connection');
  console.log('   - Set ECOWITT_APP_KEY, ECOWITT_USER_API_KEY, and ECOWITT_DEVICE_MAC for cloud API');
  console.log('   - See ECOWITT_SETUP.md for detailed instructions\n');
}

// Test 3: Test configuration endpoint (if server is running)
console.log('3. Testing configuration endpoint...');
const http = require('http');

function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`   ${description}: ✅ Success`);
          console.log(`      Response:`, JSON.stringify(jsonData, null, 2));
        } catch (e) {
          console.log(`   ${description}: ❌ Invalid JSON response`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`   ${description}: ❌ Connection failed (${error.message})`);
      console.log('      Make sure the backend server is running: npm start');
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`   ${description}: ❌ Timeout`);
      resolve();
    });

    req.end();
  });
}

// Test endpoints
async function runEndpointTests() {
  await testEndpoint('/ecowitt/config', 'Configuration check');
  console.log('');
  
  if (isConfigured) {
    await testEndpoint('/ecowitt/current', 'Current weather');
    console.log('');
    await testEndpoint('/ecowitt/historical/2024-01-15', 'Historical weather');
    console.log('');
  }
}

runEndpointTests().then(() => {
  console.log('4. Summary:');
  if (isConfigured) {
    console.log('   ✅ Weather integration is configured');
    console.log('   ✅ Ready to test with your weather station');
    console.log('\n   Next steps:');
    console.log('   1. Start the backend: npm start');
    console.log('   2. Start the frontend: cd ../frontend && npm start');
    console.log('   3. Test in the browser: http://localhost:3000');
    console.log('   4. Go to Applications page and try the weather features');
  } else {
    console.log('   ❌ Weather integration needs configuration');
    console.log('\n   Next steps:');
    console.log('   1. Configure your Ecowitt weather station');
    console.log('   2. Set the required environment variables');
    console.log('   3. Run this test again');
    console.log('   4. See ECOWITT_SETUP.md for detailed instructions');
  }
  
  console.log('\n🌤️  Test completed!');
}); 