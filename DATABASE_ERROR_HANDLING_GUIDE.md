# 🗄️ Database Error Handling Guide

This guide explains the comprehensive database error handling system implemented in NHFarming to prevent and resolve database errors across multiple pages.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Common Database Errors](#common-database-errors)
3. [Error Handling System](#error-handling-system)
4. [Diagnostic Tools](#diagnostic-tools)
5. [Troubleshooting Guide](#troubleshooting-guide)
6. [Prevention Strategies](#prevention-strategies)
7. [Monitoring and Reporting](#monitoring-and-reporting)

## 🎯 Overview

The NHFarming application uses SQLite as its database and has been experiencing database errors across multiple pages. This guide provides a comprehensive solution for identifying, preventing, and resolving these issues.

### Key Features

- **Enhanced Error Handling**: Specific error messages for different database issues
- **Automatic Diagnostics**: Tools to identify and fix common problems
- **Real-time Monitoring**: Continuous database health monitoring
- **User-friendly Error Display**: Clear error messages for end users
- **Backup and Recovery**: Automatic backup and recovery procedures

## 🚨 Common Database Errors

### 1. Schema Issues
- **Missing Tables**: Required tables don't exist
- **Missing Columns**: Required columns are missing from tables
- **Foreign Key Violations**: Referenced records don't exist

### 2. Data Integrity Issues
- **Orphaned Records**: Records referencing non-existent parent records
- **Duplicate Records**: Multiple records with the same unique constraints
- **Null Constraint Violations**: Required fields are empty

### 3. Connection Issues
- **Database Lock**: Multiple processes trying to access the database
- **File Permissions**: Insufficient permissions to access database file
- **Disk Space**: Insufficient disk space for database operations

### 4. Performance Issues
- **Slow Queries**: Queries taking too long to execute
- **Memory Issues**: Database consuming too much memory
- **Index Problems**: Missing or inefficient indexes

## 🛠️ Error Handling System

### Backend Error Handling

#### Enhanced Database Utilities (`database-utils.js`)

```javascript
const { safeQuery, safeRun, safeGet, handleDatabaseError } = require('./database-utils');

// Safe database operations with automatic error handling
try {
  const users = await safeQuery('SELECT * FROM users WHERE role = ?', ['admin']);
  const result = await safeRun('INSERT INTO users (username, email) VALUES (?, ?)', ['john', 'john@example.com']);
  const user = await safeGet('SELECT * FROM users WHERE id = ?', [1]);
} catch (error) {
  // Error is automatically handled and logged
  console.error('Database operation failed:', error);
}
```

#### Error Types and Messages

| Error Type | Message | Solution |
|------------|---------|----------|
| UNIQUE constraint failed | "A record with this information already exists" | Use a different name/identifier |
| FOREIGN KEY constraint failed | "Referenced record does not exist" | Refresh the page or check data integrity |
| NOT NULL constraint failed | "Required field is missing" | Fill in all required fields |
| no such table | "Database table not found - please contact support" | Run database schema fix |
| Network error | "Network connection issue - please check your internet connection" | Check network connectivity |

### Frontend Error Handling

#### Database Error Handler Component

```javascript
import DatabaseErrorHandler, { useDatabaseError } from './components/DatabaseErrorHandler';

function MyComponent() {
  const { error, isLoading, executeWithErrorHandling } = useDatabaseError();

  const handleSave = async () => {
    await executeWithErrorHandling(async () => {
      // Your database operation here
      await apiRequest('/api/fields', { method: 'POST', body: data });
    });
  };

  return (
    <div>
      <DatabaseErrorHandler 
        error={error} 
        onRetry={handleSave}
        showDetails={process.env.NODE_ENV === 'development'}
      />
      {/* Your component content */}
    </div>
  );
}
```

## 🔍 Diagnostic Tools

### 1. Database Diagnostic Script

Run the comprehensive diagnostic script to identify and fix issues:

```bash
cd backend
node diagnose-db-errors.js
```

This script will:
- Check database health
- Identify missing tables and columns
- Find orphaned records
- Check foreign key constraints
- Detect duplicate records
- Apply automatic fixes where safe
- Create a backup before making changes

### 2. Database Schema Fix Script

Fix database schema issues:

```bash
cd backend
node fix-db-schema.js
```

This script adds missing columns and tables to ensure database compatibility.

### 3. Database Health Check

Check database health programmatically:

```javascript
const { checkDatabaseHealth } = require('./database-utils');

const health = await checkDatabaseHealth();
if (health.status === 'unhealthy') {
  console.error('Database issues found:', health.error);
}
```

## 🔧 Troubleshooting Guide

### Step 1: Identify the Error

1. **Check the browser console** for JavaScript errors
2. **Check the server logs** for backend errors
3. **Use the diagnostic script** to identify database issues
4. **Check the error handler component** for user-friendly error messages

### Step 2: Common Solutions

#### Missing Tables or Columns

```bash
# Run the schema fix script
node fix-db-schema.js

# Or run the diagnostic script
node diagnose-db-errors.js
```

#### Orphaned Records

```bash
# Clean up orphaned records
node diagnose-db-errors.js
```

#### Database Lock Issues

```bash
# Stop all applications accessing the database
# Check for running processes
ps aux | grep node

# Kill processes if necessary
kill -9 <process_id>
```

#### Permission Issues

```bash
# Check file permissions
ls -la farm.db

# Fix permissions if needed
chmod 644 farm.db
chown <user>:<group> farm.db
```

### Step 3: Advanced Troubleshooting

#### Database Corruption

```bash
# Check database integrity
sqlite3 farm.db "PRAGMA integrity_check;"

# If corruption is found, restore from backup
cp backups/farm-backup-*.db farm.db
```

#### Performance Issues

```bash
# Analyze database performance
sqlite3 farm.db "ANALYZE;"

# Check query performance
sqlite3 farm.db "EXPLAIN QUERY PLAN SELECT * FROM users;"
```

## 🛡️ Prevention Strategies

### 1. Regular Maintenance

```bash
# Set up automated maintenance
# Add to crontab for daily execution
0 2 * * * cd /path/to/nhfarming/backend && node diagnose-db-errors.js
```

### 2. Monitoring

Enable database monitoring in production:

```javascript
// The monitoring starts automatically in production
// Check monitoring status
const databaseMonitor = require('./database-monitor');
const report = databaseMonitor.getErrorReport();
console.log('Database health:', report);
```

### 3. Backup Strategy

```bash
# Create regular backups
node -e "
const { backupDatabase } = require('./database-utils');
backupDatabase('./backups/daily-backup.db');
"
```

### 4. Code Quality

- Always use the safe database utilities (`safeQuery`, `safeRun`, `safeGet`)
- Implement proper error handling in all database operations
- Use transactions for complex operations
- Validate data before database operations

## 📊 Monitoring and Reporting

### Real-time Monitoring

The database monitor provides real-time insights:

```javascript
const databaseMonitor = require('./database-monitor');

// Get current status
const report = databaseMonitor.getErrorReport();
console.log('Error count:', report.stats.totalErrors);
console.log('Uptime:', report.performance.uptime + '%');
```

### Error Logs

Error logs are stored in:
- **File**: `backend/logs/database-errors.log`
- **Memory**: Last 1000 errors kept in memory
- **Export**: JSON format for analysis

### Performance Metrics

- **Response Time**: Average database query response time
- **Uptime**: Percentage of successful health checks
- **Error Rate**: Number of errors per time period
- **Error Types**: Breakdown of different error categories

## 🚀 Quick Fix Commands

### Emergency Database Recovery

```bash
# 1. Stop the application
pkill -f "node.*index.js"

# 2. Create backup
cp farm.db farm.db.backup.$(date +%Y%m%d_%H%M%S)

# 3. Run diagnostic and fix
node diagnose-db-errors.js

# 4. Restart application
npm start
```

### Reset Database (Development Only)

```bash
# WARNING: This will delete all data
rm farm.db
node init-db-with-data.js
```

### Check Database Status

```bash
# Quick health check
sqlite3 farm.db "PRAGMA integrity_check;"

# Check table structure
sqlite3 farm.db ".schema"

# Check data counts
sqlite3 farm.db "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'fields', COUNT(*) FROM fields UNION ALL SELECT 'crops', COUNT(*) FROM crops;"
```

## 📞 Support

If you encounter persistent database issues:

1. **Run the diagnostic script** and save the output
2. **Export the error log**: `node -e "require('./database-monitor').exportErrorLog()"`
3. **Create a backup**: `cp farm.db backup-$(date +%Y%m%d_%H%M%S).db`
4. **Contact support** with the diagnostic output and error logs

## 📝 Best Practices

1. **Always use transactions** for multi-step operations
2. **Validate data** before database operations
3. **Use prepared statements** to prevent SQL injection
4. **Implement proper error handling** in all database calls
5. **Monitor database performance** regularly
6. **Keep regular backups** of the database
7. **Test database operations** in development before production
8. **Use the provided error handling utilities** instead of raw database calls

---

This comprehensive error handling system should resolve the database errors you're experiencing across multiple pages. The diagnostic tools will help identify specific issues, and the enhanced error handling will provide better user experience when errors do occur.
