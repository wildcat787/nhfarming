const API_URL = 'https://nhfarming-backend.onrender.com/api';

async function verifyAdminLogin() {
  try {
    console.log('🔍 Verifying Admin Login');
    console.log('========================');
    
    // Login as admin with fresh credentials
    console.log('🔑 Logging in as admin...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
        email: 'admin@nhfarming.com'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Admin login successful!');
      console.log(`👤 Username: ${loginData.user.username}`);
      console.log(`👑 Role: ${loginData.user.role}`);
      console.log(`🆔 User ID: ${loginData.user.id}`);
      
      if (loginData.user.role === 'admin') {
        console.log('🎉 Admin role confirmed!');
        
        // Try to access admin users endpoint
        console.log('\n📋 Testing admin access...');
        const usersResponse = await fetch(`${API_URL}/admin/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
          }
        });
        
        if (usersResponse.ok) {
          const users = await usersResponse.json();
          console.log('✅ Admin access confirmed!');
          console.log('\n📋 All Users in Production:');
          console.log('=====================================');
          
          users.forEach((user, index) => {
            console.log(`${index + 1}. 👤 ${user.username}`);
            console.log(`   🆔 ID: ${user.id}`);
            console.log(`   👑 Role: ${user.role}`);
            console.log(`   📧 Email: ${user.email || 'N/A'}`);
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
          console.log('❌ Admin access test failed');
          console.log('Response status:', usersResponse.status);
        }
        
        console.log('\n🎉 Working Admin Account:');
        console.log('=====================================');
        console.log(`👤 Username: admin`);
        console.log(`🔑 Password: admin123`);
        console.log(`📧 Email: admin@nhfarming.com`);
        console.log(`👑 Role: admin`);
        console.log(`🆔 User ID: ${loginData.user.id}`);
        console.log('=====================================');
        
        console.log('\n🔐 You can now log into your NHFarming app with:');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('\n🚀 This account has full administrative access!');
        
      } else {
        console.log('⚠️  Admin role not confirmed');
        console.log(`Current role: ${loginData.user.role}`);
        
        console.log('\n📋 Account Details:');
        console.log('=====================================');
        console.log(`👤 Username: admin`);
        console.log(`🔑 Password: admin123`);
        console.log(`📧 Email: admin@nhfarming.com`);
        console.log(`👑 Role: ${loginData.user.role}`);
        console.log(`🆔 User ID: ${loginData.user.id}`);
        console.log('=====================================');
        
        console.log('\n💡 You can log in, but may need admin role upgrade');
      }
      
    } else {
      console.log('❌ Admin login failed');
      const errorData = await loginResponse.json();
      console.log('Error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Error verifying admin login:', error.message);
  }
}

// Run the function
verifyAdminLogin(); 