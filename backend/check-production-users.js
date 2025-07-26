const API_URL = 'https://nhfarming-backend.onrender.com/api';

async function checkUsers() {
  try {
    console.log('Checking users on production server...');
    
    // Try to get users list (this might require admin access)
    const response = await fetch(`${API_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const users = await response.json();
      console.log('Current users on production:', users);
    } else {
      console.log('Could not fetch users list. Response status:', response.status);
      console.log('This might be because no admin user exists yet.');
    }
    
  } catch (error) {
    console.error('Error checking users:', error.message);
  }
}

checkUsers(); 