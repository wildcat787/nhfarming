#!/usr/bin/env node

/**
 * 🏢 Farm Manager System Migration Script
 * 
 * This script creates the necessary database tables and updates the system
 * to support farm managers with hierarchical permissions.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Get database path
const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, process.env.DB_PATH)
  : path.join(__dirname, 'farm.db');

console.log('🏢 Farm Manager System Migration');
console.log('================================');
console.log(`Database: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

function runMigration() {
  db.serialize(() => {
    // 1. Create farms table
    console.log('📊 Creating farms table...');
    db.run(`
      CREATE TABLE IF NOT EXISTS farms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        location TEXT,
        total_area REAL,
        area_unit TEXT DEFAULT 'acres',
        owner_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users (id)
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating farms table:', err);
      } else {
        console.log('✅ Farms table created');
      }
    });

    // 2. Create farm_users table for role-based access
    console.log('👥 Creating farm_users table...');
    db.run(`
      CREATE TABLE IF NOT EXISTS farm_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        farm_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL DEFAULT 'worker',
        permissions TEXT DEFAULT 'read',
        assigned_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (farm_id) REFERENCES farms (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users (id),
        UNIQUE(farm_id, user_id)
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating farm_users table:', err);
      } else {
        console.log('✅ Farm_users table created');
      }
    });

    // 3. Update users table to support system-wide roles
    console.log('🔧 Updating users table for enhanced roles...');
    db.run(`
      UPDATE users 
      SET role = CASE 
        WHEN role = 'admin' THEN 'admin'
        ELSE 'user'
      END
    `, (err) => {
      if (err) {
        console.error('❌ Error updating users table:', err);
      } else {
        console.log('✅ Users table updated');
      }
    });

    // 4. Add farm_id column to existing tables if not exists
    const tablesToUpdate = [
      { name: 'vehicles', description: 'Vehicles' },
      { name: 'crops', description: 'Crops' }, 
      { name: 'inputs', description: 'Inputs' },
      { name: 'applications', description: 'Applications' },
      { name: 'maintenance', description: 'Maintenance' }
    ];

    tablesToUpdate.forEach((table, index) => {
      setTimeout(() => {
        console.log(`🔗 Adding farm_id to ${table.name} table...`);
        
        // Check if farm_id column exists
        db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
          if (err) {
            console.error(`❌ Error checking ${table.name} table:`, err);
            return;
          }
          
          const hasFarmId = columns.some(col => col.name === 'farm_id');
          
          if (!hasFarmId) {
            db.run(`ALTER TABLE ${table.name} ADD COLUMN farm_id INTEGER REFERENCES farms(id)`, (err) => {
              if (err) {
                console.error(`❌ Error adding farm_id to ${table.name}:`, err);
              } else {
                console.log(`✅ Added farm_id to ${table.name} table`);
              }
            });
          } else {
            console.log(`✅ ${table.name} table already has farm_id column`);
          }
        });
      }, index * 200); // Stagger the updates
    });

    // 5. Create indexes for better performance
    setTimeout(() => {
      console.log('📈 Creating performance indexes...');
      
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON farms(owner_id)',
        'CREATE INDEX IF NOT EXISTS idx_farm_users_farm_id ON farm_users(farm_id)',
        'CREATE INDEX IF NOT EXISTS idx_farm_users_user_id ON farm_users(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_farm_users_role ON farm_users(role)',
        'CREATE INDEX IF NOT EXISTS idx_vehicles_farm_id ON vehicles(farm_id)',
        'CREATE INDEX IF NOT EXISTS idx_crops_farm_id ON crops(farm_id)',
        'CREATE INDEX IF NOT EXISTS idx_inputs_farm_id ON inputs(farm_id)',
        'CREATE INDEX IF NOT EXISTS idx_applications_farm_id ON applications(farm_id)',
        'CREATE INDEX IF NOT EXISTS idx_maintenance_farm_id ON maintenance(farm_id)'
      ];

      indexes.forEach((indexSQL, i) => {
        setTimeout(() => {
          db.run(indexSQL, (err) => {
            if (err) {
              console.error(`❌ Error creating index ${i + 1}:`, err);
            } else {
              console.log(`✅ Index ${i + 1} created`);
            }
          });
        }, i * 100);
      });
    }, 2000);

    // 6. Create a default farm for existing data
    setTimeout(() => {
      console.log('🏠 Creating default farm for existing data...');
      
      // Check if we have any farms
      db.get('SELECT COUNT(*) as count FROM farms', (err, result) => {
        if (err) {
          console.error('❌ Error checking farms:', err);
          return;
        }
        
        if (result.count === 0) {
          // Create a default farm
          db.run(`
            INSERT INTO farms (name, description, location, total_area, area_unit, owner_id)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            'Default Farm',
            'Default farm for existing data migration',
            'Not specified',
            0,
            'acres',
            1 // Assuming Daniel (admin) is user ID 1
          ], function (err) {
            if (err) {
              console.error('❌ Error creating default farm:', err);
            } else {
              console.log('✅ Default farm created with ID:', this.lastID);
              
              // Add admin as owner of default farm
              db.run(`
                INSERT OR IGNORE INTO farm_users (farm_id, user_id, role, permissions, assigned_by)
                VALUES (?, ?, ?, ?, ?)
              `, [this.lastID, 1, 'owner', 'all', 1], (err) => {
                if (err) {
                  console.error('❌ Error adding admin to default farm:', err);
                } else {
                  console.log('✅ Admin added as owner of default farm');
                }
              });
              
              // Update existing data to belong to default farm
              const updateQueries = [
                `UPDATE vehicles SET farm_id = ${this.lastID} WHERE farm_id IS NULL`,
                `UPDATE crops SET farm_id = ${this.lastID} WHERE farm_id IS NULL`,
                `UPDATE inputs SET farm_id = ${this.lastID} WHERE farm_id IS NULL`,
                `UPDATE applications SET farm_id = ${this.lastID} WHERE farm_id IS NULL`,
                `UPDATE maintenance SET farm_id = ${this.lastID} WHERE farm_id IS NULL`
              ];
              
              updateQueries.forEach((query, i) => {
                setTimeout(() => {
                  db.run(query, (err) => {
                    if (err) {
                      console.error(`❌ Error updating existing data:`, err);
                    } else {
                      console.log(`✅ Updated existing data to use default farm`);
                    }
                  });
                }, i * 100);
              });
            }
          });
        } else {
          console.log('✅ Farms already exist, skipping default farm creation');
        }
      });
    }, 3000);

    // 7. Summary and completion
    setTimeout(() => {
      console.log('\n📊 Verifying migration...');
      
      const verificationQueries = [
        { sql: 'SELECT COUNT(*) as count FROM farms', name: 'Farms' },
        { sql: 'SELECT COUNT(*) as count FROM farm_users', name: 'Farm Users' },
        { sql: 'SELECT COUNT(*) as count FROM users WHERE role = "admin"', name: 'Admin Users' }
      ];
      
      let completed = 0;
      verificationQueries.forEach((query, index) => {
        db.get(query.sql, (err, result) => {
          if (!err && result) {
            console.log(`✅ ${query.name}: ${result.count} records`);
          }
          
          completed++;
          if (completed === verificationQueries.length) {
            console.log('\n🎉 Farm Manager System Migration Completed!');
            console.log('\n📋 What\'s been added:');
            console.log('• Farm management with role-based access');
            console.log('• Farm Manager role with specific permissions');
            console.log('• Hierarchical permission system');
            console.log('• Farm-scoped data access');
            console.log('\n🔐 Available Roles:');
            console.log('• admin - Full system access');
            console.log('• owner - Full farm access');
            console.log('• manager - Farm management + user management');
            console.log('• worker - Limited farm access');
            console.log('\n🚀 System is ready for farm manager functionality!');
            
            db.close();
          }
        });
      });
    }, 4000);
  });
}

// Run the migration
runMigration();
