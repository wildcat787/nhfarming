# 🗄️ Database Persistence Guide

## Problem Fixed
Your database was not persisting data after system changes due to multiple database files and inconsistent configuration.

## What Was Wrong
1. **Multiple Database Files**: Two `farm.db` files existed:
   - `/Users/user/Documents/NHFarming/backend/farm.db` (52KB with schema)
   - `/Users/user/Documents/farm.db` (0KB empty - REMOVED)

2. **Hardcoded Database Path**: The `db.js` file was not using environment variables
3. **Missing DB_PATH Configuration**: Environment file lacked proper database path settings

## What Was Fixed

### 1. Database Configuration (`db.js`)
- ✅ Added support for `DB_PATH` environment variable
- ✅ Added proper error handling for database connections
- ✅ Added automatic directory creation for database path
- ✅ Added logging to show which database file is being used

### 2. Environment Configuration (`.env`)
- ✅ Added `DB_PATH=./farm.db` to ensure consistent database location
- ✅ Organized environment variables properly

### 3. Safety Measures
- ✅ Created `backup-db.js` script for regular backups
- ✅ Removed conflicting empty database file

## Current Status
- ✅ Database path: `/Users/user/Documents/NHFarming/backend/farm.db`
- ✅ All tables exist (10 tables created)
- ⚠️ No user data currently (0 users, 0 records in main tables)

## How to Prevent Future Data Loss

### 1. Regular Backups
Run this before making system changes:
```bash
cd backend
node backup-db.js
```

### 2. Check Database Status
Verify your database location:
```bash
cd backend
node -e "require('./db.js'); setTimeout(() => process.exit(0), 1000);"
```

### 3. Environment File
Never delete or modify the `DB_PATH` setting in `.env`:
```
DB_PATH=./farm.db
```

### 4. Database Location
Your database is always located at:
```
/Users/user/Documents/NHFarming/backend/farm.db
```

## Next Steps
1. Register a new user to populate the database
2. Add your farms, fields, and other data
3. Run `node backup-db.js` regularly to backup your data
4. Never run database initialization scripts on existing data

## Troubleshooting

### If Data Disappears Again
1. Check if multiple database files exist:
   ```bash
   find /Users/user/Documents -name "farm.db" 2>/dev/null
   ```

2. Verify the database path in logs when starting the application

3. Check backups folder:
   ```bash
   ls -la backend/backups/
   ```

4. Restore from backup if needed:
   ```bash
   cp backend/backups/farm-backup-[latest].db backend/farm.db
   ```

## Database Schema
Your database includes these tables:
- `users` - User accounts and authentication
- `fields` - Farm field definitions
- `crops` - Crop records
- `applications` - Application records
- `vehicles` - Vehicle management
- `inputs` - Input materials
- `tank_mixtures` - Tank mixture recipes
- `tank_mixture_ingredients` - Mixture components
- `maintenance` - Vehicle maintenance
- `parts` - Maintenance parts

The database is now properly configured and should persist data between system changes.
