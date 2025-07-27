const API_URL = 'https://nhfarming-backend.onrender.com/api';

async function updateProductionAdmin() {
  try {
    console.log('🔧 Updating Daniel to admin in production...');
    
    // First, try to login as Daniel
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
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
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Daniel logged in successfully!');
      console.log(`👤 Username: ${loginData.user.username}`);
      console.log(`👑 Current Role: ${loginData.user.role}`);
      console.log(`🆔 User ID: ${loginData.user.id}`);
      
      if (loginData.user.role === 'admin') {
        console.log('🎉 Daniel is already an admin!');
        return;
      }
      
      // Try to access admin endpoints to see if we can make changes
      console.log('🔄 Attempting to update role...');
      
      // Try to make admin using the admin API
      const updateResponse = await fetch(`${API_URL}/admin/users/${loginData.user.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify({ role: 'admin' })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Successfully updated Daniel to admin!');
        console.log('\n🎉 Daniel\'s Admin Account Details:');
        console.log('=====================================');
        console.log(`👤 Username: Daniel`);
        console.log(`🔑 Password: Holl!e2023`);
        console.log(`📧 Email: daniel@nhfarming.com`);
        console.log(`👑 Role: admin`);
        console.log(`🆔 User ID: ${loginData.user.id}`);
        console.log('=====================================');
      } else {
        console.log('⚠️ Could not update via API. Manual intervention may be needed.');
        console.log('Response status:', updateResponse.status);
        
        // Show current account details
        console.log('\n🔐 Daniel\'s Current Account Details:');
        console.log('=====================================');
        console.log(`👤 Username: Daniel`);
        console.log(`🔑 Password: Holl!e2023`);
        console.log(`📧 Email: daniel@nhfarming.com`);
        console.log(`👑 Role: ${loginData.user.role}`);
        console.log(`🆔 User ID: ${loginData.user.id}`);
        console.log('=====================================');
        console.log('\n📋 To make Daniel admin manually:');
        console.log('1. Log into the application as an existing admin');
        console.log('2. Go to Users page');
        console.log('3. Find Daniel in the list');
        console.log('4. Click edit and change role to "admin"');
        console.log('5. Save changes');
      }
      
    } else {
      console.log('❌ Failed to login as Daniel');
      const errorData = await loginResponse.json();
      console.log('Error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Error updating production admin:', error.message);
  }
}

// Run the function
updateProductionAdmin(); 