const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'farm.db');
const db = new sqlite3.Database(dbPath);

console.log('🔄 Migrating field IDs to use field names...');

db.serialize(() => {
  // First, let's check the current fields
  db.all('SELECT id, name FROM fields ORDER BY id', (err, fields) => {
    if (err) {
      console.error('❌ Error getting fields:', err);
      return;
    }
    
    if (fields.length === 0) {
      console.log('⚠️  No fields found. Please run migrate-fields.js first.');
      return;
    }
    
    console.log(`📋 Found ${fields.length} fields:`);
    fields.forEach(field => {
      console.log(`  - ID: ${field.id}, Name: "${field.name}"`);
    });
    
    // Create a mapping of old ID to new name-based ID
    const fieldMapping = {};
    fields.forEach(field => {
      // Create a safe field name ID (replace spaces with underscores, remove special chars)
      const safeName = field.name
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .toLowerCase();
      fieldMapping[field.id] = safeName;
    });
    
    console.log('\n🔄 Field ID mapping:');
    Object.entries(fieldMapping).forEach(([oldId, newId]) => {
      console.log(`  ${oldId} → ${newId}`);
    });
    
    // Start the migration process
    console.log('\n🔄 Starting migration...');
    
    // Step 1: Create new fields table with name-based IDs
    db.run(`
      CREATE TABLE fields_new (
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
        console.error('❌ Error creating new fields table:', err);
        return;
      }
      console.log('✅ Created new fields table');
      
      // Step 2: Copy data to new table with name-based IDs
      const insertField = db.prepare(`
        INSERT INTO fields_new (id, name, area, area_unit, location, coordinates, soil_type, irrigation_type, notes, border_coordinates, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      let insertedCount = 0;
      fields.forEach((field, index) => {
        const newId = fieldMapping[field.id];
        insertField.run([
          newId,
          field.name,
          field.area,
          field.area_unit,
          field.location,
          field.coordinates,
          field.soil_type,
          field.irrigation_type,
          field.notes,
          field.border_coordinates,
          field.created_at,
          field.updated_at
        ], (err) => {
          if (err) {
            console.error(`❌ Error inserting field ${field.name}:`, err);
          } else {
            insertedCount++;
            console.log(`✅ Inserted field: ${field.name} (${newId})`);
          }
          
          // When all fields are processed, continue with next step
          if (insertedCount === fields.length) {
            insertField.finalize((err) => {
              if (err) {
                console.error('❌ Error finalizing field insert:', err);
                return;
              }
              
              // Step 3: Update crops table to use new field IDs
              console.log('\n🔄 Updating crops table...');
              const updateCrop = db.prepare(`
                UPDATE crops SET field_id = ? WHERE field_id = ?
              `);
              
              let updatedCrops = 0;
              Object.entries(fieldMapping).forEach(([oldId, newId], index) => {
                updateCrop.run([newId, oldId], (err) => {
                  if (err) {
                    console.error(`❌ Error updating crops for field ${oldId}:`, err);
                  } else {
                    updatedCrops++;
                    console.log(`✅ Updated crops for field ${oldId} → ${newId}`);
                  }
                  
                  if (updatedCrops === Object.keys(fieldMapping).length) {
                    updateCrop.finalize((err) => {
                      if (err) {
                        console.error('❌ Error finalizing crop updates:', err);
                        return;
                      }
                      
                      // Step 4: Update applications table to use new field IDs
                      console.log('\n🔄 Updating applications table...');
                      const updateApp = db.prepare(`
                        UPDATE applications SET field_id = ? WHERE field_id = ?
                      `);
                      
                      let updatedApps = 0;
                      Object.entries(fieldMapping).forEach(([oldId, newId], index) => {
                        updateApp.run([newId, oldId], (err) => {
                          if (err) {
                            console.error(`❌ Error updating applications for field ${oldId}:`, err);
                          } else {
                            updatedApps++;
                            console.log(`✅ Updated applications for field ${oldId} → ${newId}`);
                          }
                          
                          if (updatedApps === Object.keys(fieldMapping).length) {
                            updateApp.finalize((err) => {
                              if (err) {
                                console.error('❌ Error finalizing application updates:', err);
                                return;
                              }
                              
                              // Step 5: Replace old table with new table
                              console.log('\n🔄 Replacing old fields table...');
                              db.run('DROP TABLE fields', (err) => {
                                if (err) {
                                  console.error('❌ Error dropping old fields table:', err);
                                  return;
                                }
                                
                                db.run('ALTER TABLE fields_new RENAME TO fields', (err) => {
                                  if (err) {
                                    console.error('❌ Error renaming new fields table:', err);
                                    return;
                                  }
                                  
                                  console.log('✅ Successfully replaced fields table');
                                  
                                  // Step 6: Update indexes
                                  console.log('\n🔄 Updating indexes...');
                                  db.run('DROP INDEX IF EXISTS idx_fields_name', (err) => {
                                    if (err) console.error('⚠️  Warning dropping old index:', err);
                                    
                                    db.run('CREATE INDEX IF NOT EXISTS idx_fields_name ON fields(name)', (err) => {
                                      if (err) {
                                        console.error('❌ Error creating name index:', err);
                                      } else {
                                        console.log('✅ Created name index');
                                      }
                                      
                                      // Step 7: Show final summary
                                      setTimeout(() => {
                                        db.all(`
                                          SELECT 
                                            'fields' as table_name,
                                            COUNT(*) as total_records
                                          FROM fields
                                          UNION ALL
                                          SELECT 
                                            'crops' as table_name,
                                            COUNT(*) as total_records
                                          FROM crops
                                          UNION ALL
                                          SELECT 
                                            'applications' as table_name,
                                            COUNT(*) as total_records
                                          FROM applications
                                        `, (err, results) => {
                                          if (err) {
                                            console.error('❌ Error getting summary:', err);
                                          } else {
                                            console.log('\n📊 Migration Summary:');
                                            results.forEach(result => {
                                              console.log(`  ${result.table_name}: ${result.total_records} records`);
                                            });
                                          }
                                          
                                          // Show new field IDs
                                          db.all('SELECT id, name FROM fields ORDER BY name', (err, newFields) => {
                                            if (err) {
                                              console.error('❌ Error getting new fields:', err);
                                            } else {
                                              console.log('\n🌾 New Field IDs:');
                                              newFields.forEach(field => {
                                                console.log(`  "${field.name}" → ${field.id}`);
                                              });
                                            }
                                            
                                            db.close((err) => {
                                              if (err) {
                                                console.error('❌ Error closing database:', err);
                                              } else {
                                                console.log('\n✅ Field name migration completed successfully!');
                                                console.log('🌾 All field IDs now use field names instead of numeric IDs.');
                                              }
                                            });
                                          });
                                        });
                                      }, 1000);
                                    });
                                  });
                                });
                              });
                            });
                          }
                        });
                      });
                    });
                  }
                });
              });
            });
          }
        });
      });
    });
  });
}); 