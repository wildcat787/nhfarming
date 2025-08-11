#!/usr/bin/env node

/**
 * 👤 Create Permanent Admin User Script
 * 
 * This script creates a permanent admin user in the database.
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// Get database path
const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, process.env.DB_PATH)
  : path.join(__dirname, 'farm.db');

console.log('👤 Creating Permanent Admin User');
console.log('================================');
console.log(`Database: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

async function createAdminUser() {
  const username = 'Daniel';
  const email = 'daniel@nhfarming.com';
  const password = 'Holl!e2023';
  const role = 'admin';

  try {
    // Hash the password
    console.log('🔐 Hashing password...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Check if user already exists
    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, existingUser) => {
      if (err) {
        console.error('❌ Error checking existing user:', err.message);
        db.close();
        return;
      }
      
      if (existingUser) {
        console.log('⚠️  User already exists, updating...');
        
        // Update existing user
        db.run(`
          UPDATE users 
          SET password = ?, role = ?, email_verified = 1 
          WHERE username = ? OR email = ?
        `, [hashedPassword, role, username, email], function(err) {
          if (err) {
            console.error('❌ Error updating user:', err.message);
          } else {
            console.log('✅ Admin user updated successfully');
            console.log(`   Username: ${username}`);
            console.log(`   Email: ${email}`);
            console.log(`   Role: ${role}`);
            console.log(`   Email Verified: Yes`);
          }
          
          // Verify the user
          verifyUser();
        });
      } else {
        console.log('➕ Creating new admin user...');
        
        // Create new user
        db.run(`
          INSERT INTO users (username, email, password, role, email_verified)
          VALUES (?, ?, ?, ?, 1)
        `, [username, email, hashedPassword, role], function(err) {
          if (err) {
            console.error('❌ Error creating user:', err.message);
          } else {
            console.log('✅ Admin user created successfully');
            console.log(`   User ID: ${this.lastID}`);
            console.log(`   Username: ${username}`);
            console.log(`   Email: ${email}`);
            console.log(`   Role: ${role}`);
            console.log(`   Email Verified: Yes`);
          }
          
          // Verify the user
          verifyUser();
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    db.close();
  }
}

function verifyUser() {
  console.log('\n🔍 Verifying user creation...');
  
  db.get('SELECT * FROM users WHERE username = ?', ['Daniel'], (err, user) => {
    if (err) {
      console.error('❌ Error verifying user:', err.message);
    } else if (user) {
      console.log('✅ User verification successful:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email Verified: ${user.email_verified ? 'Yes' : 'No'}`);
      console.log('');
      console.log('🎉 Admin user is ready to use!');
      console.log(`   Login at: http://localhost:3000`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: Holl!e2023`);
    } else {
      console.log('❌ User verification failed - user not found');
    }
    
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('✅ Database connection closed');
      }
    });
  });
}

// Run the script
createAdminUser();
