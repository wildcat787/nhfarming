PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  , reset_token TEXT, reset_token_expiry TEXT);
INSERT INTO users VALUES(1,'testuser','$2b$10$exGsCIc05uE33dj2T33PJeF7EC7b0BtfJ/6UkGBVyZyX7Q2oDTuwK','user','2025-07-20 13:11:53',NULL,NULL);
INSERT INTO users VALUES(2,'Daniel','$2b$10$MKR0Pql9GzyVb0H3Ux2sGu.jH/bDRAUqAGKdQCmaCprQl02xykzfW','user','2025-07-20 13:23:16',NULL,NULL);
CREATE TABLE crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    crop_type TEXT NOT NULL,
    field_name TEXT,
    planting_date TEXT,
    harvest_date TEXT,
    notes TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
INSERT INTO crops VALUES(1,2,'Lentils','40B','2025-06-08','','');
INSERT INTO crops VALUES(2,2,'Barley','26','2025-06-19','','');
CREATE TABLE inputs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    unit TEXT,
    notes TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
INSERT INTO inputs VALUES(1,2,'Paraquat 250','chemical','L','');
INSERT INTO inputs VALUES(2,2,'Overwatch','chemical','L','');
CREATE TABLE applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    crop_id INTEGER,
    input_id INTEGER NOT NULL,
    date TEXT,
    rate REAL,
    unit TEXT,
    weather_temp REAL,
    weather_humidity REAL,
    weather_wind REAL,
    weather_rain REAL,
    notes TEXT, input_type TEXT, vehicle_id INTEGER, start_time TEXT, finish_time TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(crop_id) REFERENCES crops(id),
    FOREIGN KEY(input_id) REFERENCES inputs(id)
  );
INSERT INTO applications VALUES(1,2,1,1,'','2L/Ha','','','','','','spraying',NULL,5,NULL,NULL);
INSERT INTO applications VALUES(2,2,2,2,'2025-07-07','1.8L/Ha','','','','','','',NULL,NULL,NULL,NULL);
CREATE TABLE vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    make TEXT,
    model TEXT,
    year TEXT,
    vin TEXT,
    notes TEXT, application_type TEXT, type TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
INSERT INTO vehicles VALUES(1,2,'Loader','Case','Puma 165','2006','','',NULL,NULL);
INSERT INTO vehicles VALUES(2,2,'Duals','Case','Puma 210','2006','','',NULL,NULL);
INSERT INTO vehicles VALUES(3,2,'Lexi','Claas','Lexion 600','2010','','',NULL,NULL);
INSERT INTO vehicles VALUES(5,2,'Boom','Hardi','Commander 7036','2015','','',NULL,NULL);
INSERT INTO vehicles VALUES(6,1,'Test Tractor','John Deere','6120M','2020',NULL,NULL,'general use','tractor');
INSERT INTO vehicles VALUES(7,1,'Big Red Tractor','John Deere','6120M','2021',NULL,'Updated via name-based API','general use','tractor');
CREATE TABLE maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    date TEXT,
    description TEXT,
    cost REAL,
    notes TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
  );
INSERT INTO maintenance VALUES(1,2,1,'2025-04-04','Service','','Oil and Filters');
CREATE TABLE parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    maintenance_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    quantity REAL,
    cost REAL,
    FOREIGN KEY(maintenance_id) REFERENCES maintenance(id)
  );
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('users',2);
INSERT INTO sqlite_sequence VALUES('crops',2);
INSERT INTO sqlite_sequence VALUES('inputs',2);
INSERT INTO sqlite_sequence VALUES('applications',2);
INSERT INTO sqlite_sequence VALUES('vehicles',7);
INSERT INTO sqlite_sequence VALUES('maintenance',1);
COMMIT;
