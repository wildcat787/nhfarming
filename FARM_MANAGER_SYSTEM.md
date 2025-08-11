# 🏢 Farm Manager System Documentation

## Overview
The Farm Manager System provides hierarchical access control that allows farm managers to control their assigned farms and users, while maintaining security boundaries between different farms and user levels.

## 🔐 Role-Based Access Control

### System Roles
- **Admin** - Full system access to all farms and users
- **User** - Standard user that can be assigned to farms with specific roles

### Farm-Specific Roles
- **Owner** - Full access to assigned farms (can delete farm)
- **Manager** - Manage farm data and users (cannot delete farm)  
- **Worker** - Read/write access to farm data only

## 🎯 Farm Manager Capabilities

### ✅ What Farm Managers CAN Do:
1. **Farm Management**
   - View and edit farm details (name, description, location, area)
   - Manage all farm data (crops, vehicles, applications, maintenance)
   - View farm statistics and reports

2. **User Management** 
   - View all users assigned to their farms
   - Add new workers to their farms
   - Remove workers from their farms
   - Assign worker-level permissions

3. **Data Access**
   - Full read/write access to all farm data
   - Create and manage fields, crops, and applications
   - Manage vehicle records and maintenance schedules

### ❌ What Farm Managers CANNOT Do:
1. **Restricted Actions**
   - Cannot delete the farm (owner-only)
   - Cannot add or remove other managers or owners
   - Cannot access farms they're not assigned to
   - Cannot promote users to manager or owner roles

2. **System Limitations**
   - No access to system-wide user management
   - Cannot create new farms (unless also an owner)
   - Cannot modify system settings

## 🏗️ Database Schema

### Core Tables
```sql
-- Farms table
CREATE TABLE farms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  total_area REAL,
  area_unit TEXT DEFAULT 'acres',
  owner_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Farm users association table
CREATE TABLE farm_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farm_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL DEFAULT 'worker',
  permissions TEXT DEFAULT 'read',
  assigned_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(farm_id, user_id)
);
```

### Enhanced Data Tables
All main data tables now include `farm_id` for farm-scoped access:
- `vehicles` - Farm vehicles and equipment
- `crops` - Crop records per farm
- `inputs` - Farm inputs and materials
- `applications` - Application records
- `maintenance` - Vehicle maintenance records

## 🔧 API Endpoints

### Farm Management
```
GET    /api/farms           - List user's accessible farms
GET    /api/farms/:id       - Get farm details
POST   /api/farms           - Create new farm (becomes owner)
PUT    /api/farms/:id       - Update farm (manager/owner)
DELETE /api/farms/:id       - Delete farm (owner only)
```

### User Management
```
GET    /api/farms/:id/users      - List farm users (manager/owner)
POST   /api/farms/:id/users      - Add user to farm (manager/owner)
DELETE /api/farms/:id/users/:uid - Remove user from farm (manager/owner)
```

### Permission Middleware
- `requireFarmAccess()` - Basic farm access check
- `requireFarmAdmin()` - Manager or owner access
- `requireFarmUserManagement()` - User management permissions
- `requireFarmOwner()` - Owner-only actions

## 👥 User Management Rules

### Farm Managers Can:
- **Add Workers**: Assign new users as workers to their farms
- **Remove Workers**: Remove worker-level users from their farms
- **View All Users**: See all users assigned to their farms with roles

### Farm Managers Cannot:
- **Manage Managers**: Cannot add, remove, or modify other managers
- **Manage Owners**: Cannot add, remove, or modify farm owners
- **Cross-Farm Access**: Cannot manage users on farms they don't manage

### Hierarchy Enforcement:
```
Admin (System) > Owner (Farm) > Manager (Farm) > Worker (Farm)
```

## 🚀 Getting Started

### 1. Migration
Run the migration script to set up the farm manager system:
```bash
cd backend
node migrate-farm-manager-system.js
```

### 2. Create Test Users
Run the test script to create sample users with different roles:
```bash
cd backend  
node test-farm-manager-system.js
```

### 3. Test Accounts
The system creates these test accounts:
- **FarmManager1** / Manager123! (Farm Manager)
- **FarmWorker1** / Worker123! (Farm Worker)  
- **FarmOwner1** / Owner123! (Farm Owner)

## 📝 Usage Examples

### Assigning a Farm Manager
```javascript
// Add user as manager to farm ID 1
await addUserToFarm(1, userId, 'manager', 'standard', adminUserId);
```

### Checking Permissions
```javascript
// Check if user can manage users on farm
const userRole = await getUserFarmRole(userId, farmId);
if (userRole.canManageUsers) {
  // Allow user management actions
}
```

### API Request with Farm Manager
```javascript
// Farm manager updating farm details
PUT /api/farms/1
Authorization: Bearer <farm-manager-jwt>
{
  "name": "Updated Farm Name",
  "description": "New description"
}
```

## 🔒 Security Features

### Access Control
- JWT-based authentication with role verification
- Farm-scoped data access with automatic filtering
- Hierarchical permission checking at multiple levels

### Data Isolation
- Users can only access farms they're assigned to
- Farm managers cannot see or modify other farms
- System admin maintains oversight of all farms

### Audit Trail
- All user assignments tracked with `assigned_by` field
- Timestamps on all farm and user operations
- Permission changes are logged and traceable

## 🧪 Testing

### Automated Tests
```bash
# Run permission tests
cd backend
node test-farm-manager-system.js

# Verify database migration
node backup-db.js
```

### Manual Testing
1. Login as farm manager: `FarmManager1` / `Manager123!`
2. Try to add a worker to the assigned farm ✅
3. Try to add another manager (should fail) ❌
4. Try to delete the farm (should fail) ❌
5. Try to access a different farm (should fail) ❌

## 📊 Current System Status

### Database
- ✅ Farm management tables created
- ✅ User role assignments functional  
- ✅ Permission middleware implemented
- ✅ API endpoints updated with new permissions

### Test Data
- ✅ 1 Admin user (Daniel)
- ✅ 3 Test users with different roles
- ✅ 2 Test farms with role assignments
- ✅ All permission levels verified

### Features
- ✅ Hierarchical permission system
- ✅ Farm-scoped data access
- ✅ User management with role restrictions
- ✅ Secure API endpoints with middleware
- ✅ Comprehensive error handling

## 🎯 Farm Manager Benefits

### For Farm Owners
- Delegate day-to-day management while retaining control
- Maintain oversight through owner-level access
- Scale operations with trusted managers

### For Farm Managers  
- Full operational control over assigned farms
- User management capabilities for their teams
- Complete access to farm data and operations

### For the System
- Scalable multi-farm management
- Secure data isolation between farms
- Granular permission control at all levels

The Farm Manager System is now fully operational and ready for production use! 🚜
