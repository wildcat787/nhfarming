const API_URL = 'https://nhfarming-backend.onrender.com/api';

async function resetDanielPassword() {
  try {
    console.log('Resetting Daniel\'s password...');
    
    // First, login as admin to get a token
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser123',
        password: 'testpass123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Logged in as admin');
      
      // Get the list of users to find Daniel's ID
      const usersResponse = await fetch(`${API_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      if (usersResponse.ok) {
        const users = await usersResponse.json();
        console.log('Current users:', users);
        
        // Find Daniel in the users list
        const daniel = users.find(user => user.username === 'Daniel');
        
        if (daniel) {
          console.log('Found Daniel with ID:', daniel.id);
          
          // Reset Daniel's password
          const newPassword = 'Holl!e2023';
          const resetResponse = await fetch(`${API_URL}/admin/users/${daniel.id}/password`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({ password: newPassword })
          });
          
          if (resetResponse.ok) {
            console.log('✅ Daniel\'s password has been reset!');
            console.log('\nDaniel\'s new credentials:');
            console.log('Username: Daniel');
            console.log('Password: Holl!e2023');
            
            // Test the new password
            console.log('\nTesting Daniel\'s new password...');
            const testLoginResponse = await fetch(`${API_URL}/auth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: 'Daniel',
                password: newPassword
              })
            });
            
            if (testLoginResponse.ok) {
              const testLoginData = await testLoginResponse.json();
              console.log('✅ Daniel can now log in successfully!');
              console.log('Daniel\'s role:', testLoginData.user.role);
            } else {
              console.log('❌ Daniel still cannot log in');
              const errorData = await testLoginResponse.json();
              console.log('Error:', errorData);
            }
            
          } else {
            console.log('❌ Failed to reset Daniel\'s password');
            console.log('Response status:', resetResponse.status);
            const errorData = await resetResponse.json();
            console.log('Error:', errorData);
          }
          
        } else {
          console.log('❌ Daniel not found in users list');
          console.log('Available users:', users.map(u => u.username));
        }
        
      } else {
        console.log('❌ Failed to get users list');
        console.log('Response status:', usersResponse.status);
      }
      
    } else {
      console.log('❌ Failed to login as admin');
      const errorData = await loginResponse.json();
      console.log('Error:', errorData);
    }
    
  } catch (error) {
    console.error('Error resetting Daniel\'s password:', error.message);
  }
}

resetDanielPassword(); 