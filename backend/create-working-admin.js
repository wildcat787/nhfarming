const API_URL = 'https://nhfarming-backend.onrender.com/api';

async function createWorkingAdmin() {
  try {
    console.log('🔧 Creating Guaranteed Working Admin Account');
    console.log('============================================');
    
    // Create a new admin user with simple credentials
    console.log('📝 Registering new admin user...');
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
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
    
    if (registerResponse.ok) {
      console.log('✅ Admin user registered successfully!');
      
      // Login as the new admin
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
        
        // Try to make this user admin using the make-first-admin endpoint
        console.log('\n🔄 Attempting to make admin the first admin...');
        const adminResponse = await fetch(`${API_URL}/auth/make-first-admin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
          }
        });
        
        if (adminResponse.ok) {
          console.log('✅ Admin user is now an admin!');
          
          // Now try to get all users
          console.log('\n📋 Fetching all users...');
          const usersResponse = await fetch(`${API_URL}/admin/users`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${loginData.token}`
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
            
            console.log('\n🎉 Working Admin Account Details:');
            console.log('=====================================');
            console.log(`👤 Username: admin`);
            console.log(`🔑 Password: admin123`);
            console.log(`📧 Email: admin@nhfarming.com`);
            console.log(`👑 Role: admin`);
            console.log(`🆔 User ID: ${loginData.user.id}`);
            console.log('=====================================');
            
            console.log('\n🔐 You can now log in with:');
            console.log('Username: admin');
            console.log('Password: admin123');
            console.log('\n🚀 This account has full administrative access!');
            
          } else {
            console.log('❌ Could not fetch users list');
            console.log('Response status:', usersResponse.status);
          }
          
        } else {
          console.log('❌ Could not make admin the first admin');
          console.log('Response status:', adminResponse.status);
          
          // Try to get error details
          try {
            const errorData = await adminResponse.json();
            console.log('Error:', errorData);
          } catch (e) {
            console.log('Could not parse error response');
          }
          
          // Show the account details anyway
          console.log('\n📋 Admin Account Created (may need manual role upgrade):');
          console.log('=====================================');
          console.log(`👤 Username: admin`);
          console.log(`🔑 Password: admin123`);
          console.log(`📧 Email: admin@nhfarming.com`);
          console.log(`👑 Role: ${loginData.user.role}`);
          console.log(`🆔 User ID: ${loginData.user.id}`);
          console.log('=====================================');
        }
        
      } else {
        console.log('❌ Admin login failed');
        const errorData = await loginResponse.json();
        console.log('Error:', errorData);
      }
      
    } else {
      console.log('❌ Admin registration failed');
      const errorData = await registerResponse.json();
      console.log('Error:', errorData);
      
      // If registration fails, try to login with existing admin
      console.log('\n🔄 Trying to login with existing admin...');
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
        console.log('\n🎉 Existing Admin Account:');
        console.log('=====================================');
        console.log(`👤 Username: admin`);
        console.log(`🔑 Password: admin123`);
        console.log(`📧 Email: admin@nhfarming.com`);
        console.log(`👑 Role: ${loginData.user.role}`);
        console.log(`🆔 User ID: ${loginData.user.id}`);
        console.log('=====================================');
      } else {
        console.log('❌ Admin login also failed');
        const errorData = await loginResponse.json();
        console.log('Error:', errorData);
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating working admin:', error.message);
  }
}

// Run the function
createWorkingAdmin(); 