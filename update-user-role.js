#!/usr/bin/env node

/**
 * 🔧 Update User Role Script
 * 
 * This script updates user "Daniel" to have admin role and email verification
 */

const https = require('https');

const updateUserRole = () => {
  // First, login to get a token
  const loginData = JSON.stringify({
    username: 'Daniel',
    password: 'Holl!e2023'
  });

  const loginOptions = {
    hostname: 'nhfarming-backend.onrender.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': loginData.length
    }
  };

  console.log('🔐 Logging in to get token...');

  const loginReq = https.request(loginOptions, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        
        if (res.statusCode === 200 && response.token) {
          console.log('✅ Login successful, got token');
          
          // Now update the user profile to admin
          updateProfile(response.token);
        } else {
          console.log('❌ Login failed:', response.error);
        }
      } catch (e) {
        console.log('Raw response:', responseData);
      }
    });
  });

  loginReq.on('error', (e) => {
    console.error('❌ Login request error:', e.message);
  });

  loginReq.write(loginData);
  loginReq.end();
};

const updateProfile = (token) => {
  console.log('🔧 Updating user profile to admin...');
  
  // Since we can't directly update role through profile, let's try the admin creation endpoint
  const adminData = JSON.stringify({
    secret: 'NHFarming2025!'
  });

  const adminOptions = {
    hostname: 'nhfarming-backend.onrender.com',
    port: 443,
    path: '/api/create-admin',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': adminData.length
    }
  };

  const adminReq = https.request(adminOptions, (res) => {
    console.log('Admin Update Status:', res.statusCode);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        console.log('Admin Update Response:', JSON.stringify(response, null, 2));
        
        if (res.statusCode === 200) {
          console.log('✅ User updated to admin successfully!');
          console.log('Now test login again...');
          
          // Test login again
          setTimeout(testLoginAgain, 2000);
        } else {
          console.log('❌ Admin update failed:', response.error);
        }
      } catch (e) {
        console.log('Raw admin response:', responseData);
      }
    });
  });

  adminReq.on('error', (e) => {
    console.error('❌ Admin update request error:', e.message);
  });

  adminReq.write(adminData);
  adminReq.end();
};

const testLoginAgain = () => {
  console.log('🔍 Testing login again after admin update...');
  
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
        console.log('Final Login Response:', JSON.stringify(response, null, 2));
        
        if (res.statusCode === 200) {
          console.log('✅ Final login successful!');
          console.log('User role:', response.user.role);
          console.log('Email verified:', response.user.email_verified);
        } else {
          console.log('❌ Final login failed:', response.error);
        }
      } catch (e) {
        console.log('Raw final response:', responseData);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Final login request error:', e.message);
  });

  req.write(data);
  req.end();
};

// Run the update
updateUserRole();
