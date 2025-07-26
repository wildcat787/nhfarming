const PRODUCTION_API_URL = 'https://nhfarming-backend.onrender.com/api';

async function updateProductionAdmin() {
  console.log('🔧 Updating production database and making Daniel admin...');
  
  try {
    // First, login as migration_user to get a token
    const loginResponse = await fetch(`${PRODUCTION_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'migration_user',
        password: 'migration_pass_123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error('Failed to login as migration_user');
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    console.log('✅ Logged in as migration_user');
    
    // Check current user info
    const meResponse = await fetch(`${PRODUCTION_API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (meResponse.ok) {
      const userData = await meResponse.json();
      console.log(`📋 Current user: ${userData.username} (Role: ${userData.role})`);
    }
    
    // Try to access admin users endpoint (should fail for regular user)
    console.log('🔒 Testing admin access...');
    const adminResponse = await fetch(`${PRODUCTION_API_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (adminResponse.status === 403) {
      console.log('✅ Admin access correctly denied for regular user');
    } else {
      console.log(`⚠️  Unexpected admin response: ${adminResponse.status}`);
    }
    
    // Now let's try to login as Daniel
    console.log('🔑 Trying to login as Daniel...');
    const danielLoginResponse = await fetch(`${PRODUCTION_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Daniel',
        password: 'default_password_123'
      })
    });
    
    if (danielLoginResponse.ok) {
      const danielData = await danielLoginResponse.json();
      console.log('✅ Daniel login successful!');
      console.log(`📋 Daniel's role: ${danielData.user.role}`);
      
      if (danielData.user.role === 'admin') {
        console.log('🎉 Daniel is already an admin!');
        
        // Test admin access
        const danielAdminResponse = await fetch(`${PRODUCTION_API_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${danielData.token}` }
        });
        
        if (danielAdminResponse.ok) {
          const users = await danielAdminResponse.json();
          console.log('✅ Daniel can access admin routes!');
          console.log('📋 Users in system:');
          users.forEach(user => {
            console.log(`  - ${user.username} (ID: ${user.id}, Role: ${user.role})`);
          });
        } else {
          console.log(`❌ Daniel cannot access admin routes: ${danielAdminResponse.status}`);
        }
      } else {
        console.log('⚠️  Daniel is not an admin yet');
      }
    } else {
      console.log('❌ Daniel login failed - user may not exist or wrong password');
      
      // Let's try to register Daniel as admin
      console.log('📝 Attempting to register Daniel as admin...');
      const registerResponse = await fetch(`${PRODUCTION_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Daniel',
          password: 'admin_password_123',
          email: 'daniel@farm.com'
        })
      });
      
      if (registerResponse.ok) {
        const registerData = await registerResponse.json();
        console.log('✅ Daniel registered successfully!');
        console.log(`📋 Daniel's role: ${registerData.user.role}`);
        
        // Note: New users get 'user' role by default, so we'd need admin access to change it
        console.log('⚠️  Note: New users get "user" role by default');
        console.log('💡 You may need to manually update Daniel to admin in the database');
      } else {
        const errorData = await registerResponse.json();
        console.log(`❌ Registration failed: ${errorData.error}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateProductionAdmin(); 