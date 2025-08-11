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
      farm_id INTEGER,
      name TEXT NOT NULL,
      area REAL,
      coordinates TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farm_id) REFERENCES farms (id)
    )
  `);

  // Crops table
  db.run(`
    CREATE TABLE IF NOT EXISTS crops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      field_id INTEGER,
      name TEXT NOT NULL,
      variety TEXT,
      planting_date DATE,
      expected_harvest_date DATE,
      status TEXT DEFAULT 'growing',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
      notes TEXT,
      application_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  // Applications table
  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      field_id INTEGER,
      vehicle_id INTEGER,
      crop_id INTEGER,
      application_type TEXT NOT NULL,
      product_name TEXT,
      rate REAL,
      rate_unit TEXT,
      application_date DATE,
      notes TEXT,
      weather_conditions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (field_id) REFERENCES fields (id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (id),
      FOREIGN KEY (crop_id) REFERENCES crops (id)
    )
  `);

  // Inputs table
  db.run(`
    CREATE TABLE IF NOT EXISTS inputs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      unit TEXT,
      cost_per_unit REAL,
      supplier TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      name TEXT NOT NULL,
      description TEXT,
      total_volume REAL,
      volume_unit TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tank mixture ingredients table
  db.run(`
    CREATE TABLE IF NOT EXISTS tank_mixture_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tank_mixture_id INTEGER,
      input_id INTEGER,
      amount REAL,
      unit TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
        INSERT INTO fields (farm_id, name, area, coordinates)
        VALUES (?, ?, ?, ?)
      `, [1, 'Field 1', 25.0, '42.9956,-71.4548']);
      console.log('Added sample field');
    }
  });

  // Check if crops table is empty and insert sample crop
  db.get('SELECT COUNT(*) as count FROM crops', (err, row) => {
    if (!err && row.count === 0) {
      db.run(`
        INSERT INTO crops (field_id, name, variety, planting_date, expected_harvest_date, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [1, 'Corn', 'Sweet Corn', '2024-05-15', '2024-09-15', 'growing']);
      console.log('Added sample crop');
    }
  });

  // Check if vehicles table is empty and insert sample vehicle
  db.get('SELECT COUNT(*) as count FROM vehicles', (err, row) => {
    if (!err && row.count === 0) {
      db.run(`
        INSERT INTO vehicles (user_id, name, make, model, year, application_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [1, 'Tractor 1', 'John Deere', '6120M', '2020', 'spraying']);
      console.log('Added sample vehicle');
    }
  });

  // Check if inputs table is empty and insert sample inputs
  db.get('SELECT COUNT(*) as count FROM inputs', (err, row) => {
    if (!err && row.count === 0) {
      const sampleInputs = [
        ['Glyphosate', 'herbicide', 'Broad-spectrum herbicide', 'gal', 45.00, 'Local Supplier'],
        ['Nitrogen Fertilizer', 'fertilizer', 'High nitrogen fertilizer', 'lb', 0.85, 'Local Supplier'],
        ['Seeds', 'seed', 'Corn seeds', 'lb', 2.50, 'Local Supplier']
      ];
      
      sampleInputs.forEach(input => {
        db.run(`
          INSERT INTO inputs (name, type, description, unit, cost_per_unit, supplier)
          VALUES (?, ?, ?, ?, ?, ?)
        `, input);
      });
      console.log('Added sample inputs');
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
