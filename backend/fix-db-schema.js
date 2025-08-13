#!/usr/bin/env node

/**
 * 🔧 Fix Database Schema Script
 * 
 * This script fixes the existing database schema by adding missing columns
 * to tables that were created with the old schema.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Get database path
const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, process.env.DB_PATH)
  : path.join(__dirname, 'farm.db');

console.log('🔧 Fixing Database Schema');
console.log('==========================');
console.log(`Database: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

async function fixDatabaseSchema() {
  console.log('🔍 Checking and fixing table schemas...');

  // Fix fields table
  db.all("PRAGMA table_info(fields)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking fields table:', err);
      return;
    }
    
    const columnNames = columns.map(col => col.name);
    console.log('📋 Fields table columns:', columnNames);
    
    // Add missing columns to fields table
    const missingFieldsColumns = [
      { name: 'user_id', type: 'INTEGER' },
      { name: 'area_unit', type: 'TEXT' },
      { name: 'location', type: 'TEXT' },
      { name: 'soil_type', type: 'TEXT' },
      { name: 'irrigation_type', type: 'TEXT' },
      { name: 'notes', type: 'TEXT' },
      { name: 'border_coordinates', type: 'TEXT' },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'updated_at', type: 'DATETIME' }
    ];
    
    missingFieldsColumns.forEach(column => {
      if (!columnNames.includes(column.name)) {
        db.run(`ALTER TABLE fields ADD COLUMN ${column.name} ${column.type}`, (err) => {
          if (err) {
            console.error(`❌ Error adding ${column.name} to fields:`, err.message);
          } else {
            console.log(`✅ Added ${column.name} to fields table`);
          }
        });
      }
    });

    // Update existing fields to have farm_id = 1 if it's null
    db.run('UPDATE fields SET farm_id = 1 WHERE farm_id IS NULL', (err) => {
      if (err) {
        console.error('❌ Error updating fields farm_id:', err.message);
      } else {
        console.log('✅ Updated fields farm_id');
      }
    });
  });

  // Fix applications table
  db.all("PRAGMA table_info(applications)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking applications table:', err);
      return;
    }
    
    const columnNames = columns.map(col => col.name);
    console.log('📋 Applications table columns:', columnNames);
    
    // Add missing columns to applications table
    const missingApplicationsColumns = [
      { name: 'user_id', type: 'INTEGER' },
      { name: 'tank_mixture_id', type: 'INTEGER' },
      { name: 'date', type: 'TEXT' },
      { name: 'start_time', type: 'TEXT' },
      { name: 'finish_time', type: 'TEXT' },
      { name: 'spray_rate', type: 'TEXT' },
      { name: 'spray_rate_unit', type: 'TEXT' },
      { name: 'weather_temp', type: 'TEXT' },
      { name: 'weather_humidity', type: 'TEXT' },
      { name: 'weather_wind', type: 'TEXT' },
      { name: 'weather_wind_direction', type: 'TEXT' },
      { name: 'weather_rain', type: 'TEXT' },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'updated_at', type: 'DATETIME' }
    ];
    
    missingApplicationsColumns.forEach(column => {
      if (!columnNames.includes(column.name)) {
        db.run(`ALTER TABLE applications ADD COLUMN ${column.name} ${column.type}`, (err) => {
          if (err) {
            console.error(`❌ Error adding ${column.name} to applications:`, err.message);
          } else {
            console.log(`✅ Added ${column.name} to applications table`);
          }
        });
      }
    });
  });

  // Fix crops table
  db.all("PRAGMA table_info(crops)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking crops table:', err);
      return;
    }
    
    const columnNames = columns.map(col => col.name);
    console.log('📋 Crops table columns:', columnNames);
    
    // Add missing columns to crops table
    const missingCropsColumns = [
      { name: 'user_id', type: 'INTEGER' },
      { name: 'field_id', type: 'INTEGER' },
      { name: 'crop_type', type: 'TEXT' },
      { name: 'field_name', type: 'TEXT' },
      { name: 'season_year', type: 'INTEGER' },
      { name: 'planting_date', type: 'DATE' },
      { name: 'expected_harvest_date', type: 'DATE' },
      { name: 'acres', type: 'REAL' },
      { name: 'status', type: 'TEXT' },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'updated_at', type: 'DATETIME' }
    ];
    
    missingCropsColumns.forEach(column => {
      if (!columnNames.includes(column.name)) {
        db.run(`ALTER TABLE crops ADD COLUMN ${column.name} ${column.type}`, (err) => {
          if (err) {
            console.error(`❌ Error adding ${column.name} to crops:`, err.message);
          } else {
            console.log(`✅ Added ${column.name} to crops table`);
          }
        });
      }
    });
  });

  // Fix inputs table
  db.all("PRAGMA table_info(inputs)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking inputs table:', err);
      return;
    }
    
    const columnNames = columns.map(col => col.name);
    console.log('📋 Inputs table columns:', columnNames);
    
    // Add missing columns to inputs table
    const missingInputsColumns = [
      { name: 'user_id', type: 'INTEGER' },
      { name: 'notes', type: 'TEXT' }
    ];
    
    missingInputsColumns.forEach(column => {
      if (!columnNames.includes(column.name)) {
        db.run(`ALTER TABLE inputs ADD COLUMN ${column.name} ${column.type}`, (err) => {
          if (err) {
            console.error(`❌ Error adding ${column.name} to inputs:`, err.message);
          } else {
            console.log(`✅ Added ${column.name} to inputs table`);
          }
        });
      }
    });
  });

  // Check if tank_mixtures table exists, create if not
  db.all("PRAGMA table_info(tank_mixtures)", (err, columns) => {
    if (err || !columns || columns.length === 0) {
      console.log('📋 Creating tank_mixtures table...');
      db.run(`
        CREATE TABLE IF NOT EXISTS tank_mixtures (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          name TEXT NOT NULL,
          description TEXT,
          total_volume REAL,
          volume_unit TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating tank_mixtures table:', err.message);
        } else {
          console.log('✅ Created tank_mixtures table');
        }
      });
    } else {
      console.log('📋 Tank_mixtures table exists');
    }
  });

  // Check if tank_mixture_ingredients table exists, create if not
  db.all("PRAGMA table_info(tank_mixture_ingredients)", (err, columns) => {
    if (err || !columns || columns.length === 0) {
      console.log('📋 Creating tank_mixture_ingredients table...');
      db.run(`
        CREATE TABLE IF NOT EXISTS tank_mixture_ingredients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tank_mixture_id INTEGER,
          input_id INTEGER,
          amount REAL NOT NULL,
          unit TEXT NOT NULL,
          form TEXT,
          measurement_type TEXT DEFAULT 'rate_per_ha',
          order_index INTEGER DEFAULT 0,
          notes TEXT,
          FOREIGN KEY (tank_mixture_id) REFERENCES tank_mixtures (id),
          FOREIGN KEY (input_id) REFERENCES inputs (id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating tank_mixture_ingredients table:', err.message);
        } else {
          console.log('✅ Created tank_mixture_ingredients table');
        }
      });
    } else {
      console.log('📋 Tank_mixture_ingredients table exists');
    }
  });

  // Check if farm_users table exists, create if not
  db.all("PRAGMA table_info(farm_users)", (err, columns) => {
    if (err || !columns || columns.length === 0) {
      console.log('📋 Creating farm_users table...');
      db.run(`
        CREATE TABLE IF NOT EXISTS farm_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          farm_id INTEGER,
          user_id INTEGER,
          role TEXT DEFAULT 'worker',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (farm_id) REFERENCES farms (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating farm_users table:', err.message);
        } else {
          console.log('✅ Created farm_users table');
        }
      });
    } else {
      console.log('📋 Farm_users table exists');
    }
  });

  // Fix vehicles table
  db.all("PRAGMA table_info(vehicles)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking vehicles table:', err);
      return;
    }
    
    const columnNames = columns.map(col => col.name);
    console.log('📋 Vehicles table columns:', columnNames);
    
    // Add missing columns to vehicles table
    const missingVehiclesColumns = [
      { name: 'registration_number', type: 'TEXT' },
      { name: 'registration_expiry_date', type: 'DATE' },
      { name: 'insurance_expiry_date', type: 'DATE' },
      { name: 'service_due_date', type: 'DATE' },
      { name: 'type', type: 'TEXT' },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'updated_at', type: 'DATETIME' }
    ];
    
    missingVehiclesColumns.forEach(column => {
      if (!columnNames.includes(column.name)) {
        db.run(`ALTER TABLE vehicles ADD COLUMN ${column.name} ${column.type}`, (err) => {
          if (err) {
            console.error(`❌ Error adding ${column.name} to vehicles:`, err.message);
          } else {
            console.log(`✅ Added ${column.name} to vehicles table`);
          }
        });
      }
    });
  });

  // Check if reminders table exists, create if not
  db.all("PRAGMA table_info(reminders)", (err, columns) => {
    if (err || !columns || columns.length === 0) {
      console.log('📋 Creating reminders table...');
      db.run(`
        CREATE TABLE IF NOT EXISTS reminders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          vehicle_id INTEGER,
          reminder_type TEXT NOT NULL,
          expiry_date DATE NOT NULL,
          reminder_date DATE NOT NULL,
          message TEXT,
          sent BOOLEAN DEFAULT 0,
          sent_date DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id),
          FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Error creating reminders table:', err.message);
        } else {
          console.log('✅ Created reminders table');
        }
      });
    } else {
      console.log('📋 Reminders table exists');
    }
  });

  // Wait a bit for all operations to complete, then close
  setTimeout(() => {
    console.log('✅ Database schema fix complete!');
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('✅ Database connection closed');
      }
    });
  }, 2000);
}

// Run the fix
fixDatabaseSchema();
