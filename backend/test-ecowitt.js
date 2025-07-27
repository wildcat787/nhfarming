// Test script for Ecowitt weather station integration
const ecowittRouter = require('./ecowitt');

console.log('✓ Ecowitt module loaded successfully');

// Test configuration
const testConfig = {
  localConfigured: !!process.env.ECOWITT_LOCAL_URL,
  cloudConfigured: !!(process.env.ECOWITT_APP_KEY && process.env.ECOWITT_USER_API_KEY),
  deviceConfigured: !!process.env.ECOWITT_DEVICE_MAC,
  available: !!(process.env.ECOWITT_LOCAL_URL || (process.env.ECOWITT_APP_KEY && process.env.ECOWITT_USER_API_KEY))
};

console.log('Configuration status:');
console.log('- Local connection configured:', testConfig.localConfigured);
console.log('- Cloud API configured:', testConfig.cloudConfigured);
console.log('- Device MAC configured:', testConfig.deviceConfigured);
console.log('- Integration available:', testConfig.available);

if (testConfig.available) {
  console.log('✓ Ecowitt integration is properly configured');
} else {
  console.log('⚠ Ecowitt integration needs configuration');
  console.log('Please set the required environment variables as described in ECOWITT_SETUP.md');
}

console.log('\nTo test the integration:');
console.log('1. Set up your environment variables');
console.log('2. Start the backend server: npm start');
console.log('3. Test the endpoints:');
console.log('   - GET /api/ecowitt/config');
console.log('   - GET /api/ecowitt/current');
console.log('   - GET /api/ecowitt/historical/2024-01-15'); 