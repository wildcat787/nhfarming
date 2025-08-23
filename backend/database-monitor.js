const { db, dbQuery, dbRun, dbGet, checkDatabaseHealth } = require('./database-utils');
const fs = require('fs');
const path = require('path');

class DatabaseMonitor {
  constructor() {
    this.errorLog = [];
    this.performanceMetrics = [];
    this.isMonitoring = false;
    this.monitorInterval = null;
    this.logFile = path.join(__dirname, 'logs', 'database-errors.log');
    
    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  // Start monitoring
  start() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('🔍 Starting database monitoring...');
    
    // Monitor every 30 seconds
    this.monitorInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);
    
    // Initial health check
    this.performHealthCheck();
  }

  // Stop monitoring
  stop() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    console.log('🛑 Database monitoring stopped');
  }

  // Perform health check
  async performHealthCheck() {
    try {
      const startTime = Date.now();
      const health = await checkDatabaseHealth();
      const duration = Date.now() - startTime;
      
      const metric = {
        timestamp: new Date().toISOString(),
        status: health.status,
        duration,
        error: health.error || null
      };
      
      this.performanceMetrics.push(metric);
      
      // Keep only last 1000 metrics
      if (this.performanceMetrics.length > 1000) {
        this.performanceMetrics = this.performanceMetrics.slice(-1000);
      }
      
      if (health.status === 'unhealthy') {
        this.logError('Database health check failed', health.error);
      }
      
      return health;
    } catch (error) {
      this.logError('Health check failed', error.message);
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Log database error
  logError(operation, error, details = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      operation,
      error: error.message || error,
      details,
      stack: error.stack
    };
    
    this.errorLog.push(errorEntry);
    
    // Keep only last 1000 errors
    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-1000);
    }
    
    // Write to log file
    const logEntry = `[${errorEntry.timestamp}] ${operation}: ${errorEntry.error}\n`;
    fs.appendFileSync(this.logFile, logEntry);
    
    console.error('🚨 Database Error:', errorEntry);
  }

  // Get error statistics
  getErrorStats() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentErrors = this.errorLog.filter(error => 
      new Date(error.timestamp) > oneHourAgo
    );
    
    const dailyErrors = this.errorLog.filter(error => 
      new Date(error.timestamp) > oneDayAgo
    );
    
    const errorTypes = {};
    this.errorLog.forEach(error => {
      const type = error.operation || 'Unknown';
      errorTypes[type] = (errorTypes[type] || 0) + 1;
    });
    
    return {
      totalErrors: this.errorLog.length,
      recentErrors: recentErrors.length,
      dailyErrors: dailyErrors.length,
      errorTypes,
      lastError: this.errorLog[this.errorLog.length - 1] || null
    };
  }

  // Get performance metrics
  getPerformanceMetrics() {
    if (this.performanceMetrics.length === 0) {
      return { averageResponseTime: 0, uptime: 0, totalChecks: 0 };
    }
    
    const recentMetrics = this.performanceMetrics.slice(-100);
    const averageResponseTime = recentMetrics.reduce((sum, metric) => 
      sum + metric.duration, 0) / recentMetrics.length;
    
    const healthyChecks = this.performanceMetrics.filter(metric => 
      metric.status === 'healthy'
    ).length;
    
    const uptime = (healthyChecks / this.performanceMetrics.length) * 100;
    
    return {
      averageResponseTime: Math.round(averageResponseTime),
      uptime: Math.round(uptime * 100) / 100,
      totalChecks: this.performanceMetrics.length,
      recentMetrics: recentMetrics.slice(-10)
    };
  }

  // Get detailed error report
  getErrorReport() {
    return {
      errors: this.errorLog.slice(-50), // Last 50 errors
      stats: this.getErrorStats(),
      performance: this.getPerformanceMetrics(),
      isMonitoring: this.isMonitoring
    };
  }

  // Clear error log
  clearErrorLog() {
    this.errorLog = [];
    if (fs.existsSync(this.logFile)) {
      fs.unlinkSync(this.logFile);
    }
    console.log('🗑️ Database error log cleared');
  }

  // Export error log
  exportErrorLog() {
    const exportPath = path.join(__dirname, 'logs', `database-errors-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    const exportData = {
      exportedAt: new Date().toISOString(),
      errors: this.errorLog,
      stats: this.getErrorStats(),
      performance: this.getPerformanceMetrics()
    };
    
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    console.log(`📤 Error log exported to: ${exportPath}`);
    return exportPath;
  }
}

// Create singleton instance
const databaseMonitor = new DatabaseMonitor();

// Auto-start monitoring in production
if (process.env.NODE_ENV === 'production') {
  databaseMonitor.start();
}

module.exports = databaseMonitor;
