#!/usr/bin/env node

/**
 * 👑 Make Admin Script
 * 
 * This script updates user "Daniel" to admin role
 */

const https = require('https');

const makeAdmin = () => {
  const data = JSON.stringify({
    secret: 'NHFarming2025!'
  });

  const options = {
    hostname: 'nhfarming-backend.onrender.com',
    port: 443,
    path: '/api/update-to-admin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('👑 Updating user "Daniel" to admin...');
  console.log('URL:', `https://${options.hostname}${options.path}`);

  const req = https.request(options, (res) => {
    console.log('Status:', res.statusCode);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        console.log('Response:', JSON.stringify(response, null, 2));
        
        if (res.statusCode === 200) {
          console.log('✅ User updated to admin successfully!');
          console.log('Now test login...');
          
          // Test login
          setTimeout(testLogin, 2000);
        } else {
          console.log('❌ Update failed:', response.error);
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

const testLogin = () => {
  console.log('🔍 Testing login after admin update...');
  
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

  const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        console.log('Login Response:', JSON.stringify(response, null, 2));
        
        if (res.statusCode === 200) {
          console.log('✅ Login successful!');
          console.log('User role:', response.user.role);
          console.log('Email verified:', response.user.email_verified);
          console.log('');
          console.log('🎉 SUCCESS: User "Daniel" is now an admin!');
          console.log('You can now login at: https://nhfarming-frontend.onrender.com');
        } else {
          console.log('❌ Login failed:', response.error);
        }
      } catch (e) {
        console.log('Raw login response:', responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Login request error:', e.message);
  });

  req.write(data);
  req.end();
};

// Wait for deployment and run
console.log('⏳ Waiting for deployment to complete...');
setTimeout(makeAdmin, 30000);
