const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database path
const dbPath = path.join(__dirname, 'farm.db');

console.log('Initializing database with local data...');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize database with local data
db.serialize(() => {
  // Create tables (same as db.js)
  console.log('Creating tables...');
  
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
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
  `);

  // Farms table
  db.run(`
    CREATE TABLE IF NOT EXISTS farms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT,
      area REAL,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Fields table
  db.run(`
    CREATE TABLE IF NOT EXISTS fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      farm_id INTEGER,
      name TEXT NOT NULL,
      area REAL,
      area_unit TEXT,
      location TEXT,
      coordinates TEXT,
      soil_type TEXT,
      irrigation_type TEXT,
      notes TEXT,
      border_coordinates TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (farm_id) REFERENCES farms (id)
    )
  `);

  // Crops table
  db.run(`
    CREATE TABLE IF NOT EXISTS crops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      field_id INTEGER,
      crop_type TEXT NOT NULL,
      field_name TEXT,
      season_year INTEGER NOT NULL,
      planting_date DATE,
      expected_harvest_date DATE,
      acres REAL,
      status TEXT DEFAULT 'growing',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (field_id) REFERENCES fields (id)
    )
  `);

  // Vehicles table
  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      make TEXT,
      model TEXT,
      year TEXT,
      vin TEXT,
      registration_number TEXT,
      registration_expiry_date DATE,
      insurance_expiry_date DATE,
      service_due_date DATE,
      notes TEXT,
      application_type TEXT,
      type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Applications table
  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      crop_id INTEGER,
      field_id INTEGER,
      tank_mixture_id INTEGER,
      vehicle_id INTEGER,
      date TEXT,
      start_time TEXT,
      finish_time TEXT,
      spray_rate TEXT,
      spray_rate_unit TEXT,
      weather_temp TEXT,
      weather_humidity TEXT,
      weather_wind TEXT,
      weather_wind_direction TEXT,
      weather_rain TEXT,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (crop_id) REFERENCES crops (id),
      FOREIGN KEY (field_id) REFERENCES fields (id),
      FOREIGN KEY (tank_mixture_id) REFERENCES tank_mixtures (id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
    )
  `);

  // Inputs table
  db.run(`
    CREATE TABLE IF NOT EXISTS inputs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      type TEXT,
      unit TEXT,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Parts table
  db.run(`
    CREATE TABLE IF NOT EXISTS parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER,
      name TEXT NOT NULL,
      part_number TEXT,
      description TEXT,
      cost REAL,
      supplier TEXT,
      installed_date DATE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
    )
  `);

  // Maintenance table
  db.run(`
    CREATE TABLE IF NOT EXISTS maintenance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER,
      type TEXT NOT NULL,
      description TEXT,
      date DATE,
      cost REAL,
      mileage INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
    )
  `);

  // Tank mixtures table
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
  `);

  // Tank mixture ingredients table
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
  `);

  // Farm users table
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
  `);

  // Reminders table for vehicle expiry notifications
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
  `);

  // Insert default admin user
  console.log('Inserting default admin user...');
  const bcrypt = require('bcrypt');
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  db.run(`
    INSERT OR IGNORE INTO users (username, password, email, role, email_verified)
    VALUES (?, ?, ?, ?, ?)
  `, ['admin', hashedPassword, 'admin@nhfarming.com', 'admin', 1]);

  // Insert sample data if tables are empty
  console.log('Inserting sample data...');
  
  // Check if farms table is empty and insert sample farm
  db.get('SELECT COUNT(*) as count FROM farms', (err, row) => {
    if (!err && row.count === 0) {
      db.run(`
        INSERT INTO farms (name, location, area, user_id)
        VALUES (?, ?, ?, ?)
      `, ['Sample Farm', 'New Hampshire', 100.5, 1]);
      console.log('Added sample farm');
    }
  });

  // Check if fields table is empty and insert sample field
  db.get('SELECT COUNT(*) as count FROM fields', (err, row) => {
    if (!err && row.count === 0) {
      db.run(`
        INSERT INTO fields (user_id, farm_id, name, area, area_unit, location, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [1, 1, 'North Field', 25.0, 'hectares', 'North side of property', 'Main production field']);
      console.log('Added sample field');
    }
  });

  // Check if crops table is empty and insert sample crop
  db.get('SELECT COUNT(*) as count FROM crops', (err, row) => {
    if (!err && row.count === 0) {
      db.run(`
        INSERT INTO crops (user_id, field_id, crop_type, field_name, season_year, planting_date, expected_harvest_date, acres, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [1, 1, 'Wheat', 'North Field', 2025, '2025-09-15', '2025-07-15', 25.0, 'growing', 'Winter wheat crop 2025']);
      console.log('Added sample crop');
    }
  });

  // Check if vehicles table is empty and insert sample vehicle
  db.get('SELECT COUNT(*) as count FROM vehicles', (err, row) => {
    if (!err && row.count === 0) {
      db.run(`
        INSERT INTO vehicles (user_id, name, make, model, year, registration_number, registration_expiry_date, insurance_expiry_date, service_due_date, application_type, type, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [1, 'Tractor 1', 'John Deere', '6120M', '2020', 'NH-12345', '2025-12-31', '2025-12-31', '2025-11-15', 'spraying', 'tractor', 'Main spraying tractor']);
      console.log('Added sample vehicle');
    }
  });

  // Check if inputs table is empty and insert sample inputs
  db.get('SELECT COUNT(*) as count FROM inputs', (err, row) => {
    if (!err && row.count === 0) {
      const sampleInputs = [
        [1, 'Roundup PowerMax', 'herbicide', 'L', 'Broad-spectrum herbicide'],
        [1, 'Urea', 'fertilizer', 'kg', 'High nitrogen fertilizer'],
        [1, 'MAP', 'fertilizer', 'kg', 'Phosphorus fertilizer'],
        [1, '2,4-D Amine', 'herbicide', 'L', 'Broadleaf herbicide']
      ];
      
      sampleInputs.forEach(input => {
        db.run(`
          INSERT INTO inputs (user_id, name, type, unit, notes)
          VALUES (?, ?, ?, ?, ?)
        `, input);
      });
      console.log('Added sample inputs');
    }
  });

  // Check if tank mixtures table is empty and insert sample tank mixture
  db.get('SELECT COUNT(*) as count FROM tank_mixtures', (err, row) => {
    if (!err && row.count === 0) {
      db.run(`
        INSERT INTO tank_mixtures (user_id, name, description, total_volume, volume_unit, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [1, 'Herbicide Mix 1', 'Roundup + 2,4-D for broadleaf weeds', 100, 'L', 'Standard herbicide mixture']);
      console.log('Added sample tank mixture');
    }
  });

  // Check if farm_users table is empty and insert sample farm user
  db.get('SELECT COUNT(*) as count FROM farm_users', (err, row) => {
    if (!err && row.count === 0) {
      db.run(`
        INSERT INTO farm_users (farm_id, user_id, role)
        VALUES (?, ?, ?)
      `, [1, 1, 'owner']);
      console.log('Added sample farm user');
    }
  });

  console.log('Database initialization complete!');
  
  // Close database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
});
