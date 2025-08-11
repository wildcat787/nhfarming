#!/usr/bin/env node

/**
 * 📝 Test Registration Script
 * 
 * This script registers a new user "Daniel" through the normal registration endpoint
 */

const https = require('https');

const testRegister = () => {
  const data = JSON.stringify({
    username: 'Daniel',
    email: 'daniel@nhfarming.com',
    password: 'Holl!e2023'
  });

  const options = {
    hostname: 'nhfarming-backend.onrender.com',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('📝 Testing registration for user "Daniel"...');
  console.log('URL:', `https://${options.hostname}${options.path}`);

  const req = https.request(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);

    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        console.log('Response:', JSON.stringify(response, null, 2));
        
        if (res.statusCode === 200) {
          console.log('✅ Registration successful!');
          console.log('Token:', response.token ? 'Present' : 'Missing');
          console.log('User:', response.user);
        } else {
          console.log('❌ Registration failed');
          console.log('Error:', response.error);
        }
      } catch (e) {
        console.log('Raw response:', responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
  });

  req.write(data);
  req.end();
};

// Run test
testRegister();
