const API_URL = 'https://nhfarming-backend.onrender.com/api';

async function listAllUsers() {
  try {
    console.log('Checking what users exist on production server...');
    
    // Try to register a test user to see if registration works
    console.log('\n1. Testing user registration...');
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser123',
        password: 'testpass123'
      })
    });
    
    if (registerResponse.ok) {
      console.log('✅ Registration works - testuser123 created');
      
      // Now try to login with the test user
      console.log('\n2. Testing login with testuser123...');
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
        console.log('✅ Login works!');
        console.log('User data:', loginData.user);
        console.log('\nYou can now log in with:');
        console.log('Username: testuser123');
        console.log('Password: testpass123');
        console.log('User ID:', loginData.user.id);
        
        // Try to make this user admin
        console.log('\n3. Attempting to make testuser123 admin...');
        const adminResponse = await fetch(`${API_URL}/auth/make-first-admin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
          }
        });
        
        if (adminResponse.ok) {
          console.log('✅ testuser123 is now an admin!');
        } else {
          console.log('⚠️ Could not make admin automatically');
          console.log('Response status:', adminResponse.status);
        }
        
      } else {
        console.log('❌ Login failed');
        const errorData = await loginResponse.json();
        console.log('Error:', errorData);
      }
      
    } else {
      console.log('❌ Registration failed');
      const errorData = await registerResponse.json();
      console.log('Error:', errorData);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listAllUsers(); 