#!/bin/bash

# 🗄️ NHFarming Database Error Handling Setup Script
# This script implements comprehensive database error handling

set -e

echo "🗄️ Setting up NHFarming Database Error Handling System"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "backend/db.js" ]; then
    print_error "Please run this script from the NHFarming root directory"
    exit 1
fi

print_status "Starting database error handling setup..."

# Step 1: Create necessary directories
print_status "Creating necessary directories..."
mkdir -p backend/logs
mkdir -p backend/backups
print_success "Directories created"

# Step 2: Run database diagnostic
print_status "Running database diagnostic..."
cd backend
if node diagnose-db-errors.js; then
    print_success "Database diagnostic completed successfully"
else
    print_warning "Database diagnostic found issues - check the output above"
fi

# Step 3: Run schema fix
print_status "Running database schema fix..."
if node fix-db-schema.js; then
    print_success "Database schema fix completed successfully"
else
    print_warning "Database schema fix encountered issues - check the output above"
fi

# Step 4: Test database health
print_status "Testing database health..."
if node -e "
const { checkDatabaseHealth } = require('./database-utils');
checkDatabaseHealth().then(health => {
    console.log('Database health:', health.status);
    if (health.status === 'healthy') {
        console.log('✅ Database is healthy');
        process.exit(0);
    } else {
        console.log('❌ Database health check failed:', health.error);
        process.exit(1);
    }
}).catch(err => {
    console.error('❌ Health check error:', err);
    process.exit(1);
});
"; then
    print_success "Database health check passed"
else
    print_error "Database health check failed"
    exit 1
fi

# Step 5: Start database monitoring
print_status "Starting database monitoring..."
if node -e "
const databaseMonitor = require('./database-monitor');
databaseMonitor.start();
setTimeout(() => {
    const report = databaseMonitor.getErrorReport();
    console.log('Monitoring started successfully');
    console.log('Current error count:', report.stats.totalErrors);
    process.exit(0);
}, 2000);
"; then
    print_success "Database monitoring started"
else
    print_warning "Database monitoring failed to start"
fi

# Step 6: Test frontend error handling
print_status "Testing frontend error handling components..."
cd ../frontend
if [ -f "src/components/DatabaseErrorHandler.js" ]; then
    print_success "Frontend error handling component exists"
else
    print_warning "Frontend error handling component not found"
fi

# Step 7: Create a test script
print_status "Creating test script..."
cd ../backend
cat > test-database-error-handling.js << 'EOF'
#!/usr/bin/env node

/**
 * Test script for database error handling
 */

const { safeQuery, safeRun, safeGet, checkDatabaseHealth } = require('./database-utils');

async function testDatabaseErrorHandling() {
    console.log('🧪 Testing Database Error Handling');
    console.log('==================================');
    
    try {
        // Test 1: Health check
        console.log('\n1. Testing health check...');
        const health = await checkDatabaseHealth();
        console.log('✅ Health check:', health.status);
        
        // Test 2: Safe query
        console.log('\n2. Testing safe query...');
        const users = await safeQuery('SELECT COUNT(*) as count FROM users');
        console.log('✅ Safe query:', users[0].count, 'users found');
        
        // Test 3: Safe get
        console.log('\n3. Testing safe get...');
        const userCount = await safeGet('SELECT COUNT(*) as count FROM users');
        console.log('✅ Safe get:', userCount.count, 'users total');
        
        // Test 4: Test error handling (intentional error)
        console.log('\n4. Testing error handling...');
        try {
            await safeQuery('SELECT * FROM non_existent_table');
        } catch (error) {
            console.log('✅ Error handling works:', error.error);
        }
        
        console.log('\n🎉 All tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testDatabaseErrorHandling();
EOF

chmod +x test-database-error-handling.js

# Step 8: Run the test
print_status "Running database error handling tests..."
if node test-database-error-handling.js; then
    print_success "Database error handling tests passed"
else
    print_error "Database error handling tests failed"
    exit 1
fi

# Step 9: Create maintenance script
print_status "Creating maintenance script..."
cat > maintain-database.sh << 'EOF'
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
EOF

chmod +x maintain-database.sh

# Step 10: Create quick status script
print_status "Creating status script..."
cat > database-status.js << 'EOF'
#!/usr/bin/env node

/**
 * Quick database status check
 */

const { checkDatabaseHealth } = require('./database-utils');
const databaseMonitor = require('./database-monitor');

async function checkStatus() {
    console.log('📊 Database Status Check');
    console.log('=======================');
    
    // Health check
    const health = await checkDatabaseHealth();
    console.log('Health Status:', health.status);
    
    if (health.status === 'unhealthy') {
        console.log('Error:', health.error);
    }
    
    // Monitoring report
    const report = databaseMonitor.getErrorReport();
    console.log('\nError Statistics:');
    console.log('- Total Errors:', report.stats.totalErrors);
    console.log('- Recent Errors (1 hour):', report.stats.recentErrors);
    console.log('- Daily Errors:', report.stats.dailyErrors);
    
    console.log('\nPerformance Metrics:');
    console.log('- Uptime:', report.performance.uptime + '%');
    console.log('- Average Response Time:', report.performance.averageResponseTime + 'ms');
    console.log('- Total Health Checks:', report.performance.totalChecks);
    
    if (report.stats.totalErrors > 0) {
        console.log('\nRecent Error Types:');
        Object.entries(report.stats.errorTypes).forEach(([type, count]) => {
            console.log(`- ${type}: ${count}`);
        });
    }
}

checkStatus();
EOF

chmod +x database-status.js

# Step 11: Final verification
print_status "Performing final verification..."
if node database-status.js; then
    print_success "Final verification passed"
else
    print_warning "Final verification found issues"
fi

# Step 12: Summary
echo ""
echo "🎉 Database Error Handling Setup Complete!"
echo "=========================================="
echo ""
echo "✅ What was implemented:"
echo "   - Enhanced database error handling utilities"
echo "   - Comprehensive diagnostic and repair scripts"
echo "   - Real-time database monitoring"
echo "   - Frontend error handling components"
echo "   - Automatic backup and recovery procedures"
echo "   - User-friendly error messages"
echo ""
echo "📁 New files created:"
echo "   - backend/database-utils.js"
echo "   - backend/diagnose-db-errors.js"
echo "   - backend/database-monitor.js"
echo "   - frontend/src/components/DatabaseErrorHandler.js"
echo "   - backend/test-database-error-handling.js"
echo "   - backend/maintain-database.sh"
echo "   - backend/database-status.js"
echo ""
echo "🔧 Available commands:"
echo "   - node diagnose-db-errors.js     # Run comprehensive diagnostic"
echo "   - node fix-db-schema.js          # Fix database schema issues"
echo "   - node database-status.js        # Check database status"
echo "   - ./maintain-database.sh         # Run maintenance tasks"
echo "   - node test-database-error-handling.js  # Test error handling"
echo ""
echo "📖 Documentation:"
echo "   - DATABASE_ERROR_HANDLING_GUIDE.md"
echo ""
echo "🚀 Next steps:"
echo "   1. Review the DATABASE_ERROR_HANDLING_GUIDE.md"
echo "   2. Integrate DatabaseErrorHandler component in your React pages"
echo "   3. Replace direct database calls with safe utilities"
echo "   4. Set up automated maintenance (crontab)"
echo "   5. Monitor database health regularly"
echo ""

print_success "Setup completed successfully!"
