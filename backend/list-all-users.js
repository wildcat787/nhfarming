const db = require('./db');

console.log('📋 Current Users in NHFarming Database');
console.log('=====================================');

db.all('SELECT id, username, role, email_verified, created_at FROM users ORDER BY username', (err, users) => {
  if (err) {
    console.error('❌ Error fetching users:', err);
    process.exit(1);
  }
  
  if (users.length === 0) {
    console.log('⚠️  No users found in database');
  } else {
    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.username}`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log(`   👑 Role: ${user.role}`);
      console.log(`   ✅ Verified: ${user.email_verified ? 'Yes' : 'No'}`);
      console.log(`   📅 Created: ${user.created_at || 'Unknown'}`);
      console.log('');
    });
    
    // Summary
    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user').length;
    
    console.log('📊 Summary:');
    console.log(`   👑 Admins: ${adminCount}`);
    console.log(`   👤 Regular Users: ${userCount}`);
    console.log(`   📈 Total Users: ${users.length}`);
  }
  
  console.log('=====================================');
  
  // Show role descriptions
  console.log('\n🔐 Access Levels:');
  console.log('=====================================');
  console.log('👑 Admin:');
  console.log('   • Full access to all features');
  console.log('   • Manage users (view, edit, delete, change roles)');
  console.log('   • Access to Users page');
  console.log('   • System-wide data and reports');
  console.log('   • Administrative functions');
  console.log('');
  console.log('👤 User:');
  console.log('   • Access to core farming features');
  console.log('   • Manage vehicles, crops, inputs, applications');
  console.log('   • View and edit own data');
  console.log('   • No access to user management');
  console.log('   • No access to system-wide reports');
  console.log('=====================================');
  
  process.exit(0);
}); 