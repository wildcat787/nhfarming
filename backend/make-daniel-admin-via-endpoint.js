const API_URL = 'https://nhfarming-backend.onrender.com/api';

async function makeDanielAdminViaEndpoint() {
  try {
    console.log('Making Daniel admin via special endpoint...');
    
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
      console.log('User ID:', loginData.user?.id);
      
      // Use the special endpoint to make Daniel admin
      const adminResponse = await fetch(`${API_URL}/auth/make-first-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      if (adminResponse.ok) {
        const result = await adminResponse.json();
        console.log('✅ Daniel is now an admin!');
        console.log('Result:', result);
        console.log('\nYou can now log in with:');
        console.log('Username: Daniel');
        console.log('Password: Holl!e2023');
        console.log('Role: Admin');
      } else {
        console.log('❌ Failed to make Daniel admin');
        console.log('Response status:', adminResponse.status);
        const errorData = await adminResponse.json();
        console.log('Error:', errorData);
      }
      
    } else {
      console.log('❌ Failed to login as Daniel');
      const errorData = await loginResponse.json();
      console.log('Error:', errorData);
    }
    
  } catch (error) {
    console.error('Error making Daniel admin:', error.message);
  }
}

makeDanielAdminViaEndpoint(); 