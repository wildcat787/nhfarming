#!/usr/bin/env node

/**
 * 🔧 Assign Existing Users to Farms Script
 * 
 * This script assigns the existing test users to appropriate farm roles.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Get database path
const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, process.env.DB_PATH)
  : path.join(__dirname, 'farm.db');

console.log('🔧 Assigning Existing Users to Farm Roles');
console.log('=========================================');
console.log(`Database: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

async function assignUsersToFarms() {
  console.log('\n📋 Processing user farm assignments...');
  
  // Get all users and farms
  const users = await new Promise((resolve, reject) => {
    db.all('SELECT id, username, role FROM users ORDER BY id', (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
  
  const farms = await new Promise((resolve, reject) => {
    db.all('SELECT id, name FROM farms ORDER BY id', (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
  
  console.log(`Found ${users.length} users and ${farms.length} farms`);
  
  // Define the assignments
  const assignments = [
    // Daniel (admin) - Already has system admin, but also make owner of Default Farm
    { username: 'Daniel', farmName: 'Default Farm', farmRole: 'owner' },
    
    // FarmOwner1 - Owner of Test Farm Alpha
    { username: 'FarmOwner1', farmName: 'Test Farm Alpha', farmRole: 'owner' },
    
    // FarmManager1 - Manager of Test Farm Alpha  
    { username: 'FarmManager1', farmName: 'Test Farm Alpha', farmRole: 'manager' },
    
    // FarmWorker1 - Worker on Test Farm Alpha
    { username: 'FarmWorker1', farmName: 'Test Farm Alpha', farmRole: 'worker' }
  ];
  
  for (const assignment of assignments) {
    try {
      // Find user
      const user = users.find(u => u.username === assignment.username);
      if (!user) {
        console.log(`⚠️  User ${assignment.username} not found, skipping`);
        continue;
      }
      
      // Find farm
      const farm = farms.find(f => f.name === assignment.farmName);
      if (!farm) {
        console.log(`⚠️  Farm ${assignment.farmName} not found, skipping`);
        continue;
      }
      
      // Check if assignment already exists
      const existing = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id, role FROM farm_users WHERE user_id = ? AND farm_id = ?',
          [user.id, farm.id],
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
      
      if (existing) {
        if (existing.role !== assignment.farmRole) {
          // Update existing assignment
          await new Promise((resolve, reject) => {
            db.run(
              'UPDATE farm_users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND farm_id = ?',
              [assignment.farmRole, user.id, farm.id],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
          console.log(`🔄 Updated ${assignment.username} role to ${assignment.farmRole} on ${assignment.farmName}`);
        } else {
          console.log(`✅ ${assignment.username} already has ${assignment.farmRole} role on ${assignment.farmName}`);
        }
      } else {
        // Create new assignment
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO farm_users (farm_id, user_id, role, permissions, assigned_by) VALUES (?, ?, ?, ?, ?)',
            [farm.id, user.id, assignment.farmRole, 'standard', 1], // Assigned by Daniel (admin)
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        console.log(`➕ Assigned ${assignment.username} as ${assignment.farmRole} on ${assignment.farmName}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${assignment.username}:`, error);
    }
  }
}

async function displayFinalAssignments() {
  console.log('\n📊 Final User-Farm Assignments:');
  console.log('==============================');
  
  const assignments = await new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        u.username,
        u.role as system_role,
        f.name as farm_name,
        fu.role as farm_role,
        fu.permissions
      FROM users u
      LEFT JOIN farm_users fu ON u.id = fu.user_id
      LEFT JOIN farms f ON fu.farm_id = f.id
      ORDER BY u.username, f.name
    `, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
  
  let currentUser = '';
  assignments.forEach(assignment => {
    if (assignment.username !== currentUser) {
      currentUser = assignment.username;
      console.log(`\n👤 ${assignment.username} (System: ${assignment.system_role})`);
    }
    
    if (assignment.farm_name) {
      console.log(`   🏠 ${assignment.farm_name}: ${assignment.farm_role}`);
    } else if (assignment.username === currentUser) {
      console.log(`   🏠 No farm assignments`);
    }
  });
  
  console.log('\n🎉 User farm assignments completed!');
  console.log('\n📝 Available Roles:');
  console.log('   System Roles: admin, user');
  console.log('   Farm Roles: owner, manager, worker');
  console.log('\n🔗 Users can now be managed with both system and farm-specific roles');
}

// Main execution
async function main() {
  try {
    await assignUsersToFarms();
    await displayFinalAssignments();
  } catch (error) {
    console.error('❌ Script execution error:', error);
  } finally {
    db.close();
  }
}

main();
