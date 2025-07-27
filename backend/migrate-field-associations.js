const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'farm.db');
const db = new sqlite3.Database(dbPath);

console.log('🔗 Migrating field associations...');

db.serialize(() => {
  // First, let's check if we have any existing fields
  db.get('SELECT COUNT(*) as count FROM fields', (err, result) => {
    if (err) {
      console.error('❌ Error checking fields:', err);
      return;
    }
    
    if (result.count === 0) {
      console.log('⚠️  No fields found. Please run migrate-fields.js first.');
      return;
    }
    
    console.log(`✅ Found ${result.count} fields`);
    
    // Update crops table to add field_id column if it doesn't exist
    db.run(`
      ALTER TABLE crops ADD COLUMN field_id INTEGER
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('❌ Error adding field_id to crops:', err);
      } else {
        console.log('✅ Field_id column added to crops table');
      }
    });

    // Update applications table to add field_id column if it doesn't exist
    db.run(`
      ALTER TABLE applications ADD COLUMN field_id INTEGER
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('❌ Error adding field_id to applications:', err);
      } else {
        console.log('✅ Field_id column added to applications table');
      }
    });

    // Get the first field as default
    db.get('SELECT id, name FROM fields ORDER BY id LIMIT 1', (err, defaultField) => {
      if (err) {
        console.error('❌ Error getting default field:', err);
        return;
      }

      console.log(`📋 Using "${defaultField.name}" as default field for existing records`);

      // Update existing crops to associate with the default field
      db.run(`
        UPDATE crops 
        SET field_id = ? 
        WHERE field_id IS NULL OR field_id = ''
      `, [defaultField.id], function (err) {
        if (err) {
          console.error('❌ Error updating crops:', err);
        } else {
          console.log(`✅ Updated ${this.changes} crops with field association`);
        }
      });

      // Update existing applications to associate with the default field
      db.run(`
        UPDATE applications 
        SET field_id = ? 
        WHERE field_id IS NULL OR field_id = ''
      `, [defaultField.id], function (err) {
        if (err) {
          console.error('❌ Error updating applications:', err);
        } else {
          console.log(`✅ Updated ${this.changes} applications with field association`);
        }
      });

      // Create indexes for better performance
      db.run(`
        CREATE INDEX IF NOT EXISTS idx_crops_field_id ON crops(field_id)
      `, (err) => {
        if (err) {
          console.error('❌ Error creating crops field_id index:', err);
        } else {
          console.log('✅ Crops field_id index created');
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

      // Show summary of associations
      setTimeout(() => {
        db.all(`
          SELECT 
            'crops' as table_name,
            COUNT(*) as total_records,
            COUNT(field_id) as with_field
          FROM crops
          UNION ALL
          SELECT 
            'applications' as table_name,
            COUNT(*) as total_records,
            COUNT(field_id) as with_field
          FROM applications
        `, (err, results) => {
          if (err) {
            console.error('❌ Error getting summary:', err);
          } else {
            console.log('\n📊 Migration Summary:');
            results.forEach(result => {
              console.log(`  ${result.table_name}: ${result.with_field}/${result.total_records} records have field associations`);
            });
          }
          
          db.close((err) => {
            if (err) {
              console.error('❌ Error closing database:', err);
            } else {
              console.log('\n✅ Field associations migration completed successfully!');
              console.log('🌾 All existing crops and applications are now associated with fields.');
            }
          });
        });
      }, 1000);
    });
  });
}); 