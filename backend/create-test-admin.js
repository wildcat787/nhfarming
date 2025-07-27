const API_URL = 'https://nhfarming-backend.onrender.com/api';

async function createTestAdmin() {
  try {
    console.log('🔧 Creating Test Admin Account');
    console.log('================================');
    
    // Try to register a test admin user
    console.log('📝 Registering test admin...');
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testadmin',
        password: 'admin123!',
        email: 'testadmin@nhfarming.com'
      })
    });
    
    if (registerResponse.ok) {
      console.log('✅ Test admin registered successfully!');
      
      // Login as test admin
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testadmin',
          password: 'admin123!',
          email: 'testadmin@nhfarming.com'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Test admin login successful!');
        console.log(`👤 Username: ${loginData.user.username}`);
        console.log(`👑 Role: ${loginData.user.role}`);
        console.log(`🆔 User ID: ${loginData.user.id}`);
        
        // Try to make this user admin using the make-first-admin endpoint
        console.log('\n🔄 Attempting to make test admin the first admin...');
        const adminResponse = await fetch(`${API_URL}/auth/make-first-admin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
          }
        });
        
        if (adminResponse.ok) {
          console.log('✅ Test admin is now an admin!');
          
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
            
            // Now make Daniel admin
            console.log('\n🔄 Making Daniel admin...');
            const daniel = users.find(user => user.username === 'Daniel');
            
            if (daniel) {
              const danielAdminResponse = await fetch(`${API_URL}/admin/users/${daniel.id}/role`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${loginData.token}`
                },
                body: JSON.stringify({ role: 'admin' })
              });
              
              if (danielAdminResponse.ok) {
                console.log('✅ Daniel is now an admin!');
                console.log('\n🎉 Test Admin Account Details:');
                console.log('=====================================');
                console.log(`👤 Username: testadmin`);
                console.log(`🔑 Password: admin123!`);
                console.log(`📧 Email: testadmin@nhfarming.com`);
                console.log(`👑 Role: admin`);
                console.log('=====================================');
              } else {
                console.log('❌ Could not make Daniel admin');
              }
            } else {
              console.log('❌ Daniel not found in users list');
            }
            
          } else {
            console.log('❌ Could not fetch users list');
            console.log('Response status:', usersResponse.status);
          }
          
        } else {
          console.log('❌ Could not make test admin the first admin');
          console.log('Response status:', adminResponse.status);
        }
        
      } else {
        console.log('❌ Test admin login failed');
        const errorData = await loginResponse.json();
        console.log('Error:', errorData);
      }
      
    } else {
      console.log('❌ Test admin registration failed');
      const errorData = await registerResponse.json();
      console.log('Error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Error creating test admin:', error.message);
  }
}

// Run the function
createTestAdmin(); 