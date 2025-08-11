const request = require('supertest');
const express = require('express');

// Create test app
const app = express();
app.use(express.json());

// Mock the database module
const mockDb = {
  all: jest.fn(),
  run: jest.fn(),
  get: jest.fn()
};

// Mock the auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = { id: 1, username: 'testuser', role: 'user' };
  next();
};

const mockFilterByUserFarms = (req, res, next) => {
  req.userFarms = [1, 2, 3]; // Mock user has access to farms 1, 2, 3
  next();
};

const mockRequireFarmAccess = (req, res, next) => {
  req.farmAccess = { role: 'owner', farm_id: 1 };
  next();
};

// Apply mocks
jest.mock('../auth', () => ({
  authMiddleware: jest.fn((req, res, next) => mockAuthMiddleware(req, res, next))
}));

jest.mock('../permissions', () => ({
  filterByUserFarms: jest.fn(() => mockFilterByUserFarms),
  requireFarmAccess: jest.fn(() => mockRequireFarmAccess)
}));

jest.mock('../db', () => mockDb);

// Import the router after mocking
const vehiclesRouter = require('../vehicles');
app.use('/api/vehicles', vehiclesRouter);

describe('Vehicles API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset database mock to default state
    mockDb.all.mockImplementation((sql, params, callback) => {
      callback(null, []);
    });
    mockDb.run.mockImplementation(function(sql, params, callback) {
      callback(null, { lastID: 1, changes: 1 });
    });
    mockDb.get.mockImplementation((sql, params, callback) => {
      callback(null, null);
    });
  });

  describe('GET /api/vehicles', () => {
    test('should return all vehicles for user farms', async () => {
      const mockVehicles = [
        {
          id: 1,
          name: 'Tractor 1',
          make: 'John Deere',
          model: '6120M',
          year: 2020,
          farm_id: 1,
          application_type: 'sprayer'
        },
        {
          id: 2,
          name: 'Sprayer 1',
          make: 'Case IH',
          model: 'Sprayer 3230',
          year: 2019,
          farm_id: 1,
          application_type: 'sprayer'
        }
      ];

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, mockVehicles);
      });

      const response = await request(app)
        .get('/api/vehicles')
        .expect(200);

      expect(response.body).toEqual(mockVehicles);
      expect(mockDb.all).toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'));
      });

      await request(app)
        .get('/api/vehicles')
        .expect(500);
    });
  });

  describe('GET /api/vehicles/name/:name', () => {
    test('should return vehicle by name', async () => {
      const mockVehicle = {
        id: 1,
        name: 'Tractor 1',
        make: 'John Deere',
        model: '6120M',
        year: 2020,
        farm_id: 1,
        application_type: 'sprayer'
      };

      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, mockVehicle);
      });

      const response = await request(app)
        .get('/api/vehicles/name/Tractor%201')
        .expect(200);

      expect(response.body).toEqual(mockVehicle);
      expect(mockDb.get).toHaveBeenCalled();
    });

    test('should return 404 for non-existent vehicle', async () => {
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, null); // Vehicle not found
      });

      await request(app)
        .get('/api/vehicles/name/NonexistentVehicle')
        .expect(404);
    });

    test('should handle database errors', async () => {
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'));
      });

      await request(app)
        .get('/api/vehicles/name/Tractor%201')
        .expect(500);
    });
  });

  describe('POST /api/vehicles', () => {
    test('should create a new vehicle', async () => {
      const vehicleData = {
        name: 'New Tractor',
        make: 'New Holland',
        model: 'T7.270',
        year: 2021,
        vin: '1HGBH41JXMN109186',
        notes: 'New acquisition',
        application_type: 'tractor',
        type: 'tractor',
        farm_id: 1
      };

      // Mock farm access check
      mockDb.get.mockImplementation((sql, params, callback) => {
        if (sql.includes('farm_users')) {
          callback(null, { id: 1 }); // User has access
        } else if (sql.includes('vehicles WHERE name')) {
          callback(null, null); // No existing vehicle with same name
        }
      });

      const mockContext = { lastID: 3 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { lastID: 3 });
      });

      const response = await request(app)
        .post('/api/vehicles')
        .send(vehicleData)
        .expect(200);

      expect(response.body).toHaveProperty('id', 3);
      expect(response.body.name).toBe('New Tractor');
      expect(response.body.farm_id).toBe(1);
      expect(mockDb.run).toHaveBeenCalled();
    });

    test('should require vehicle name', async () => {
      const vehicleData = {
        make: 'New Holland',
        model: 'T7.270',
        farm_id: 1
        // Missing name
      };

      await request(app)
        .post('/api/vehicles')
        .send(vehicleData)
        .expect(400);
    });

    test('should require farm_id', async () => {
      const vehicleData = {
        name: 'New Tractor',
        make: 'New Holland',
        model: 'T7.270'
        // Missing farm_id
      };

      await request(app)
        .post('/api/vehicles')
        .send(vehicleData)
        .expect(400);
    });



    test('should reject duplicate vehicle name in same farm', async () => {
      const vehicleData = {
        name: 'Existing Tractor',
        make: 'New Holland',
        model: 'T7.270',
        farm_id: 1
      };

      // Mock farm access check
      mockDb.get.mockImplementation((sql, params, callback) => {
        if (sql.includes('farm_users')) {
          callback(null, { id: 1 }); // User has access
        } else if (sql.includes('vehicles WHERE name')) {
          callback(null, { id: 1 }); // Existing vehicle with same name
        }
      });

      await request(app)
        .post('/api/vehicles')
        .send(vehicleData)
        .expect(400);
    });
  });

  describe('PUT /api/vehicles/name/:name', () => {
    test('should update an existing vehicle', async () => {
      const updateData = {
        name: 'Updated Tractor',
        make: 'Updated Make',
        model: 'Updated Model',
        year: 2022,
        vin: 'Updated VIN',
        notes: 'Updated notes',
        application_type: 'tractor',
        type: 'tractor'
      };

      // Mock check for existing vehicle with new name
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, null); // No existing vehicle with new name
      });

      const mockContext = { changes: 1 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 1 });
      });

      const response = await request(app)
        .put('/api/vehicles/name/Tractor%201')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(mockDb.run).toHaveBeenCalled();
    });

    test('should return 404 for non-existent vehicle', async () => {
      const updateData = {
        name: 'Updated Tractor',
        make: 'Updated Make'
      };

      const mockContext = { changes: 0 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 0 });
      });

      await request(app)
        .put('/api/vehicles/name/NonexistentVehicle')
        .send(updateData)
        .expect(404);
    });

    test('should reject duplicate vehicle name', async () => {
      const updateData = {
        name: 'Existing Tractor',
        make: 'Updated Make'
      };

      // Mock check for existing vehicle with new name
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, { id: 2 }); // Existing vehicle with new name
      });

      await request(app)
        .put('/api/vehicles/name/Tractor%201')
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /api/vehicles/name/:name', () => {
    test('should delete an existing vehicle', async () => {
      const mockContext = { changes: 1 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 1 });
      });

      const response = await request(app)
        .delete('/api/vehicles/name/Tractor%201')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(mockDb.run).toHaveBeenCalled();
    });

    test('should return 404 for non-existent vehicle', async () => {
      const mockContext = { changes: 0 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 0 });
      });

      await request(app)
        .delete('/api/vehicles/name/NonexistentVehicle')
        .expect(404);
    });
  });
}); 