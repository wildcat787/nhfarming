const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Create database connection with environment variable support
const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, process.env.DB_PATH)
  : path.join(__dirname, 'farm.db');

console.log(`Database path: ${dbPath}`);

// Ensure database directory exists
const fs = require('fs');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize database tables
db.serialize(() => {
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
      role TEXT DEFAULT 'user'
    )
  `);

  // Check and add missing columns
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (!err && columns) {
      const columnNames = columns.map(col => col.name);
      
      // Add role column if it doesn't exist
      if (!columnNames.includes('role')) {
        db.run('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"');
        console.log('Added role column to users table');
      }
      
      // Add verification_token column if it doesn't exist
      if (!columnNames.includes('verification_token')) {
        db.run('ALTER TABLE users ADD COLUMN verification_token TEXT');
        console.log('Added verification_token column to users table');
      }
      
      // Add verification_token_expiry column if it doesn't exist
      if (!columnNames.includes('verification_token_expiry')) {
        db.run('ALTER TABLE users ADD COLUMN verification_token_expiry DATETIME');
        console.log('Added verification_token_expiry column to users table');
      }
      
      // Add email_verified column if it doesn't exist
      if (!columnNames.includes('email_verified')) {
        db.run('ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0');
        console.log('Added email_verified column to users table');
      }

      // Add profile fields
      const profileFields = [
        'first_name', 'last_name', 'phone', 'address', 
        'city', 'state', 'zip_code', 'country'
      ];
      
      profileFields.forEach(field => {
        if (!columnNames.includes(field)) {
          db.run(`ALTER TABLE users ADD COLUMN ${field} TEXT`);
          console.log(`Added ${field} column to users table`);
        }
      });
    }
  });

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
      type TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (crop_id) REFERENCES crops (id),
      FOREIGN KEY (field_id) REFERENCES fields (id),
      FOREIGN KEY (tank_mixture_id) REFERENCES tank_mixtures (id),
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

  // Maintenance table
  db.run(`
    CREATE TABLE IF NOT EXISTS maintenance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      vehicle_id INTEGER,
      date TEXT,
      description TEXT,
      cost REAL,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
    )
  `);

  // Parts table
  db.run(`
    CREATE TABLE IF NOT EXISTS parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      maintenance_id INTEGER,
      name TEXT NOT NULL,
      part_number TEXT,
      cost REAL,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (maintenance_id) REFERENCES maintenance (id)
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
      FOREIGN KEY (farm_id) REFERENCES farms (id),
      UNIQUE(farm_id, name)
    )
  `);

  // Check if fields table has all required columns, add missing ones
  db.all("PRAGMA table_info(fields)", (err, columns) => {
    if (err) {
      console.error('Error checking fields table:', err);
      return;
    }
    
    const columnNames = columns.map(col => col.name);
    
    // Add missing columns if they don't exist
    const missingColumns = [
      { name: 'farm_id', type: 'INTEGER REFERENCES farms(id)' },
      { name: 'coordinates', type: 'TEXT' },
      { name: 'soil_type', type: 'TEXT' },
      { name: 'irrigation_type', type: 'TEXT' },
      { name: 'border_coordinates', type: 'TEXT' },
      { name: 'created_at', type: 'DATETIME' },
      { name: 'updated_at', type: 'DATETIME' }
    ];
    
    missingColumns.forEach(column => {
      if (!columnNames.includes(column.name)) {
        db.run(`ALTER TABLE fields ADD COLUMN ${column.name} ${column.type}`);
        console.log(`Added ${column.name} column to fields table`);
      }
    });
  });
});

module.exports = db; 