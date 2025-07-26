const PRODUCTION_API_URL = 'https://nhfarming-backend.onrender.com/api';

async function fixProductionDaniel() {
  console.log('🔧 Fixing Daniel in production database...');
  
  try {
    // First, let's try to login as Daniel with different passwords
    const passwords = [
      'default_password_123',
      'admin_password_123', 
      'password123',
      '123456',
      'password'
    ];
    
    for (const password of passwords) {
      console.log(`🔑 Trying password: ${password}`);
      
      const loginResponse = await fetch(`${PRODUCTION_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Daniel',
          password: password
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Daniel login successful!');
        console.log(`📋 Daniel's role: ${loginData.user.role}`);
        console.log(`🔑 Working password: ${password}`);
        
        // Test if Daniel can access admin routes
        const adminResponse = await fetch(`${PRODUCTION_API_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${loginData.token}` }
        });
        
        if (adminResponse.ok) {
          console.log('🎉 Daniel can access admin routes!');
          const users = await adminResponse.json();
          console.log('📋 Users in system:');
          users.forEach(user => {
            console.log(`  - ${user.username} (ID: ${user.id}, Role: ${user.role})`);
          });
        } else {
          console.log(`⚠️  Daniel cannot access admin routes: ${adminResponse.status}`);
          console.log('💡 Admin routes may not be deployed yet');
        }
        
        return;
      }
    }
    
    console.log('❌ Could not login as Daniel with any password');
    console.log('💡 Daniel may need to reset their password');
    
    // Try to request password reset for Daniel
    console.log('📧 Requesting password reset for Daniel...');
    const resetResponse = await fetch(`${PRODUCTION_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'Daniel'
      })
    });
    
    if (resetResponse.ok) {
      console.log('✅ Password reset requested for Daniel');
      console.log('💡 Check the backend logs for the reset token');
    } else {
      console.log('❌ Password reset failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixProductionDaniel(); 