const db = require('./db');

console.log('🔧 Making Daniel an admin...');

// Update Daniel's role to admin
db.run(
  'UPDATE users SET role = ? WHERE username = ?',
  ['admin', 'Daniel'],
  function (err) {
    if (err) {
      console.error('❌ Error updating Daniel to admin:', err);
      process.exit(1);
    }
    
    if (this.changes === 0) {
      console.log('⚠️  User "Daniel" not found in database');
      console.log('📋 Available users:');
      
      // List all users
      db.all('SELECT id, username, role FROM users ORDER BY username', (err, users) => {
        if (err) {
          console.error('❌ Error fetching users:', err);
        } else {
          users.forEach(user => {
            console.log(`  - ${user.username} (ID: ${user.id}, Role: ${user.role})`);
          });
        }
        process.exit(1);
      });
    } else {
      console.log('✅ Successfully made Daniel an admin!');
      
      // Verify the change
      db.get('SELECT id, username, role FROM users WHERE username = ?', ['Daniel'], (err, user) => {
        if (err) {
          console.error('❌ Error verifying user:', err);
        } else if (user) {
          console.log(`📋 User: ${user.username} (ID: ${user.id}, Role: ${user.role})`);
        }
        process.exit(0);
      });
    }
  }
); 