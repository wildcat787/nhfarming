const API_URL = 'https://nhfarming-backend.onrender.com/api';

async function registerDaniel() {
  try {
    console.log('Registering Daniel as admin on production server...');
    
    // First, register Daniel
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
      
      // Now try to login to get a token
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'Daniel',
          password: 'Holl!e2023'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Daniel logged in successfully!');
        console.log('Token received:', loginData.token ? 'Yes' : 'No');
        
        // Now try to make Daniel an admin (this might require a special endpoint)
        console.log('Attempting to make Daniel an admin...');
        
        // Try to update Daniel's role to admin
        const updateResponse = await fetch(`${API_URL}/admin/users/1/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
          },
          body: JSON.stringify({ role: 'admin' })
        });
        
        if (updateResponse.ok) {
          console.log('✅ Daniel is now an admin!');
        } else {
          console.log('⚠️ Could not make Daniel admin automatically. You may need to do this manually.');
          console.log('Response status:', updateResponse.status);
        }
        
      } else {
        console.log('❌ Failed to login Daniel after registration');
        const errorData = await loginResponse.json();
        console.log('Error:', errorData);
      }
      
    } else {
      console.log('❌ Failed to register Daniel');
      const errorData = await registerResponse.json();
      console.log('Error:', errorData);
    }
    
  } catch (error) {
    console.error('Error registering Daniel:', error.message);
  }
}

registerDaniel(); 