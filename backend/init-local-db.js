#!/usr/bin/env node

/**
 * 🏠 NHFarming Local Database Initialization Script
 * 
 * This script sets up the complete local database with all tables and sample data.
 * Run this once when setting up the project locally.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'farm.db');
const db = new sqlite3.Database(dbPath);

console.log('🏠 NHFarming Local Database Setup');
console.log('==================================');

// Check if database already exists
if (fs.existsSync(dbPath)) {
  console.log('⚠️  Database already exists. Do you want to reset it? (y/N)');
  process.stdin.once('data', (data) => {
    const input = data.toString().trim().toLowerCase();
    if (input === 'y' || input === 'yes') {
      console.log('🗑️  Removing existing database...');
      fs.unlinkSync(dbPath);
      setupDatabase();
    } else {
      console.log('✅ Keeping existing database');
      process.exit(0);
    }
  });
} else {
  setupDatabase();
}

function setupDatabase() {
  console.log('🗄️  Creating new database...');
  
  db.serialize(() => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating users table:', err);
      } else {
        console.log('✅ Users table created');
      }
    });

    // Create fields table
    db.run(`
      CREATE TABLE IF NOT EXISTS fields (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        area REAL NOT NULL,
        area_unit TEXT NOT NULL,
        location TEXT,
        coordinates TEXT,
        soil_type TEXT,
        irrigation_type TEXT,
        notes TEXT,
        border_coordinates TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating fields table:', err);
      } else {
        console.log('✅ Fields table created');
      }
    });

    // Create crops table
    db.run(`
      CREATE TABLE IF NOT EXISTS crops (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crop_type TEXT NOT NULL,
        field_id TEXT,
        field_name TEXT,
        planting_date TEXT,
        harvest_date TEXT,
        notes TEXT,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (field_id) REFERENCES fields (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating crops table:', err);
      } else {
        console.log('✅ Crops table created');
      }
    });

    // Create applications table
    db.run(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        crop_id INTEGER,
        input_id INTEGER,
        rate REAL NOT NULL,
        unit TEXT NOT NULL,
        application_date TEXT NOT NULL,
        field_id TEXT,
        field_name TEXT,
        notes TEXT,
        user_id INTEGER,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (crop_id) REFERENCES crops (id),
        FOREIGN KEY (input_id) REFERENCES inputs (id),
        FOREIGN KEY (field_id) REFERENCES fields (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating applications table:', err);
      } else {
        console.log('✅ Applications table created');
      }
    });

    // Create inputs table
    db.run(`
      CREATE TABLE IF NOT EXISTS inputs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        unit TEXT NOT NULL,
        notes TEXT,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating inputs table:', err);
      } else {
        console.log('✅ Inputs table created');
      }
    });

    // Create vehicles table
    db.run(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        model TEXT,
        year INTEGER,
        notes TEXT,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating vehicles table:', err);
      } else {
        console.log('✅ Vehicles table created');
      }
    });

    // Create maintenance table
    db.run(`
      CREATE TABLE IF NOT EXISTS maintenance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        maintenance_type TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        cost REAL,
        notes TEXT,
        user_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `, (err) => {
      if (err) {
        console.error('❌ Error creating maintenance table:', err);
      } else {
        console.log('✅ Maintenance table created');
      }
    });

    // Create indexes for better performance
    setTimeout(() => {
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX IF NOT EXISTS idx_fields_name ON fields(name)',
        'CREATE INDEX IF NOT EXISTS idx_crops_field_id ON crops(field_id)',
        'CREATE INDEX IF NOT EXISTS idx_crops_user_id ON crops(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_applications_crop_id ON applications(crop_id)',
        'CREATE INDEX IF NOT EXISTS idx_applications_field_id ON applications(field_id)',
        'CREATE INDEX IF NOT EXISTS idx_applications_created_by ON applications(created_by)',
        'CREATE INDEX IF NOT EXISTS idx_inputs_user_id ON inputs(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_id ON maintenance(vehicle_id)',
        'CREATE INDEX IF NOT EXISTS idx_maintenance_user_id ON maintenance(user_id)'
      ];

      indexes.forEach((index, i) => {
        db.run(index, (err) => {
          if (err) {
            console.error(`❌ Error creating index ${i + 1}:`, err);
          } else {
            console.log(`✅ Index ${i + 1} created`);
          }
        });
      });

      // Insert sample data
      setTimeout(() => {
        insertSampleData();
      }, 1000);
    }, 1000);
  });
}

function insertSampleData() {
  console.log('\n📊 Inserting sample data...');

  // Sample fields
  const sampleFields = [
    {
      id: 'north_paddock',
      name: 'North Paddock',
      area: 25.5,
      area_unit: 'acres',
      location: 'North side of property',
      soil_type: 'Clay loam',
      irrigation_type: 'Sprinkler'
    },
    {
      id: 'south_field',
      name: 'South Field',
      area: 18.2,
      area_unit: 'acres',
      location: 'South side of property',
      soil_type: 'Sandy loam',
      irrigation_type: 'Drip'
    },
    {
      id: 'east_meadow',
      name: 'East Meadow',
      area: 32.0,
      area_unit: 'acres',
      location: 'East side of property',
      soil_type: 'Loam',
      irrigation_type: 'Center pivot'
    }
  ];

  const insertField = db.prepare(`
    INSERT INTO fields (id, name, area, area_unit, location, soil_type, irrigation_type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  sampleFields.forEach((field, index) => {
    insertField.run([
      field.id,
      field.name,
      field.area,
      field.area_unit,
      field.location,
      field.soil_type,
      field.irrigation_type
    ], function (err) {
      if (err) {
        console.error(`❌ Error inserting field ${field.name}:`, err);
      } else {
        console.log(`✅ Inserted field: ${field.name}`);
      }
    });
  });

  insertField.finalize((err) => {
    if (err) {
      console.error('❌ Error finalizing field insert:', err);
    } else {
      console.log('✅ Sample fields inserted');
    }
  });

  // Sample inputs
  const sampleInputs = [
    { name: 'Nitrogen Fertilizer', type: 'Fertilizer', unit: 'lbs/acre' },
    { name: 'Herbicide', type: 'Chemical', unit: 'oz/acre' },
    { name: 'Seeds', type: 'Seed', unit: 'lbs/acre' },
    { name: 'Water', type: 'Irrigation', unit: 'inches' }
  ];

  const insertInput = db.prepare(`
    INSERT INTO inputs (name, type, unit, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `);

  sampleInputs.forEach((input, index) => {
    insertInput.run([input.name, input.type, input.unit], function (err) {
      if (err) {
        console.error(`❌ Error inserting input ${input.name}:`, err);
      } else {
        console.log(`✅ Inserted input: ${input.name}`);
      }
    });
  });

  insertInput.finalize((err) => {
    if (err) {
      console.error('❌ Error finalizing input insert:', err);
    } else {
      console.log('✅ Sample inputs inserted');
    }
  });

  // Sample vehicles
  const sampleVehicles = [
    { name: 'John Deere Tractor', type: 'Tractor', model: '5075E', year: 2020 },
    { name: 'Sprayer', type: 'Sprayer', model: 'Self-propelled', year: 2018 },
    { name: 'Planter', type: 'Planter', model: '12-row', year: 2019 }
  ];

  const insertVehicle = db.prepare(`
    INSERT INTO vehicles (name, type, model, year, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  sampleVehicles.forEach((vehicle, index) => {
    insertVehicle.run([vehicle.name, vehicle.type, vehicle.model, vehicle.year], function (err) {
      if (err) {
        console.error(`❌ Error inserting vehicle ${vehicle.name}:`, err);
      } else {
        console.log(`✅ Inserted vehicle: ${vehicle.name}`);
      }
    });
  });

  insertVehicle.finalize((err) => {
    if (err) {
      console.error('❌ Error finalizing vehicle insert:', err);
    } else {
      console.log('✅ Sample vehicles inserted');
    }
  });

  // Final summary
  setTimeout(() => {
    db.all(`
      SELECT 
        'users' as table_name,
        COUNT(*) as count
      FROM users
      UNION ALL
      SELECT 
        'fields' as table_name,
        COUNT(*) as count
      FROM fields
      UNION ALL
      SELECT 
        'crops' as table_name,
        COUNT(*) as count
      FROM crops
      UNION ALL
      SELECT 
        'applications' as table_name,
        COUNT(*) as count
      FROM applications
      UNION ALL
      SELECT 
        'inputs' as table_name,
        COUNT(*) as count
      FROM inputs
      UNION ALL
      SELECT 
        'vehicles' as table_name,
        COUNT(*) as count
      FROM vehicles
      UNION ALL
      SELECT 
        'maintenance' as table_name,
        COUNT(*) as count
      FROM maintenance
    `, (err, results) => {
      if (err) {
        console.error('❌ Error getting summary:', err);
      } else {
        console.log('\n📊 Database Summary:');
        results.forEach(result => {
          console.log(`  ${result.table_name}: ${result.count} records`);
        });
      }
      
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err);
        } else {
          console.log('\n🎉 Local database setup completed successfully!');
          console.log('🏠 Your NHFarming application is ready for local development.');
          console.log('\n📝 Next steps:');
          console.log('1. Copy backend/env.example to backend/.env');
          console.log('2. Copy frontend/env.example to frontend/.env');
          console.log('3. Run: ./start-local.sh');
          console.log('4. Register your first user at http://localhost:3000');
        }
      });
    });
  }, 2000);
} 