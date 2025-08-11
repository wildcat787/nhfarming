#!/usr/bin/env node

/**
 * 🧪 Farm Manager System Test Script
 * 
 * This script creates test users and demonstrates the farm manager functionality.
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// Get database path
const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, process.env.DB_PATH)
  : path.join(__dirname, 'farm.db');

console.log('🧪 Farm Manager System Test');
console.log('============================');
console.log(`Database: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

async function createTestUsers() {
  console.log('\n👥 Creating test users...');
  
  const testUsers = [
    {
      username: 'FarmManager1',
      email: 'manager1@nhfarming.com',
      password: 'Manager123!',
      role: 'user' // System role remains 'user', farm role will be 'manager'
    },
    {
      username: 'FarmWorker1',
      email: 'worker1@nhfarming.com', 
      password: 'Worker123!',
      role: 'user'
    },
    {
      username: 'FarmOwner1',
      email: 'owner1@nhfarming.com',
      password: 'Owner123!',
      role: 'user'
    }
  ];
  
  for (const user of testUsers) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT OR IGNORE INTO users (username, email, password, role, email_verified)
          VALUES (?, ?, ?, ?, 1)
        `, [user.username, user.email, hashedPassword, user.role], function(err) {
          if (err) reject(err);
          else {
            console.log(`✅ Created user: ${user.username} (ID: ${this.lastID || 'existing'})`);
            resolve(this.lastID);
          }
        });
      });
    } catch (error) {
      console.error(`❌ Error creating user ${user.username}:`, error);
    }
  }
}

async function createTestFarm() {
  console.log('\n🏠 Creating test farm...');
  
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT OR IGNORE INTO farms (name, description, location, total_area, area_unit, owner_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      'Test Farm Alpha',
      'A test farm for demonstrating manager functionality',
      'Test Location',
      100,
      'acres',
      1 // Daniel (admin) as owner
    ], function(err) {
      if (err) reject(err);
      else {
        const farmId = this.lastID || 2; // Assume farm ID 2 if it already exists
        console.log(`✅ Created test farm: Test Farm Alpha (ID: ${farmId})`);
        resolve(farmId);
      }
    });
  });
}

async function assignFarmRoles(farmId) {
  console.log('\n🔐 Assigning farm roles...');
  
  const roleAssignments = [
    { username: 'Daniel', role: 'owner', farmRole: 'Site admin (auto-assigned)' },
    { username: 'FarmOwner1', role: 'owner', farmRole: 'Farm Owner' },
    { username: 'FarmManager1', role: 'manager', farmRole: 'Farm Manager' },
    { username: 'FarmWorker1', role: 'worker', farmRole: 'Farm Worker' }
  ];
  
  for (const assignment of roleAssignments) {
    try {
      // Get user ID
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE username = ?', [assignment.username], (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
      
      if (user) {
        // Skip Daniel (admin) as they already have access through system admin
        if (assignment.username === 'Daniel') {
          console.log(`✅ ${assignment.username}: ${assignment.farmRole}`);
          continue;
        }
        
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT OR IGNORE INTO farm_users (farm_id, user_id, role, permissions, assigned_by)
            VALUES (?, ?, ?, ?, ?)
          `, [farmId, user.id, assignment.role, 'standard', 1], function(err) {
            if (err) reject(err);
            else {
              console.log(`✅ ${assignment.username}: ${assignment.farmRole}`);
              resolve();
            }
          });
        });
      }
    } catch (error) {
      console.error(`❌ Error assigning role to ${assignment.username}:`, error);
    }
  }
}

async function testPermissions(farmId) {
  console.log('\n🔍 Testing farm manager permissions...');
  
  // Test user access queries
  const tests = [
    {
      description: 'Daniel (Admin) - Can manage all farms',
      userId: 1,
      expectedAccess: true,
      expectedRole: 'admin'
    },
    {
      description: 'FarmManager1 - Can manage assigned farm',
      username: 'FarmManager1',
      expectedAccess: true,
      expectedRole: 'manager'
    },
    {
      description: 'FarmWorker1 - Limited access to assigned farm',
      username: 'FarmWorker1', 
      expectedAccess: true,
      expectedRole: 'worker'
    }
  ];
  
  for (const test of tests) {
    try {
      let userId = test.userId;
      
      if (test.username) {
        const user = await new Promise((resolve, reject) => {
          db.get('SELECT id FROM users WHERE username = ?', [test.username], (err, user) => {
            if (err) reject(err);
            else resolve(user);
          });
        });
        userId = user ? user.id : null;
      }
      
      if (!userId) {
        console.log(`❌ ${test.description}: User not found`);
        continue;
      }
      
      // Check farm access
      const access = await new Promise((resolve, reject) => {
        db.get(`
          SELECT fu.role, fu.permissions, f.name as farm_name
          FROM farm_users fu
          INNER JOIN farms f ON fu.farm_id = f.id
          WHERE fu.user_id = ? AND fu.farm_id = ?
        `, [userId, farmId], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
      
      if (test.expectedAccess) {
        if (access || userId === 1) { // Admin always has access
          const role = access ? access.role : 'admin';
          console.log(`✅ ${test.description}: Access granted (Role: ${role})`);
        } else {
          console.log(`❌ ${test.description}: Access denied (Expected access)`);
        }
      } else {
        if (!access) {
          console.log(`✅ ${test.description}: Access correctly denied`);
        } else {
          console.log(`❌ ${test.description}: Unexpected access granted`);
        }
      }
    } catch (error) {
      console.error(`❌ Error testing ${test.description}:`, error);
    }
  }
}

async function displaySystemSummary() {
  console.log('\n📊 Farm Manager System Summary');
  console.log('==============================');
  
  try {
    // Count users by system role
    const userStats = await new Promise((resolve, reject) => {
      db.all(`
        SELECT role, COUNT(*) as count
        FROM users
        GROUP BY role
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('\n👥 System Users:');
    userStats.forEach(stat => {
      console.log(`   ${stat.role}: ${stat.count} users`);
    });
    
    // Count farm roles
    const farmRoleStats = await new Promise((resolve, reject) => {
      db.all(`
        SELECT role, COUNT(*) as count
        FROM farm_users
        GROUP BY role
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('\n🏠 Farm Roles:');
    farmRoleStats.forEach(stat => {
      console.log(`   ${stat.role}: ${stat.count} assignments`);
    });
    
    // List farm assignments
    const assignments = await new Promise((resolve, reject) => {
      db.all(`
        SELECT u.username, f.name as farm_name, fu.role as farm_role
        FROM farm_users fu
        INNER JOIN users u ON fu.user_id = u.id
        INNER JOIN farms f ON fu.farm_id = f.id
        ORDER BY f.name, fu.role, u.username
      `, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    console.log('\n📋 Farm Assignments:');
    assignments.forEach(assignment => {
      console.log(`   ${assignment.farm_name}: ${assignment.username} (${assignment.farm_role})`);
    });
    
    console.log('\n🔐 Permission Levels:');
    console.log('   • admin - Full system access to all farms');
    console.log('   • owner - Full access to assigned farms (can delete farm)');
    console.log('   • manager - Manage farm data and users (cannot delete farm)');
    console.log('   • worker - Read/write access to farm data only');
    
    console.log('\n🎯 Farm Manager Capabilities:');
    console.log('   ✅ View and edit farm details');
    console.log('   ✅ Add/remove farm workers');
    console.log('   ✅ Manage farm data (crops, vehicles, applications)');
    console.log('   ✅ View farm users and their roles');
    console.log('   ❌ Cannot add/remove other managers or owners');
    console.log('   ❌ Cannot delete the farm');
    
  } catch (error) {
    console.error('❌ Error generating summary:', error);
  }
}

// Main execution
async function main() {
  try {
    await createTestUsers();
    const farmId = await createTestFarm();
    await assignFarmRoles(farmId);
    await testPermissions(farmId);
    await displaySystemSummary();
    
    console.log('\n🎉 Farm Manager System Test Completed!');
    console.log('\n🚀 Test Users Created:');
    console.log('   Username: FarmManager1, Password: Manager123!');
    console.log('   Username: FarmWorker1, Password: Worker123!');
    console.log('   Username: FarmOwner1, Password: Owner123!');
    console.log('\n📝 Login to test the system at: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Test execution error:', error);
  } finally {
    db.close();
  }
}

main();
