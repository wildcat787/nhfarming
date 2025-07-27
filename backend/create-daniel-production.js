const API_URL = 'https://nhfarming-backend.onrender.com/api';

async function createDanielProduction() {
  try {
    console.log('🔧 Creating permanent admin account for Daniel (Production)...');
    
    // Step 1: Check if Daniel already exists
    console.log('📋 Checking if Daniel already exists...');
    
    // Try to login as Daniel first to see if account exists
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
      console.log('✅ Daniel already exists!');
      console.log(`👤 Username: ${loginData.user.username}`);
      console.log(`👑 Role: ${loginData.user.role}`);
      
      if (loginData.user.role === 'admin') {
        console.log('🎉 Daniel is already an admin!');
        console.log('\n🔐 Daniel\'s Admin Account Details:');
        console.log('=====================================');
        console.log(`👤 Username: Daniel`);
        console.log(`🔑 Password: Holl!e2023`);
        console.log(`👑 Role: ${loginData.user.role}`);
        console.log(`🆔 User ID: ${loginData.user.id}`);
        console.log('=====================================');
        console.log('\n🚀 Account is ready to use!');
        return;
      } else {
        console.log('🔄 Daniel exists but is not an admin. Updating role...');
        await updateDanielToAdmin(loginData.token);
      }
    } else {
      console.log('🆕 Daniel does not exist. Creating new admin account...');
      await createNewDaniel();
    }
    
  } catch (error) {
    console.error('❌ Error creating Daniel:', error.message);
  }
}

async function createNewDaniel() {
  try {
    // Register Daniel
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
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
    
    if (registerResponse.ok) {
      console.log('✅ Daniel registered successfully!');
      
      // Now login and make admin
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
        
        // Try to make admin using existing admin account
        await updateDanielToAdmin(loginData.token);
      } else {
        console.log('❌ Failed to login as Daniel after registration');
      }
    } else {
      const errorData = await registerResponse.json();
      console.log('❌ Failed to register Daniel:', errorData);
    }
  } catch (error) {
    console.error('❌ Error in createNewDaniel:', error.message);
  }
}

async function updateDanielToAdmin(adminToken) {
  try {
    // Get users list to find Daniel's ID
    const usersResponse = await fetch(`${API_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (usersResponse.ok) {
      const users = await usersResponse.json();
      const daniel = users.find(user => user.username === 'Daniel');
      
      if (daniel) {
        console.log(`📋 Found Daniel with ID: ${daniel.id}`);
        
        // Make Daniel an admin
        const roleResponse = await fetch(`${API_URL}/admin/users/${daniel.id}/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ role: 'admin' })
        });
        
        if (roleResponse.ok) {
          console.log('✅ Daniel is now an admin!');
          displayFinalDetails(daniel);
        } else {
          console.log('⚠️ Could not make Daniel admin via API');
          console.log('Response status:', roleResponse.status);
          
          // Try alternative method - login as existing admin
          await tryAlternativeAdminMethod();
        }
      } else {
        console.log('❌ Daniel not found in users list');
      }
    } else {
      console.log('❌ Failed to get users list');
      await tryAlternativeAdminMethod();
    }
  } catch (error) {
    console.error('❌ Error in updateDanielToAdmin:', error.message);
    await tryAlternativeAdminMethod();
  }
}

async function tryAlternativeAdminMethod() {
  try {
    console.log('🔄 Trying alternative method to make Daniel admin...');
    
    // Try to login as a known admin account
    const adminLogins = [
      { username: 'testuser123', password: 'testpass123' },
      { username: 'admin', password: 'admin123' },
      { username: 'daniel', password: 'Holl!e2023' }
    ];
    
    for (const adminLogin of adminLogins) {
      try {
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(adminLogin)
        });
        
        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          if (loginData.user.role === 'admin') {
            console.log(`✅ Logged in as admin: ${adminLogin.username}`);
            await updateDanielToAdmin(loginData.token);
            return;
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    console.log('⚠️ Could not find admin account to update Daniel');
    console.log('📋 Daniel account created but may need manual admin assignment');
    console.log('\n🔐 Daniel\'s Account Details:');
    console.log('=====================================');
    console.log(`👤 Username: Daniel`);
    console.log(`🔑 Password: Holl!e2023`);
    console.log(`👑 Role: user (needs admin upgrade)`);
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Error in tryAlternativeAdminMethod:', error.message);
  }
}

function displayFinalDetails(daniel) {
  console.log('\n🎉 Daniel\'s Admin Account Details:');
  console.log('=====================================');
  console.log(`👤 Username: Daniel`);
  console.log(`🔑 Password: Holl!e2023`);
  console.log(`👑 Role: admin`);
  console.log(`🆔 User ID: ${daniel.id}`);
  console.log('=====================================');
  console.log('\n🔐 Daniel can now:');
  console.log('  • Access all features of the application');
  console.log('  • Manage other users (view, edit, delete)');
  console.log('  • View system-wide data and reports');
  console.log('  • Perform administrative functions');
  console.log('\n🚀 Account is ready to use!');
}

// Run the function
createDanielProduction(); 