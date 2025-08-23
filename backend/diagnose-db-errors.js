#!/usr/bin/env node

/**
 * 🔍 Database Error Diagnostic and Repair Script
 * 
 * This script identifies and fixes common database errors that cause
 * issues across multiple pages in the NHFarming application.
 */

const { 
  db, 
  dbQuery, 
  dbRun, 
  dbGet, 
  checkDatabaseHealth, 
  cleanupOrphanedRecords,
  backupDatabase 
} = require('./database-utils');
const path = require('path');
require('dotenv').config();

console.log('🔍 NHFarming Database Error Diagnostic');
console.log('=====================================');

async function diagnoseDatabaseErrors() {
  const issues = [];
  const fixes = [];
  
  try {
    // 1. Check database health
    console.log('\n📊 Checking database health...');
    const health = await checkDatabaseHealth();
    if (health.status === 'unhealthy') {
      issues.push(`Database health check failed: ${health.error}`);
    } else {
      console.log('✅ Database health check passed');
    }
    
    // 2. Check for missing tables
    console.log('\n📋 Checking for missing tables...');
    const requiredTables = [
      'users', 'farms', 'farm_users', 'fields', 'vehicles', 
      'crops', 'inputs', 'applications', 'tank_mixtures', 
      'tank_mixture_ingredients', 'maintenance', 'parts', 'reminders'
    ];
    
    for (const table of requiredTables) {
      const exists = await dbQuery(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        [table]
      );
      
      if (exists.length === 0) {
        issues.push(`Missing table: ${table}`);
        fixes.push(`CREATE TABLE ${table} - needs manual creation`);
      }
    }
    
    // 3. Check for orphaned records
    console.log('\n🔗 Checking for orphaned records...');
    
    // Check applications with non-existent crops
    const orphanedCropApplications = await dbQuery(`
      SELECT COUNT(*) as count FROM applications 
      WHERE crop_id IS NOT NULL 
      AND crop_id NOT IN (SELECT id FROM crops)
    `);
    
    if (orphanedCropApplications[0].count > 0) {
      issues.push(`${orphanedCropApplications[0].count} applications reference non-existent crops`);
      fixes.push(`Clean up ${orphanedCropApplications[0].count} orphaned crop applications`);
    }
    
    // Check applications with non-existent fields
    const orphanedFieldApplications = await dbQuery(`
      SELECT COUNT(*) as count FROM applications 
      WHERE field_id IS NOT NULL 
      AND field_id NOT IN (SELECT id FROM fields)
    `);
    
    if (orphanedFieldApplications[0].count > 0) {
      issues.push(`${orphanedFieldApplications[0].count} applications reference non-existent fields`);
      fixes.push(`Clean up ${orphanedFieldApplications[0].count} orphaned field applications`);
    }
    
    // Check applications with non-existent vehicles
    const orphanedVehicleApplications = await dbQuery(`
      SELECT COUNT(*) as count FROM applications 
      WHERE vehicle_id IS NOT NULL 
      AND vehicle_id NOT IN (SELECT id FROM vehicles)
    `);
    
    if (orphanedVehicleApplications[0].count > 0) {
      issues.push(`${orphanedVehicleApplications[0].count} applications reference non-existent vehicles`);
      fixes.push(`Clean up ${orphanedVehicleApplications[0].count} orphaned vehicle applications`);
    }
    
    // Check crops with non-existent fields
    const orphanedFieldCrops = await dbQuery(`
      SELECT COUNT(*) as count FROM crops 
      WHERE field_id IS NOT NULL 
      AND field_id NOT IN (SELECT id FROM fields)
    `);
    
    if (orphanedFieldCrops[0].count > 0) {
      issues.push(`${orphanedFieldCrops[0].count} crops reference non-existent fields`);
      fixes.push(`Clean up ${orphanedFieldCrops[0].count} orphaned field crops`);
    }
    
    // 4. Check for missing columns
    console.log('\n📝 Checking for missing columns...');
    
    // Check fields table for required columns
    const fieldsColumns = await dbQuery("PRAGMA table_info(fields)");
    const fieldsColumnNames = fieldsColumns.map(col => col.name);
    
    const requiredFieldsColumns = [
      'farm_id', 'coordinates', 'soil_type', 'irrigation_type', 
      'border_coordinates', 'created_at', 'updated_at'
    ];
    
    for (const column of requiredFieldsColumns) {
      if (!fieldsColumnNames.includes(column)) {
        issues.push(`Missing column in fields table: ${column}`);
        fixes.push(`ALTER TABLE fields ADD COLUMN ${column}`);
      }
    }
    
    // Check applications table for required columns
    const applicationsColumns = await dbQuery("PRAGMA table_info(applications)");
    const applicationsColumnNames = applicationsColumns.map(col => col.name);
    
    const requiredApplicationsColumns = [
      'created_at', 'updated_at', 'weather_wind_direction'
    ];
    
    for (const column of requiredApplicationsColumns) {
      if (!applicationsColumnNames.includes(column)) {
        issues.push(`Missing column in applications table: ${column}`);
        fixes.push(`ALTER TABLE applications ADD COLUMN ${column}`);
      }
    }
    
    // Check vehicles table for required columns
    const vehiclesColumns = await dbQuery("PRAGMA table_info(vehicles)");
    const vehiclesColumnNames = vehiclesColumns.map(col => col.name);
    
    const requiredVehiclesColumns = [
      'created_at', 'updated_at', 'service_due_date', 
      'insurance_expiry_date', 'registration_number', 'registration_expiry_date'
    ];
    
    for (const column of requiredVehiclesColumns) {
      if (!vehiclesColumnNames.includes(column)) {
        issues.push(`Missing column in vehicles table: ${column}`);
        fixes.push(`ALTER TABLE vehicles ADD COLUMN ${column}`);
      }
    }
    
    // Check crops table for required columns
    const cropsColumns = await dbQuery("PRAGMA table_info(crops)");
    const cropsColumnNames = cropsColumns.map(col => col.name);
    
    const requiredCropsColumns = [
      'season_year', 'expected_harvest_date', 'status', 'created_at', 'updated_at'
    ];
    
    for (const column of requiredCropsColumns) {
      if (!cropsColumnNames.includes(column)) {
        issues.push(`Missing column in crops table: ${column}`);
        fixes.push(`ALTER TABLE crops ADD COLUMN ${column}`);
      }
    }
    
    // 5. Check for data consistency issues
    console.log('\n🔍 Checking for data consistency issues...');
    
    // Check for fields without farm_id
    const fieldsWithoutFarm = await dbQuery(`
      SELECT COUNT(*) as count FROM fields WHERE farm_id IS NULL
    `);
    
    if (fieldsWithoutFarm[0].count > 0) {
      issues.push(`${fieldsWithoutFarm[0].count} fields have no farm_id assigned`);
      fixes.push(`Update ${fieldsWithoutFarm[0].count} fields to assign farm_id`);
    }
    
    // Check for crops without field_id
    const cropsWithoutField = await dbQuery(`
      SELECT COUNT(*) as count FROM crops WHERE field_id IS NULL
    `);
    
    if (cropsWithoutField[0].count > 0) {
      issues.push(`${cropsWithoutField[0].count} crops have no field_id assigned`);
      fixes.push(`Update ${cropsWithoutField[0].count} crops to assign field_id`);
    }
    
    // 6. Check for foreign key constraint violations
    console.log('\n🔒 Checking foreign key constraints...');
    
    try {
      await dbRun('PRAGMA foreign_key_check');
      console.log('✅ No foreign key constraint violations found');
    } catch (error) {
      issues.push(`Foreign key constraint violations: ${error.message}`);
      fixes.push('Run PRAGMA foreign_key_check to identify specific violations');
    }
    
    // 7. Check for duplicate records
    console.log('\n🔄 Checking for duplicate records...');
    
    // Check for duplicate field names within farms
    const duplicateFields = await dbQuery(`
      SELECT farm_id, name, COUNT(*) as count 
      FROM fields 
      GROUP BY farm_id, name 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateFields.length > 0) {
      issues.push(`${duplicateFields.length} farms have duplicate field names`);
      fixes.push('Review and resolve duplicate field names');
    }
    
    // Check for duplicate vehicle names per user
    const duplicateVehicles = await dbQuery(`
      SELECT user_id, name, COUNT(*) as count 
      FROM vehicles 
      GROUP BY user_id, name 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateVehicles.length > 0) {
      issues.push(`${duplicateVehicles.length} users have duplicate vehicle names`);
      fixes.push('Review and resolve duplicate vehicle names');
    }
    
    // 8. Generate report
    console.log('\n📋 DIAGNOSTIC REPORT');
    console.log('===================');
    
    if (issues.length === 0) {
      console.log('✅ No database issues found!');
    } else {
      console.log(`❌ Found ${issues.length} issues:`);
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
      
      console.log('\n🔧 RECOMMENDED FIXES:');
      console.log('====================');
      fixes.forEach((fix, index) => {
        console.log(`${index + 1}. ${fix}`);
      });
      
      // 9. Offer to apply fixes
      console.log('\n🛠️  AUTOMATIC FIXES');
      console.log('==================');
      
      // Apply safe fixes automatically
      if (orphanedCropApplications[0].count > 0 || 
          orphanedFieldApplications[0].count > 0 || 
          orphanedVehicleApplications[0].count > 0) {
        
        console.log('🧹 Cleaning up orphaned records...');
        const cleanupResult = await cleanupOrphanedRecords();
        if (cleanupResult.success) {
          console.log('✅ Orphaned records cleaned up successfully');
          cleanupResult.results.forEach(result => console.log(`   - ${result}`));
        } else {
          console.log('❌ Failed to clean up orphaned records:', cleanupResult.error);
        }
      }
      
      // Add missing columns
      console.log('\n📝 Adding missing columns...');
      
      for (const column of requiredFieldsColumns) {
        if (!fieldsColumnNames.includes(column)) {
          try {
            await dbRun(`ALTER TABLE fields ADD COLUMN ${column}`);
            console.log(`✅ Added ${column} to fields table`);
          } catch (error) {
            console.log(`❌ Failed to add ${column} to fields table:`, error.message);
          }
        }
      }
      
      for (const column of requiredApplicationsColumns) {
        if (!applicationsColumnNames.includes(column)) {
          try {
            await dbRun(`ALTER TABLE applications ADD COLUMN ${column}`);
            console.log(`✅ Added ${column} to applications table`);
          } catch (error) {
            console.log(`❌ Failed to add ${column} to applications table:`, error.message);
          }
        }
      }
      
      for (const column of requiredVehiclesColumns) {
        if (!vehiclesColumnNames.includes(column)) {
          try {
            await dbRun(`ALTER TABLE vehicles ADD COLUMN ${column}`);
            console.log(`✅ Added ${column} to vehicles table`);
          } catch (error) {
            console.log(`❌ Failed to add ${column} to vehicles table:`, error.message);
          }
        }
      }
      
      for (const column of requiredCropsColumns) {
        if (!cropsColumnNames.includes(column)) {
          try {
            await dbRun(`ALTER TABLE crops ADD COLUMN ${column}`);
            console.log(`✅ Added ${column} to crops table`);
          } catch (error) {
            console.log(`❌ Failed to add ${column} to crops table:`, error.message);
          }
        }
      }
      
      // Update fields without farm_id
      if (fieldsWithoutFarm[0].count > 0) {
        console.log('\n🏠 Assigning farm_id to fields...');
        try {
          // Get the first farm or create one
          let farm = await dbGet('SELECT id FROM farms LIMIT 1');
          if (!farm) {
            const result = await dbRun(
              'INSERT INTO farms (name, location) VALUES (?, ?)',
              ['Default Farm', 'Default Location']
            );
            farm = { id: result.lastID };
          }
          
          await dbRun('UPDATE fields SET farm_id = ? WHERE farm_id IS NULL', [farm.id]);
          console.log(`✅ Assigned farm_id to ${fieldsWithoutFarm[0].count} fields`);
        } catch (error) {
          console.log('❌ Failed to assign farm_id to fields:', error.message);
        }
      }
    }
    
    // 10. Create backup
    console.log('\n💾 Creating database backup...');
    const backupPath = path.join(__dirname, 'backups', `farm-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
    const backupResult = await backupDatabase(backupPath);
    
    if (backupResult.success) {
      console.log('✅ Database backup created successfully');
      console.log(`   Location: ${backupPath}`);
    } else {
      console.log('❌ Failed to create backup:', backupResult.error);
    }
    
    console.log('\n🎉 Database diagnostic complete!');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  } finally {
    db.close();
  }
}

// Run the diagnostic
diagnoseDatabaseErrors();
