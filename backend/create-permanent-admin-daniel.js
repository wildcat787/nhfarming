const db = require('./db');
const bcrypt = require('bcrypt');

console.log('🔧 Creating permanent admin account for Daniel...');

async function createPermanentAdminDaniel() {
  try {
    // Check if Daniel already exists
    db.get('SELECT id, username, role FROM users WHERE username = ?', ['Daniel'], async (err, existingUser) => {
      if (err) {
        console.error('❌ Error checking existing user:', err);
        process.exit(1);
      }

      if (existingUser) {
        console.log(`📋 User "Daniel" already exists (ID: ${existingUser.id}, Role: ${existingUser.role})`);
        
        if (existingUser.role === 'admin') {
          console.log('✅ Daniel is already an admin!');
        } else {
          console.log('🔄 Updating Daniel to admin role...');
          
          // Update Daniel to admin
          db.run('UPDATE users SET role = ? WHERE username = ?', ['admin', 'Daniel'], function (err) {
            if (err) {
              console.error('❌ Error updating Daniel to admin:', err);
              process.exit(1);
            }
            console.log('✅ Successfully updated Daniel to admin role!');
            verifyDaniel();
          });
        }
      } else {
        console.log('🆕 Creating new admin account for Daniel...');
        
        // Hash password
        const hashedPassword = await bcrypt.hash('Holl!e2023', 10);
        
        // Create Daniel as admin
        db.run(
          'INSERT INTO users (username, password, role, email_verified) VALUES (?, ?, ?, ?)',
          ['Daniel', hashedPassword, 'admin', 1],
          function (err) {
            if (err) {
              console.error('❌ Error creating Daniel:', err);
              process.exit(1);
            }
            
            console.log('✅ Successfully created Daniel as admin!');
            console.log(`📋 User ID: ${this.lastID}`);
            verifyDaniel();
          }
        );
      }
    });

    function verifyDaniel() {
      // Verify the account
      db.get('SELECT id, username, role, email_verified FROM users WHERE username = ?', ['Daniel'], (err, user) => {
        if (err) {
          console.error('❌ Error verifying user:', err);
          process.exit(1);
        }
        
        if (user) {
          console.log('\n🎉 Daniel\'s Admin Account Details:');
          console.log('=====================================');
          console.log(`👤 Username: ${user.username}`);
          console.log(`🔑 Password: Holl!e2023`);
          console.log(`👑 Role: ${user.role}`);
          console.log(`✅ Email Verified: ${user.email_verified ? 'Yes' : 'No'}`);
          console.log(`🆔 User ID: ${user.id}`);
          console.log('=====================================');
          console.log('\n🔐 Daniel can now:');
          console.log('  • Access all features of the application');
          console.log('  • Manage other users (view, edit, delete)');
          console.log('  • View system-wide data and reports');
          console.log('  • Perform administrative functions');
          console.log('\n🚀 Account is ready to use!');
        } else {
          console.log('❌ Failed to verify Daniel\'s account');
        }
        process.exit(0);
      });
    }

  } catch (error) {
    console.error('❌ Error in createPermanentAdminDaniel:', error);
    process.exit(1);
  }
}

// Run the function
createPermanentAdminDaniel(); 