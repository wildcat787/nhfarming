#!/usr/bin/env node

/**
 * 🔍 Test Login Script
 * 
 * This script tests the login functionality for user "Daniel"
 */

const https = require('https');

const testLogin = () => {
  const data = JSON.stringify({
    username: 'Daniel',
    password: 'Holl!e2023'
  });

  const options = {
    hostname: 'nhfarming-backend.onrender.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('🔍 Testing login for user "Daniel"...');
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
          console.log('✅ Login successful!');
          console.log('Token:', response.token ? 'Present' : 'Missing');
          console.log('User:', response.user);
        } else {
          console.log('❌ Login failed');
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

// Also test the health endpoint
const testHealth = () => {
  console.log('\n🏥 Testing health endpoint...');
  
  const options = {
    hostname: 'nhfarming-backend.onrender.com',
    port: 443,
    path: '/health',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    console.log('Health Status:', res.statusCode);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        console.log('Health Response:', response);
      } catch (e) {
        console.log('Raw health response:', responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Health check error:', e.message);
  });

  req.end();
};

// Run tests
testHealth();
setTimeout(testLogin, 2000);
