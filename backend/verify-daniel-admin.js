const API_URL = 'https://nhfarming-backend.onrender.com/api';

async function verifyDanielAdmin() {
  try {
    console.log('🔍 Verifying Daniel\'s Admin Status');
    console.log('==================================');
    
    // Login as Daniel to get a fresh token
    console.log('🔑 Logging in as Daniel...');
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
      console.log('✅ Daniel login successful!');
      console.log(`👤 Username: ${loginData.user.username}`);
      console.log(`👑 Role: ${loginData.user.role}`);
      console.log(`🆔 User ID: ${loginData.user.id}`);
      
      if (loginData.user.role === 'admin') {
        console.log('🎉 Daniel is confirmed as admin!');
        
        // Now try to access admin users endpoint with fresh token
        console.log('\n📋 Fetching all users with admin privileges...');
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
          
          console.log('\n🎉 Daniel\'s Admin Account Details:');
          console.log('=====================================');
          console.log(`👤 Username: Daniel`);
          console.log(`🔑 Password: Holl!e2023`);
          console.log(`📧 Email: daniel@nhfarming.com`);
          console.log(`👑 Role: admin`);
          console.log(`🆔 User ID: ${loginData.user.id}`);
          console.log('=====================================');
          
          console.log('\n🔐 Daniel can now:');
          console.log('  • Access all features of the application');
          console.log('  • Manage users (view, edit, delete, change roles)');
          console.log('  • Access to Users page');
          console.log('  • System-wide data and reports');
          console.log('  • Perform administrative functions');
          
        } else {
          console.log('❌ Could not fetch users list');
          console.log('Response status:', usersResponse.status);
          
          // Try to get the error message
          try {
            const errorData = await usersResponse.json();
            console.log('Error:', errorData);
          } catch (e) {
            console.log('Could not parse error response');
          }
        }
        
      } else {
        console.log('❌ Daniel is not an admin yet');
        console.log(`Current role: ${loginData.user.role}`);
        console.log('\n📋 To make Daniel admin:');
        console.log('1. Log into the application as an existing admin');
        console.log('2. Go to Users page');
        console.log('3. Find Daniel in the list');
        console.log('4. Click edit and change role to "admin"');
        console.log('5. Save changes');
      }
      
    } else {
      console.log('❌ Daniel login failed');
      const errorData = await loginResponse.json();
      console.log('Error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Error verifying Daniel admin:', error.message);
  }
}

// Run the function
verifyDanielAdmin(); 