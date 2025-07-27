const API_URL = 'https://nhfarming-backend.onrender.com/api';

async function checkProductionUsers() {
  try {
    console.log('🌐 Checking Users in Production Environment');
    console.log('============================================');
    
    // Try to login as Daniel first
    console.log('🔑 Attempting to login as Daniel...');
    const danielLoginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Daniel',
        password: 'Holl!e2023',
        email: 'daniel@nhfarming.com'
      })
    });
    
    if (danielLoginResponse.ok) {
      const danielData = await danielLoginResponse.json();
      console.log('✅ Daniel login successful!');
      console.log(`👤 Username: ${danielData.user.username}`);
      console.log(`👑 Role: ${danielData.user.role}`);
      console.log(`🆔 User ID: ${danielData.user.id}`);
      console.log(`✅ Email Verified: ${danielData.user.email_verified ? 'Yes' : 'No'}`);
      
      // Try to access admin users endpoint
      console.log('\n🔍 Attempting to access admin users list...');
      const usersResponse = await fetch(`${API_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${danielData.token}`
        }
      });
      
      if (usersResponse.ok) {
        const users = await usersResponse.json();
        console.log('\n📋 All Users in Production:');
        console.log('=====================================');
        
        users.forEach((user, index) => {
          console.log(`${index + 1}. 👤 ${user.username}`);
          console.log(`   🆔 ID: ${user.id}`);
          console.log(`   👑 Role: ${user.role}`);
          console.log(`   ✅ Verified: ${user.email_verified ? 'Yes' : 'No'}`);
          console.log(`   📅 Created: ${user.created_at || 'Unknown'}`);
          console.log('');
        });
        
        // Summary
        const adminCount = users.filter(u => u.role === 'admin').length;
        const userCount = users.filter(u => u.role === 'user').length;
        
        console.log('📊 Production Summary:');
        console.log(`   👑 Admins: ${adminCount}`);
        console.log(`   👤 Regular Users: ${userCount}`);
        console.log(`   📈 Total Users: ${users.length}`);
        
      } else {
        console.log('❌ Cannot access admin users list');
        console.log('Response status:', usersResponse.status);
        console.log('This means Daniel is not an admin yet');
        
        // Show Daniel's current status
        console.log('\n📋 Daniel\'s Current Status:');
        console.log('=====================================');
        console.log(`👤 Username: ${danielData.user.username}`);
        console.log(`👑 Role: ${danielData.user.role}`);
        console.log(`🆔 User ID: ${danielData.user.id}`);
        console.log(`✅ Email Verified: ${danielData.user.email_verified ? 'Yes' : 'No'}`);
        console.log('=====================================');
        console.log('\n⚠️  Daniel needs to be upgraded to admin to view all users');
      }
      
    } else {
      console.log('❌ Daniel login failed');
      const errorData = await danielLoginResponse.json();
      console.log('Error:', errorData);
      
      // Try to register Daniel if login fails
      console.log('\n🆕 Attempting to register Daniel...');
      const registerResponse = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'Daniel',
          password: 'Holl!e2023',
          email: 'daniel@nhfarming.com'
        })
      });
      
      if (registerResponse.ok) {
        console.log('✅ Daniel registered successfully!');
        console.log('📋 Daniel\'s Account Details:');
        console.log('=====================================');
        console.log(`👤 Username: Daniel`);
        console.log(`🔑 Password: Holl!e2023`);
        console.log(`📧 Email: daniel@nhfarming.com`);
        console.log(`👑 Role: user (needs admin upgrade)`);
        console.log('=====================================');
      } else {
        const errorData = await registerResponse.json();
        console.log('❌ Registration failed:', errorData);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking production users:', error.message);
  }
}

// Run the function
checkProductionUsers(); 