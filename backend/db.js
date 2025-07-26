const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'farm.db'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    reset_token TEXT,
    reset_token_expiry TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Add reset token columns if upgrading an existing DB
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (!err && columns) {
      if (!columns.some(col => col.name === 'reset_token')) {
        db.run('ALTER TABLE users ADD COLUMN reset_token TEXT');
      }
      if (!columns.some(col => col.name === 'reset_token_expiry')) {
        db.run('ALTER TABLE users ADD COLUMN reset_token_expiry TEXT');
      }
    }
  });
  
  db.run(`CREATE TABLE IF NOT EXISTS crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    crop_type TEXT NOT NULL,
    field_name TEXT,
    planting_date TEXT,
    harvest_date TEXT,
    notes TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS inputs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    unit TEXT,
    notes TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    crop_id INTEGER,
    input_id INTEGER NOT NULL,
    vehicle_id INTEGER,
    date TEXT,
    start_time TEXT,
    finish_time TEXT,
    rate REAL,
    unit TEXT,
    weather_temp REAL,
    weather_humidity REAL,
    weather_wind REAL,
    weather_rain REAL,
    notes TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(crop_id) REFERENCES crops(id),
    FOREIGN KEY(input_id) REFERENCES inputs(id),
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
  )`);
  // Add start_time and finish_time columns if upgrading an existing DB
  db.all("PRAGMA table_info(applications)", (err, columns) => {
    if (!err && columns) {
      if (!columns.some(col => col.name === 'start_time')) {
        db.run('ALTER TABLE applications ADD COLUMN start_time TEXT');
      }
      if (!columns.some(col => col.name === 'finish_time')) {
        db.run('ALTER TABLE applications ADD COLUMN finish_time TEXT');
      }
    }
  });
  // Add vehicle_id column if upgrading an existing DB
  db.all("PRAGMA table_info(applications)", (err, columns) => {
    if (!err && columns && !columns.some(col => col.name === 'vehicle_id')) {
      db.run('ALTER TABLE applications ADD COLUMN vehicle_id INTEGER');
    }
  });
  db.run(`CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    make TEXT,
    model TEXT,
    year TEXT,
    vin TEXT,
    notes TEXT,
    application_type TEXT,
    type TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  // Add application_type column if upgrading an existing DB
  db.all("PRAGMA table_info(vehicles)", (err, columns) => {
    if (!err && columns) {
      if (!columns.some(col => col.name === 'application_type')) {
        db.run('ALTER TABLE vehicles ADD COLUMN application_type TEXT');
      }
      if (!columns.some(col => col.name === 'type')) {
        db.run('ALTER TABLE vehicles ADD COLUMN type TEXT');
      }
    }
  });
  db.run(`CREATE TABLE IF NOT EXISTS maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    date TEXT,
    description TEXT,
    cost REAL,
    notes TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    maintenance_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    quantity REAL,
    cost REAL,
    FOREIGN KEY(maintenance_id) REFERENCES maintenance(id)
  )`);
});

module.exports = db; 