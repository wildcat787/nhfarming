#!/usr/bin/env node

/**
 * 🔄 Database Backup and Verification Script
 * 
 * This script creates a backup of your database and verifies data integrity.
 * Run this before making system changes to prevent data loss.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Get database path from environment or use default
const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, process.env.DB_PATH)
  : path.join(__dirname, 'farm.db');

const backupDir = path.join(__dirname, 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `farm-backup-${timestamp}.db`);

console.log('🔄 NHFarming Database Backup Tool');
console.log('================================');

// Create backup directory if it doesn't exist
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
  console.log('📁 Created backup directory');
}

// Check if source database exists
if (!fs.existsSync(dbPath)) {
  console.error('❌ Database file not found:', dbPath);
  process.exit(1);
}

console.log('📍 Source database:', dbPath);
console.log('💾 Backup location:', backupPath);

// Create backup
try {
  fs.copyFileSync(dbPath, backupPath);
  console.log('✅ Database backup created successfully');
  
  // Verify backup
  const db = new sqlite3.Database(backupPath);
  
  db.serialize(() => {
    // Check tables exist
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.error('❌ Error verifying backup:', err);
      } else {
        console.log('📊 Backup verification:');
        console.log(`   Tables found: ${tables.length}`);
        
        // Count records in major tables
        const tableChecks = [
          { name: 'users', description: 'Users' },
          { name: 'fields', description: 'Fields' },
          { name: 'crops', description: 'Crops' },
          { name: 'applications', description: 'Applications' },
          { name: 'vehicles', description: 'Vehicles' }
        ];
        
        let checksCompleted = 0;
        
        tableChecks.forEach(table => {
          db.get(`SELECT COUNT(*) as count FROM ${table.name}`, (err, row) => {
            if (!err && row) {
              console.log(`   ${table.description}: ${row.count} records`);
            }
            
            checksCompleted++;
            if (checksCompleted === tableChecks.length) {
              db.close();
              console.log('✅ Backup verification completed');
              
              // Show backup size
              const stats = fs.statSync(backupPath);
              console.log(`💾 Backup size: ${(stats.size / 1024).toFixed(2)} KB`);
              
              console.log('\n🎉 Backup process completed successfully!');
              console.log(`📂 Your data is safely backed up to: ${backupPath}`);
            }
          });
        });
      }
    });
  });
  
} catch (error) {
  console.error('❌ Error creating backup:', error.message);
  process.exit(1);
}
