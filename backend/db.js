const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'farm.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      reset_token TEXT,
      reset_token_expiry DATETIME,
      role TEXT DEFAULT 'user'
    )
  `);

  // Check if role column exists and add it if it doesn't
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (!err && columns) {
      const hasRoleColumn = columns.some(col => col.name === 'role');
      if (!hasRoleColumn) {
        db.run('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"');
        console.log('Added role column to users table');
      }
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
      crop_type TEXT NOT NULL,
      field_name TEXT,
      acres REAL,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
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
      input_id INTEGER,
      vehicle_id INTEGER,
      date TEXT,
      start_time TEXT,
      finish_time TEXT,
      rate TEXT,
      unit TEXT,
      weather_temp TEXT,
      weather_humidity TEXT,
      weather_wind TEXT,
      weather_rain TEXT,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (crop_id) REFERENCES crops (id),
      FOREIGN KEY (input_id) REFERENCES inputs (id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
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
});

module.exports = db; 