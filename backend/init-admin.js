const bcrypt = require('bcryptjs');
const db = require('./db');

async function ensureAdminUser() {
  return new Promise((resolve, reject) => {
    // Check if any admin user exists
    db.get('SELECT id FROM users WHERE role = ?', ['admin'], async (err, adminUser) => {
      if (err) {
        console.error('❌ Error checking for admin user:', err.message);
        return reject(err);
      }
      
      if (adminUser) {
        console.log('✅ Admin user already exists');
        return resolve();
      }
      
      // Create admin user if none exists
      console.log('👤 Creating admin user...');
      
      const username = 'admin';
      const email = 'admin@nhfarming.com';
      const password = 'admin123';
      const role = 'admin';
      
      try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        db.run(`
          INSERT INTO users (username, email, password, role, email_verified)
          VALUES (?, ?, ?, ?, 1)
        `, [username, email, hashedPassword, role], function(err) {
          if (err) {
            console.error('❌ Error creating admin user:', err.message);
            return reject(err);
          }
          
          console.log('✅ Admin user created successfully');
          console.log(`   Username: ${username}`);
          console.log(`   Password: ${password}`);
          console.log(`   Email: ${email}`);
          console.log('⚠️  Please change the password after first login!');
          
          resolve();
        });
      } catch (error) {
        console.error('❌ Error hashing password:', error);
        reject(error);
      }
    });
  });
}

module.exports = { ensureAdminUser };
