const fs = require('fs');
const fetch = require('node-fetch');

// Configuration
const PRODUCTION_API_URL = 'https://nhfarming-backend.onrender.com/api';
const LOCAL_DATA_FILE = './local_data_backup.sql';

// Read the local data
const localData = fs.readFileSync(LOCAL_DATA_FILE, 'utf8');

// Parse SQL data
function parseSQLData(sqlData) {
  const users = [];
  const vehicles = [];
  const crops = [];
  const inputs = [];
  const applications = [];
  const maintenance = [];
  const parts = [];

  const lines = sqlData.split('\n');
  let currentTable = null;

  for (const line of lines) {
    if (line.includes('INSERT INTO users')) {
      currentTable = 'users';
      const match = line.match(/INSERT INTO users VALUES\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(',').map(v => v.trim().replace(/'/g, ''));
        users.push({
          id: values[0],
          username: values[1],
          password_hash: values[2],
          role: values[3] || 'user',
          created_at: values[6] || new Date().toISOString()
        });
      }
    } else if (line.includes('INSERT INTO vehicles')) {
      currentTable = 'vehicles';
      const match = line.match(/INSERT INTO vehicles VALUES\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(',').map(v => v.trim().replace(/'/g, ''));
        vehicles.push({
          id: values[0],
          user_id: values[1],
          name: values[2],
          make: values[3],
          model: values[4],
          year: values[5],
          vin: values[6],
          notes: values[7],
          application_type: values[8],
          type: values[9]
        });
      }
    } else if (line.includes('INSERT INTO crops')) {
      currentTable = 'crops';
      const match = line.match(/INSERT INTO crops VALUES\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(',').map(v => v.trim().replace(/'/g, ''));
        crops.push({
          id: values[0],
          user_id: values[1],
          crop_type: values[2],
          field_name: values[3],
          acres: values[4],
          notes: values[5]
        });
      }
    } else if (line.includes('INSERT INTO inputs')) {
      currentTable = 'inputs';
      const match = line.match(/INSERT INTO inputs VALUES\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(',').map(v => v.trim().replace(/'/g, ''));
        inputs.push({
          id: values[0],
          user_id: values[1],
          name: values[2],
          type: values[3],
          unit: values[4],
          notes: values[5]
        });
      }
    } else if (line.includes('INSERT INTO applications')) {
      currentTable = 'applications';
      const match = line.match(/INSERT INTO applications VALUES\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(',').map(v => v.trim().replace(/'/g, ''));
        applications.push({
          id: values[0],
          user_id: values[1],
          crop_id: values[2],
          input_id: values[3],
          vehicle_id: values[4],
          date: values[5],
          start_time: values[6],
          finish_time: values[7],
          rate: values[8],
          unit: values[9],
          weather_temp: values[10],
          weather_humidity: values[11],
          weather_wind: values[12],
          weather_rain: values[13],
          notes: values[14]
        });
      }
    } else if (line.includes('INSERT INTO maintenance')) {
      currentTable = 'maintenance';
      const match = line.match(/INSERT INTO maintenance VALUES\(([^)]+)\)/);
      if (match) {
        const values = match[1].split(',').map(v => v.trim().replace(/'/g, ''));
        maintenance.push({
          id: values[0],
          user_id: values[1],
          vehicle_id: values[2],
          date: values[3],
          description: values[4],
          cost: values[5],
          notes: values[6]
        });
      }
    }
  }

  return { users, vehicles, crops, inputs, applications, maintenance, parts };
}

// Upload data to production
async function uploadData(data) {
  console.log('🚜 Starting data migration to production...\n');

  try {
    // First, create a test user to get authentication
    console.log('1. Creating test user for migration...');
    const testUserResponse = await fetch(`${PRODUCTION_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'migration_user',
        password: 'migration_pass_123'
      })
    });

    if (!testUserResponse.ok) {
      const error = await testUserResponse.json();
      if (error.error !== 'Username already exists') {
        throw new Error(`Failed to create test user: ${error.error}`);
      }
    }

    // Login to get token
    console.log('2. Logging in to get authentication token...');
    const loginResponse = await fetch(`${PRODUCTION_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'migration_user',
        password: 'migration_pass_123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Failed to login');
    }

    const { token } = await loginResponse.json();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Upload users
    console.log('3. Uploading users...');
    for (const user of data.users) {
      if (user.username !== 'migration_user') {
        try {
          await fetch(`${PRODUCTION_API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: user.username,
              password: 'default_password_123' // Set a default password
            })
          });
          console.log(`   ✅ User: ${user.username}`);
        } catch (error) {
          console.log(`   ⚠️  User ${user.username} might already exist`);
        }
      }
    }

    // Upload vehicles
    console.log('4. Uploading vehicles...');
    for (const vehicle of data.vehicles) {
      try {
        await fetch(`${PRODUCTION_API_URL}/vehicles`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: vehicle.name,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            vin: vehicle.vin,
            notes: vehicle.notes,
            application_type: vehicle.application_type,
            type: vehicle.type
          })
        });
        console.log(`   ✅ Vehicle: ${vehicle.name}`);
      } catch (error) {
        console.log(`   ❌ Failed to upload vehicle: ${vehicle.name}`);
      }
    }

    // Upload crops
    console.log('5. Uploading crops...');
    for (const crop of data.crops) {
      try {
        await fetch(`${PRODUCTION_API_URL}/crops`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            crop_type: crop.crop_type,
            field_name: crop.field_name,
            acres: crop.acres,
            notes: crop.notes
          })
        });
        console.log(`   ✅ Crop: ${crop.crop_type} - ${crop.field_name}`);
      } catch (error) {
        console.log(`   ❌ Failed to upload crop: ${crop.crop_type}`);
      }
    }

    // Upload inputs
    console.log('6. Uploading inputs...');
    for (const input of data.inputs) {
      try {
        await fetch(`${PRODUCTION_API_URL}/inputs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: input.name,
            type: input.type,
            unit: input.unit,
            notes: input.notes
          })
        });
        console.log(`   ✅ Input: ${input.name}`);
      } catch (error) {
        console.log(`   ❌ Failed to upload input: ${input.name}`);
      }
    }

    // Upload applications
    console.log('7. Uploading applications...');
    for (const app of data.applications) {
      try {
        await fetch(`${PRODUCTION_API_URL}/applications`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            crop_id: app.crop_id,
            input_id: app.input_id,
            vehicle_id: app.vehicle_id,
            date: app.date,
            start_time: app.start_time,
            finish_time: app.finish_time,
            rate: app.rate,
            unit: app.unit,
            weather_temp: app.weather_temp,
            weather_humidity: app.weather_humidity,
            weather_wind: app.weather_wind,
            weather_rain: app.weather_rain,
            notes: app.notes
          })
        });
        console.log(`   ✅ Application: ${app.date} - ${app.notes || 'No notes'}`);
      } catch (error) {
        console.log(`   ❌ Failed to upload application: ${app.date}`);
      }
    }

    // Upload maintenance
    console.log('8. Uploading maintenance records...');
    for (const maint of data.maintenance) {
      try {
        await fetch(`${PRODUCTION_API_URL}/maintenance`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            vehicle_id: maint.vehicle_id,
            date: maint.date,
            description: maint.description,
            cost: maint.cost,
            notes: maint.notes
          })
        });
        console.log(`   ✅ Maintenance: ${maint.date} - ${maint.description}`);
      } catch (error) {
        console.log(`   ❌ Failed to upload maintenance: ${maint.date}`);
      }
    }

    console.log('\n🎉 Data migration completed!');
    console.log('\n📋 Summary:');
    console.log(`   Users: ${data.users.length}`);
    console.log(`   Vehicles: ${data.vehicles.length}`);
    console.log(`   Crops: ${data.crops.length}`);
    console.log(`   Inputs: ${data.inputs.length}`);
    console.log(`   Applications: ${data.applications.length}`);
    console.log(`   Maintenance: ${data.maintenance.length}`);

    console.log('\n🔐 Login Credentials:');
    console.log('   Username: migration_user');
    console.log('   Password: migration_pass_123');
    console.log('\n   Or use your original usernames with password: default_password_123');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

// Run the migration
const parsedData = parseSQLData(localData);
uploadData(parsedData); 