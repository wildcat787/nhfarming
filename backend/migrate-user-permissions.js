const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'farm.db');
const db = new sqlite3.Database(dbPath);

console.log('👤 Migrating user permissions and tracking...');

db.serialize(() => {
  // Step 1: Check if applications table has user_id column
  db.get("PRAGMA table_info(applications)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking applications table:', err);
      return;
    }
    
    // Check if user_id column exists
    db.all("PRAGMA table_info(applications)", (err, columns) => {
      if (err) {
        console.error('❌ Error getting table info:', err);
        return;
      }
      
      const hasUserId = columns.some(col => col.name === 'user_id');
      const hasCreatedBy = columns.some(col => col.name === 'created_by');
      
      console.log(`📋 Applications table columns: ${columns.map(c => c.name).join(', ')}`);
      
      // Step 2: Add created_by column if it doesn't exist
      if (!hasCreatedBy) {
        db.run(`
          ALTER TABLE applications ADD COLUMN created_by INTEGER
        `, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.error('❌ Error adding created_by column:', err);
            return;
          }
          console.log('✅ Added created_by column to applications');
        });
      } else {
        console.log('✅ created_by column already exists');
      }
      
                // Step 3: Update existing applications to set created_by to user_id
          setTimeout(() => {
            if (hasUserId) {
              db.run(`
                UPDATE applications 
                SET created_by = user_id 
                WHERE created_by IS NULL
              `, function (err) {
                if (err) {
                  console.error('❌ Error updating created_by:', err);
                } else {
                  console.log(`✅ Updated ${this.changes} applications with created_by`);
                }
              });
            } else {
              // If no user_id column, set created_by to first user (admin)
              db.get('SELECT id FROM users ORDER BY id LIMIT 1', (err, user) => {
                if (err) {
                  console.error('❌ Error getting first user:', err);
                  return;
                }
                
                if (user) {
                  db.run(`
                    UPDATE applications 
                    SET created_by = ? 
                    WHERE created_by IS NULL
                  `, [user.id], function (err) {
                    if (err) {
                      console.error('❌ Error setting created_by to first user:', err);
                    } else {
                      console.log(`✅ Set created_by to user ${user.id} for ${this.changes} applications`);
                    }
                  });
                }
              });
            }
          }, 500);
      
                // Step 4: Add indexes for better performance
          setTimeout(() => {
            db.run(`
              CREATE INDEX IF NOT EXISTS idx_applications_created_by ON applications(created_by)
            `, (err) => {
              if (err) {
                console.error('❌ Error creating created_by index:', err);
              } else {
                console.log('✅ Created created_by index');
              }
            });
          }, 1000);
      
      // Step 5: Show summary
      setTimeout(() => {
        db.all(`
          SELECT 
            'applications' as table_name,
            COUNT(*) as total_records,
            COUNT(created_by) as with_creator
          FROM applications
        `, (err, results) => {
          if (err) {
            console.error('❌ Error getting summary:', err);
          } else {
            console.log('\n📊 Migration Summary:');
            results.forEach(result => {
              console.log(`  ${result.table_name}: ${result.with_creator}/${result.total_records} records have creator`);
            });
          }
          
          // Show user distribution
          db.all(`
            SELECT 
              u.username,
              COUNT(a.id) as application_count
            FROM users u
            LEFT JOIN applications a ON u.id = a.created_by
            GROUP BY u.id, u.username
            ORDER BY application_count DESC
          `, (err, userStats) => {
            if (err) {
              console.error('❌ Error getting user stats:', err);
            } else {
              console.log('\n👥 User Application Distribution:');
              userStats.forEach(stat => {
                console.log(`  ${stat.username}: ${stat.application_count} applications`);
              });
            }
            
            db.close((err) => {
              if (err) {
                console.error('❌ Error closing database:', err);
              } else {
                console.log('\n✅ User permissions migration completed successfully!');
                console.log('👤 All applications now track their original creator.');
              }
            });
          });
        });
      }, 1000);
    });
  });
}); 