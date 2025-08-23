const { db, dbQuery, dbRun, dbGet } = require('./db');

// Enhanced error handling for database operations
const handleDatabaseError = (error, operation = 'Database operation') => {
  console.error(`${operation} failed:`, error);
  
  // Provide more specific error messages based on error type
  if (error.message.includes('UNIQUE constraint failed')) {
    return { error: 'A record with this information already exists' };
  }
  
  if (error.message.includes('FOREIGN KEY constraint failed')) {
    return { error: 'Referenced record does not exist' };
  }
  
  if (error.message.includes('NOT NULL constraint failed')) {
    return { error: 'Required field is missing' };
  }
  
  if (error.message.includes('no such table')) {
    return { error: 'Database table not found - please contact support' };
  }
  
  return { error: 'Database operation failed - please try again' };
};

// Safe database query wrapper
const safeQuery = async (query, params = [], operation = 'Query') => {
  try {
    return await dbQuery(query, params);
  } catch (error) {
    throw handleDatabaseError(error, operation);
  }
};

// Safe database run wrapper
const safeRun = async (query, params = [], operation = 'Update') => {
  try {
    return await dbRun(query, params);
  } catch (error) {
    throw handleDatabaseError(error, operation);
  }
};

// Safe database get wrapper
const safeGet = async (query, params = [], operation = 'Get') => {
  try {
    return await dbGet(query, params);
  } catch (error) {
    throw handleDatabaseError(error, operation);
  }
};

// Check if table exists
const tableExists = async (tableName) => {
  try {
    const result = await dbQuery(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [tableName]
    );
    return result.length > 0;
  } catch (error) {
    console.error('Error checking table existence:', error);
    return false;
  }
};

// Get table schema
const getTableSchema = async (tableName) => {
  try {
    return await dbQuery(`PRAGMA table_info(${tableName})`);
  } catch (error) {
    console.error('Error getting table schema:', error);
    return [];
  }
};

// Validate foreign key relationships
const validateForeignKey = async (tableName, columnName, referencedTable, referencedColumn, value) => {
  if (!value) return true; // Allow null values
  
  try {
    const result = await dbGet(
      `SELECT COUNT(*) as count FROM ${referencedTable} WHERE ${referencedColumn} = ?`,
      [value]
    );
    return result.count > 0;
  } catch (error) {
    console.error('Error validating foreign key:', error);
    return false;
  }
};

// Database health check
const checkDatabaseHealth = async () => {
  try {
    // Check if database is accessible
    await dbQuery('SELECT 1');
    
    // Check integrity
    const integrityResult = await dbQuery('PRAGMA integrity_check');
    if (integrityResult[0]?.integrity_check !== 'ok') {
      throw new Error('Database integrity check failed');
    }
    
    // Check foreign key constraints
    await dbQuery('PRAGMA foreign_key_check');
    
    return { status: 'healthy', message: 'Database is functioning normally' };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: 'Database health check failed',
      error: error.message 
    };
  }
};

// Backup database
const backupDatabase = async (backupPath) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Create backup directory if it doesn't exist
    const backupDir = path.dirname(backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Create backup
    await dbRun(`VACUUM INTO '${backupPath}'`);
    
    return { success: true, message: 'Database backup created successfully' };
  } catch (error) {
    console.error('Backup failed:', error);
    return { success: false, message: 'Database backup failed', error: error.message };
  }
};

// Clean up orphaned records
const cleanupOrphanedRecords = async () => {
  const cleanupResults = [];
  
  try {
    // Clean up applications with non-existent crops
    const orphanedApplications = await dbQuery(`
      DELETE FROM applications 
      WHERE crop_id IS NOT NULL 
      AND crop_id NOT IN (SELECT id FROM crops)
    `);
    cleanupResults.push(`Cleaned up ${orphanedApplications.length} orphaned applications`);
    
    // Clean up applications with non-existent fields
    const orphanedFieldApplications = await dbQuery(`
      DELETE FROM applications 
      WHERE field_id IS NOT NULL 
      AND field_id NOT IN (SELECT id FROM fields)
    `);
    cleanupResults.push(`Cleaned up ${orphanedFieldApplications.length} orphaned field applications`);
    
    // Clean up applications with non-existent vehicles
    const orphanedVehicleApplications = await dbQuery(`
      DELETE FROM applications 
      WHERE vehicle_id IS NOT NULL 
      AND vehicle_id NOT IN (SELECT id FROM vehicles)
    `);
    cleanupResults.push(`Cleaned up ${orphanedVehicleApplications.length} orphaned vehicle applications`);
    
    return { success: true, results: cleanupResults };
  } catch (error) {
    console.error('Cleanup failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  db,
  dbQuery,
  dbRun,
  dbGet,
  handleDatabaseError,
  safeQuery,
  safeRun,
  safeGet,
  tableExists,
  getTableSchema,
  validateForeignKey,
  checkDatabaseHealth,
  backupDatabase,
  cleanupOrphanedRecords
};
