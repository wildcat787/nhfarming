const API_URL = 'https://nhfarming-backend.onrender.com/api';

async function makeFirstUserAdmin() {
  try {
    console.log('Attempting to make the first user an admin...');
    
    // First, login as Daniel to get a token
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
      console.log('✅ Logged in as Daniel');
      
      // Try to update Daniel's role using a different approach
      // Since Daniel is user ID 1 (first user), try updating directly
      const updateResponse = await fetch(`${API_URL}/admin/users/1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify({ 
          username: 'Daniel',
          role: 'admin'
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Daniel is now an admin!');
        console.log('You can now log in with:');
        console.log('Username: Daniel');
        console.log('Password: Holl!e2023');
      } else {
        console.log('❌ Could not update Daniel to admin');
        console.log('Response status:', updateResponse.status);
        
        // Try alternative approach - check if there's a special endpoint
        console.log('Trying alternative approach...');
        
        const altResponse = await fetch(`${API_URL}/admin/users/1/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
          },
          body: JSON.stringify({ role: 'admin' })
        });
        
        if (altResponse.ok) {
          console.log('✅ Daniel is now an admin (alternative method)!');
        } else {
          console.log('❌ Alternative method also failed');
          console.log('You may need to manually update the database or create a new admin user.');
        }
      }
      
    } else {
      console.log('❌ Failed to login as Daniel');
      const errorData = await loginResponse.json();
      console.log('Error:', errorData);
    }
    
  } catch (error) {
    console.error('Error making first user admin:', error.message);
  }
}

makeFirstUserAdmin(); 