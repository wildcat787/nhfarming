#!/bin/bash

# Database maintenance script
echo "🔧 Running database maintenance..."

cd "$(dirname "$0")"

# Run diagnostic
echo "Running diagnostic..."
node diagnose-db-errors.js

# Create backup
echo "Creating backup..."
node -e "
const { backupDatabase } = require('./database-utils');
backupDatabase('./backups/maintenance-backup-' + new Date().toISOString().replace(/[:.]/g, '-') + '.db');
"

# Clean up old backups (keep last 10)
echo "Cleaning up old backups..."
ls -t backups/farm-backup-*.db | tail -n +11 | xargs -r rm

echo "✅ Maintenance completed"
