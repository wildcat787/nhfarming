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
