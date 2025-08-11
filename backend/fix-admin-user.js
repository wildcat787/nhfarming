const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Database path
const dbPath = path.join(__dirname, 'farm.db');

console.log('🔧 Fixing admin user credentials...');
console.log(`Database path: ${dbPath}`);

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Fix admin user
db.serialize(() => {
  // First, check if users table exists
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
    if (err) {
      console.error('Error checking users table:', err.message);
      return;
    }
    
    if (!row) {
      console.log('Users table does not exist. Creating it...');
      
      // Create users table
      db.run(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          reset_token TEXT,
          reset_token_expiry DATETIME,
          verification_token TEXT,
          verification_token_expiry DATETIME,
          email_verified INTEGER DEFAULT 0,
          role TEXT DEFAULT 'user',
          first_name TEXT,
          last_name TEXT,
          phone TEXT,
          address TEXT,
          city TEXT,
          state TEXT,
          zip_code TEXT,
          country TEXT
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err.message);
        } else {
          console.log('Users table created successfully.');
          createAdminUser();
        }
      });
    } else {
      console.log('Users table exists. Checking admin user...');
      createAdminUser();
    }
  });
  
  function createAdminUser() {
    // Check if admin user exists
    db.get('SELECT id, username, role FROM users WHERE username = ?', ['admin'], (err, row) => {
      if (err) {
        console.error('Error checking admin user:', err.message);
        return;
      }
      
      if (row) {
        console.log(`Admin user exists with ID: ${row.id}, Role: ${row.role}`);
        
        // Update admin user with correct password
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.run(`
          UPDATE users 
          SET password = ?, email = ?, role = ?, email_verified = ?
          WHERE username = ?
        `, [hashedPassword, 'admin@nhfarming.com', 'admin', 1, 'admin'], (err) => {
          if (err) {
            console.error('Error updating admin user:', err.message);
          } else {
            console.log('✅ Admin user updated successfully!');
            console.log('Username: admin');
            console.log('Password: admin123');
            console.log('Email: admin@nhfarming.com');
            console.log('Role: admin');
          }
        });
      } else {
        console.log('Admin user does not exist. Creating...');
        
        // Create admin user
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.run(`
          INSERT INTO users (username, password, email, role, email_verified)
          VALUES (?, ?, ?, ?, ?)
        `, ['admin', hashedPassword, 'admin@nhfarming.com', 'admin', 1], (err) => {
          if (err) {
            console.error('Error creating admin user:', err.message);
          } else {
            console.log('✅ Admin user created successfully!');
            console.log('Username: admin');
            console.log('Password: admin123');
            console.log('Email: admin@nhfarming.com');
            console.log('Role: admin');
          }
        });
      }
    });
  }
  
  // Wait a bit for async operations to complete
  setTimeout(() => {
    console.log('🔧 Admin user fix complete!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('');
    console.log('🌐 Try logging in again at: https://nhfarming-frontend.onrender.com');
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }, 2000);
});
