const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function testAdminAccess() {
  console.log('🧪 Testing Admin Access for Daniel...\n');

  try {
    // 1. Login as Daniel
    console.log('1. Logging in as Daniel...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Daniel', password: 'password123' })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');
    console.log(`   User: ${loginData.user.username}`);
    console.log(`   Role: ${loginData.user.role}`);
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // 2. Test admin users endpoint
    console.log('2. Testing admin users endpoint...');
    const usersResponse = await fetch(`${API_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!usersResponse.ok) {
      throw new Error(`Admin users endpoint failed: ${usersResponse.statusText}`);
    }

    const users = await usersResponse.json();
    console.log('✅ Admin users endpoint accessible');
    console.log(`   Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - ID: ${user.id}`);
    });
    console.log('');

    // 3. Test getting a specific user
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`3. Testing get user by ID (${testUser.id})...`);
      const userResponse = await fetch(`${API_URL}/admin/users/${testUser.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!userResponse.ok) {
        throw new Error(`Get user endpoint failed: ${userResponse.statusText}`);
      }

      const userData = await userResponse.json();
      console.log('✅ Get user endpoint accessible');
      console.log(`   User details: ${userData.username} (${userData.role})`);
      console.log('');

      // 4. Test updating user role
      console.log('4. Testing update user role...');
      const updateResponse = await fetch(`${API_URL}/admin/users/${testUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: testUser.role }) // Keep same role for testing
      });

      if (!updateResponse.ok) {
        throw new Error(`Update user endpoint failed: ${updateResponse.statusText}`);
      }

      const updateData = await updateResponse.json();
      console.log('✅ Update user endpoint accessible');
      console.log(`   Response: ${updateData.message}`);
      console.log('');

      // 5. Test password change endpoint
      console.log('5. Testing password change endpoint...');
      const passwordResponse = await fetch(`${API_URL}/admin/users/${testUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword: 'testpassword123' })
      });

      if (!passwordResponse.ok) {
        throw new Error(`Password change endpoint failed: ${passwordResponse.statusText}`);
      }

      const passwordData = await passwordResponse.json();
      console.log('✅ Password change endpoint accessible');
      console.log(`   Response: ${passwordData.message}`);
      console.log('');

    }

    console.log('🎉 All admin functionality tests passed!');
    console.log('Daniel has full admin access and can:');
    console.log('   ✅ View all users');
    console.log('   ✅ Get user details');
    console.log('   ✅ Update user information');
    console.log('   ✅ Change user passwords');
    console.log('   ✅ Manage user roles');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAdminAccess(); 