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
