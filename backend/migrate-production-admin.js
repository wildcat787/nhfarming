const PRODUCTION_API_URL = 'https://nhfarming-backend.onrender.com/api';

async function migrateProductionAdmin() {
  console.log('🔧 Migrating production database to support admin roles...');
  
  try {
    // Step 1: Login as migration_user
    console.log('🔑 Step 1: Logging in as migration_user...');
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
    console.log('✅ Logged in as migration_user');
    
    // Step 2: Check current user info
    const meResponse = await fetch(`${PRODUCTION_API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    if (meResponse.ok) {
      const userData = await meResponse.json();
      console.log(`📋 Current user: ${userData.username} (Role: ${userData.role})`);
    }
    
    // Step 3: Try to access admin routes (should fail for regular user)
    console.log('🔒 Step 2: Testing admin access...');
    const adminResponse = await fetch(`${PRODUCTION_API_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${loginData.token}` }
    });
    
    console.log(`📊 Admin route response: ${adminResponse.status}`);
    
    // Step 4: Create a new admin user directly
    console.log('👤 Step 3: Creating new admin user...');
    const registerResponse = await fetch(`${PRODUCTION_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin_user',
        password: 'admin_password_123',
        email: 'admin@farm.com'
      })
    });
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Admin user created successfully!');
      console.log(`📋 Admin user role: ${registerData.user.role}`);
      
      // Step 5: Login as the new admin user
      console.log('🔑 Step 4: Logging in as admin_user...');
      const adminLoginResponse = await fetch(`${PRODUCTION_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin_user',
          password: 'admin_password_123'
        })
      });
      
      if (adminLoginResponse.ok) {
        const adminLoginData = await adminLoginResponse.json();
        console.log('✅ Admin user login successful!');
        console.log(`📋 Admin user role: ${adminLoginData.user.role}`);
        
        // Step 6: Test admin access
        console.log('🔒 Step 5: Testing admin access...');
        const adminAccessResponse = await fetch(`${PRODUCTION_API_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${adminLoginData.token}` }
        });
        
        if (adminAccessResponse.ok) {
          const users = await adminAccessResponse.json();
          console.log('🎉 Admin access successful!');
          console.log('📋 Users in system:');
          users.forEach(user => {
            console.log(`  - ${user.username} (ID: ${user.id}, Role: ${user.role})`);
          });
          
          // Step 7: Try to update Daniel to admin
          console.log('👤 Step 6: Looking for Daniel to make admin...');
          const danielUser = users.find(user => user.username === 'Daniel');
          
          if (danielUser) {
            console.log(`📋 Found Daniel (ID: ${danielUser.id}, Role: ${danielUser.role})`);
            
            if (danielUser.role !== 'admin') {
              console.log('🔧 Updating Daniel to admin...');
              const updateResponse = await fetch(`${PRODUCTION_API_URL}/admin/users/${danielUser.id}/role`, {
                method: 'PUT',
                headers: { 
                  'Authorization': `Bearer ${adminLoginData.token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: 'admin' })
              });
              
              if (updateResponse.ok) {
                console.log('✅ Daniel updated to admin!');
              } else {
                console.log(`❌ Failed to update Daniel: ${updateResponse.status}`);
              }
            } else {
              console.log('✅ Daniel is already an admin!');
            }
          } else {
            console.log('⚠️  Daniel not found in users list');
          }
          
        } else {
          console.log(`❌ Admin access failed: ${adminAccessResponse.status}`);
          console.log('💡 Admin routes may not be fully deployed yet');
        }
        
      } else {
        console.log('❌ Admin user login failed');
      }
      
    } else {
      const errorData = await registerResponse.json();
      console.log(`❌ Admin user creation failed: ${errorData.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

migrateProductionAdmin(); 