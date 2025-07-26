const API_URL = 'https://nhfarming-backend.onrender.com/api';

async function createDaniel() {
  try {
    console.log('Creating Daniel as a new user...');
    
    // Register Daniel
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Daniel',
        password: 'Holl!e2023'
      })
    });
    
    if (registerResponse.ok) {
      console.log('✅ Daniel registered successfully!');
      
      // Login as admin to make Daniel an admin
      const adminLoginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testuser123',
          password: 'testpass123'
        })
      });
      
      if (adminLoginResponse.ok) {
        const adminLoginData = await adminLoginResponse.json();
        console.log('✅ Logged in as admin');
        
        // Get users list to find Daniel's ID
        const usersResponse = await fetch(`${API_URL}/admin/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminLoginData.token}`
          }
        });
        
        if (usersResponse.ok) {
          const users = await usersResponse.json();
          console.log('Current users:', users);
          
          // Find Daniel
          const daniel = users.find(user => user.username === 'Daniel');
          
          if (daniel) {
            console.log('Found Daniel with ID:', daniel.id);
            
            // Make Daniel an admin
            const roleResponse = await fetch(`${API_URL}/admin/users/${daniel.id}/role`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminLoginData.token}`
              },
              body: JSON.stringify({ role: 'admin' })
            });
            
            if (roleResponse.ok) {
              console.log('✅ Daniel is now an admin!');
            } else {
              console.log('⚠️ Could not make Daniel admin automatically');
              console.log('Response status:', roleResponse.status);
            }
            
            // Test Daniel's login
            console.log('\nTesting Daniel\'s login...');
            const danielLoginResponse = await fetch(`${API_URL}/auth/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                username: 'Daniel',
                password: 'Holl!e2023'
              })
            });
            
            if (danielLoginResponse.ok) {
              const danielLoginData = await danielLoginResponse.json();
              console.log('✅ Daniel can log in successfully!');
              console.log('Daniel\'s role:', danielLoginData.user.role);
              console.log('\nDaniel\'s credentials:');
              console.log('Username: Daniel');
              console.log('Password: Holl!e2023');
            } else {
              console.log('❌ Daniel cannot log in');
              const errorData = await danielLoginResponse.json();
              console.log('Error:', errorData);
            }
            
          } else {
            console.log('❌ Daniel not found after registration');
          }
          
        } else {
          console.log('❌ Failed to get users list');
        }
        
      } else {
        console.log('❌ Failed to login as admin');
      }
      
    } else {
      console.log('❌ Failed to register Daniel');
      const errorData = await registerResponse.json();
      console.log('Error:', errorData);
    }
    
  } catch (error) {
    console.error('Error creating Daniel:', error.message);
  }
}

createDaniel(); 