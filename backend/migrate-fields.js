const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'farm.db');
const db = new sqlite3.Database(dbPath);

console.log('🌾 Creating fields table...');

db.serialize(() => {
  // Create fields table
  db.run(`
    CREATE TABLE IF NOT EXISTS fields (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      console.log('✅ Fields table created successfully');
    }
  });

  // Add field_id to applications table if it doesn't exist
  db.run(`
    ALTER TABLE applications ADD COLUMN field_id INTEGER
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('❌ Error adding field_id to applications:', err);
    } else {
      console.log('✅ Field_id column added to applications table');
    }
  });

  // Add field_id to crops table if it doesn't exist
  db.run(`
    ALTER TABLE crops ADD COLUMN field_id INTEGER
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('❌ Error adding field_id to crops:', err);
    } else {
      console.log('✅ Field_id column added to crops table');
    }
  });

  // Create indexes for better performance
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_fields_name ON fields(name)
  `, (err) => {
    if (err) {
      console.error('❌ Error creating fields name index:', err);
    } else {
      console.log('✅ Fields name index created');
    }
  });

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_applications_field_id ON applications(field_id)
  `, (err) => {
    if (err) {
      console.error('❌ Error creating applications field_id index:', err);
    } else {
      console.log('✅ Applications field_id index created');
    }
  });

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_crops_field_id ON crops(field_id)
  `, (err) => {
    if (err) {
      console.error('❌ Error creating crops field_id index:', err);
    } else {
      console.log('✅ Crops field_id index created');
    }
  });

  // Insert sample fields
  const sampleFields = [
    {
      name: 'North Paddock',
      area: 25.5,
      area_unit: 'hectares',
      location: 'North side of property',
      coordinates: JSON.stringify({ lat: -33.8688, lng: 151.2093 }),
      soil_type: 'Clay loam',
      irrigation_type: 'Sprinkler',
      notes: 'Main cropping area, good drainage'
    },
    {
      name: 'South Field',
      area: 18.2,
      area_unit: 'hectares',
      location: 'South side near creek',
      coordinates: JSON.stringify({ lat: -33.8700, lng: 151.2100 }),
      soil_type: 'Sandy loam',
      irrigation_type: 'Drip',
      notes: 'Irrigated area, suitable for vegetables'
    },
    {
      name: 'East Block',
      area: 32.0,
      area_unit: 'hectares',
      location: 'Eastern boundary',
      coordinates: JSON.stringify({ lat: -33.8670, lng: 151.2110 }),
      soil_type: 'Red clay',
      irrigation_type: 'Flood',
      notes: 'Large block for broadacre crops'
    }
  ];

  const insertField = db.prepare(`
    INSERT INTO fields (
      name, area, area_unit, location, coordinates, soil_type, 
      irrigation_type, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  sampleFields.forEach((field, index) => {
    insertField.run([
      field.name,
      field.area,
      field.area_unit,
      field.location,
      field.coordinates,
      field.soil_type,
      field.irrigation_type,
      field.notes
    ], (err) => {
      if (err) {
        console.error(`❌ Error inserting sample field ${index + 1}:`, err);
      } else {
        console.log(`✅ Sample field "${field.name}" inserted`);
      }
    });
  });

  insertField.finalize((err) => {
    if (err) {
      console.error('❌ Error finalizing field insertions:', err);
    } else {
      console.log('✅ All sample fields inserted successfully');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('❌ Error closing database:', err);
  } else {
    console.log('✅ Database migration completed successfully');
    console.log('🌾 Fields table is ready for use!');
  }
}); 