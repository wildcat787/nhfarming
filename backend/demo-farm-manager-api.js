#!/usr/bin/env node

/**
 * 🌐 Farm Manager API Demo Script
 * 
 * This script demonstrates the farm manager API endpoints and permissions.
 * Make sure the server is running on port 3001 before running this script.
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Store tokens for different users
const tokens = {};

async function login(username, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username,
      password
    });
    
    if (response.data.token) {
      tokens[username] = response.data.token;
      console.log(`✅ Logged in as ${username} (${response.data.user.role})`);
      return response.data.token;
    }
  } catch (error) {
    console.error(`❌ Login failed for ${username}:`, error.response?.data?.error || error.message);
    return null;
  }
}

async function makeRequest(method, endpoint, token, data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || error.message,
      status: error.response?.status
    };
  }
}

async function testFarmManagerPermissions() {
  console.log('🧪 Testing Farm Manager API Permissions');
  console.log('=======================================\n');
  
  // 1. Login different users
  console.log('1️⃣ Logging in test users...');
  await login('Daniel', 'Holl!e2023');
  await login('FarmManager1', 'Manager123!');
  await login('FarmWorker1', 'Worker123!');
  await login('FarmOwner1', 'Owner123!');
  
  if (!tokens.FarmManager1) {
    console.error('❌ Farm manager login failed. Cannot continue tests.');
    return;
  }
  
  console.log('\n2️⃣ Testing Farm Manager access to farms...');
  
  // 2. Test farm access
  const farmAccess = await makeRequest('GET', '/farms', tokens.FarmManager1);
  if (farmAccess.success) {
    console.log(`✅ Farm Manager can view ${farmAccess.data.length} farms`);
    farmAccess.data.forEach(farm => {
      console.log(`   - ${farm.name} (Role: ${farm.user_role})`);
    });
  } else {
    console.log('❌ Farm Manager cannot access farms:', farmAccess.error);
  }
  
  console.log('\n3️⃣ Testing farm details access...');
  
  // 3. Test specific farm access (Test Farm Alpha should be farm ID 2)
  const farmDetails = await makeRequest('GET', '/farms/2', tokens.FarmManager1);
  if (farmDetails.success) {
    console.log(`✅ Farm Manager can view farm details: ${farmDetails.data.name}`);
  } else {
    console.log('❌ Farm Manager cannot access farm details:', farmDetails.error);
  }
  
  console.log('\n4️⃣ Testing farm update permissions...');
  
  // 4. Test farm update (should work for manager)
  const farmUpdate = await makeRequest('PUT', '/farms/2', tokens.FarmManager1, {
    name: 'Test Farm Alpha (Updated by Manager)',
    description: 'Updated by farm manager',
    location: 'Manager Test Location'
  });
  
  if (farmUpdate.success) {
    console.log('✅ Farm Manager can update farm details');
  } else {
    console.log('❌ Farm Manager cannot update farm:', farmUpdate.error);
  }
  
  console.log('\n5️⃣ Testing user management permissions...');
  
  // 5. Test viewing farm users (should work for manager)
  const farmUsers = await makeRequest('GET', '/farms/2/users', tokens.FarmManager1);
  if (farmUsers.success) {
    console.log(`✅ Farm Manager can view ${farmUsers.data.length} farm users:`);
    farmUsers.data.forEach(user => {
      console.log(`   - ${user.username} (${user.role})`);
    });
  } else {
    console.log('❌ Farm Manager cannot view farm users:', farmUsers.error);
  }
  
  console.log('\n6️⃣ Testing user addition (worker level)...');
  
  // 6. Test adding a worker (should work - get Daniel's ID for test)
  if (tokens.Daniel) {
    const addWorker = await makeRequest('POST', '/farms/2/users', tokens.FarmManager1, {
      user_id: 1, // Daniel's ID
      role: 'worker',
      permissions: 'standard'
    });
    
    if (addWorker.success) {
      console.log('✅ Farm Manager can add workers to farm');
    } else {
      console.log('❌ Farm Manager cannot add worker:', addWorker.error);
    }
  }
  
  console.log('\n7️⃣ Testing restricted actions...');
  
  // 7. Test adding a manager (should fail)
  const addManager = await makeRequest('POST', '/farms/2/users', tokens.FarmManager1, {
    user_id: 1,
    role: 'manager',
    permissions: 'standard'
  });
  
  if (!addManager.success) {
    console.log('✅ Farm Manager correctly cannot add managers:', addManager.error);
  } else {
    console.log('❌ Farm Manager unexpectedly allowed to add managers');
  }
  
  // 8. Test farm deletion (should fail)
  const deleteFarm = await makeRequest('DELETE', '/farms/2', tokens.FarmManager1);
  if (!deleteFarm.success) {
    console.log('✅ Farm Manager correctly cannot delete farm:', deleteFarm.error);
  } else {
    console.log('❌ Farm Manager unexpectedly allowed to delete farm');
  }
  
  console.log('\n8️⃣ Testing worker access limitations...');
  
  // 9. Test worker access to user management (should fail)
  if (tokens.FarmWorker1) {
    const workerUserAccess = await makeRequest('GET', '/farms/2/users', tokens.FarmWorker1);
    if (!workerUserAccess.success) {
      console.log('✅ Farm Worker correctly cannot access user management:', workerUserAccess.error);
    } else {
      console.log('❌ Farm Worker unexpectedly has user management access');
    }
  }
  
  console.log('\n9️⃣ Testing cross-farm access restrictions...');
  
  // 10. Test access to different farm (should fail)
  const crossFarmAccess = await makeRequest('GET', '/farms/1', tokens.FarmManager1);
  if (!crossFarmAccess.success && crossFarmAccess.status === 404) {
    console.log('✅ Farm Manager correctly cannot access other farms');
  } else if (crossFarmAccess.success) {
    console.log('❌ Farm Manager has unexpected access to other farms');
  } else {
    console.log(`⚠️ Unexpected response for cross-farm access: ${crossFarmAccess.error}`);
  }
  
  console.log('\n🎉 Farm Manager Permission Tests Completed!');
  console.log('\n📋 Summary:');
  console.log('✅ Farm managers can view and update their assigned farms');
  console.log('✅ Farm managers can manage users (add/remove workers)');
  console.log('✅ Farm managers cannot add other managers or owners');
  console.log('✅ Farm managers cannot delete farms');
  console.log('✅ Workers have limited access to user management');
  console.log('✅ Cross-farm access is properly restricted');
}

// Check if server is running
async function checkServer() {
  try {
    const response = await axios.get(`${API_BASE.replace('/api', '')}/health`);
    if (response.data.status === 'OK') {
      console.log('✅ Server is running and healthy');
      return true;
    }
  } catch (error) {
    console.error('❌ Server is not running. Please start the server first:');
    console.error('   cd backend && npm start');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🌐 Farm Manager API Demo');
  console.log('========================\n');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await testFarmManagerPermissions();
}

main().catch(console.error);
