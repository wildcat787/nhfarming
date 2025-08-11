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
const fieldsRouter = require('../fields');
app.use('/api/fields', fieldsRouter);

describe('Fields API', () => {
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

  describe('GET /api/fields', () => {
    test('should return all fields with counts', async () => {
      const mockFields = [
        {
          id: 1,
          name: 'North Field',
          area: 50,
          area_unit: 'acres',
          application_count: 3,
          crop_count: 2
        },
        {
          id: 2,
          name: 'South Field',
          area: 30,
          area_unit: 'acres',
          application_count: 1,
          crop_count: 1
        }
      ];

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, mockFields);
      });

      const response = await request(app)
        .get('/api/fields')
        .expect(200);

      expect(response.body).toEqual(mockFields);
      expect(mockDb.all).toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'));
      });

      await request(app)
        .get('/api/fields')
        .expect(500);
    });
  });

  describe('GET /api/fields/:id', () => {
    test('should return specific field with history', async () => {
      const mockField = {
        id: 1,
        name: 'North Field',
        area: 50,
        area_unit: 'acres',
        location: 'North side of farm',
        soil_type: 'Loam'
      };

      const mockHistory = [
        {
          type: 'application',
          id: 1,
          date: '2024-03-15',
          rate: 100,
          unit: 'lbs/acre',
          notes: 'Spring fertilizer',
          input_name: 'NPK Fertilizer',
          crop_name: 'Corn',
          vehicle_name: 'Tractor 1'
        },
        {
          type: 'crop',
          id: 1,
          date: '2024-04-01',
          rate: 180,
          unit: 'bushels/acre',
          notes: 'Expected yield',
          input_name: 'Corn',
          crop_name: 'Corn',
          vehicle_name: null
        }
      ];

      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, mockField);
      });

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, mockHistory);
      });

      const response = await request(app)
        .get('/api/fields/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name', 'North Field');
      expect(response.body).toHaveProperty('history');
      expect(response.body.history).toEqual(mockHistory);
    });

    test('should return 404 for non-existent field', async () => {
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, null); // Field not found
      });

      await request(app)
        .get('/api/fields/999')
        .expect(404);
    });

    test('should handle database errors', async () => {
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'));
      });

      await request(app)
        .get('/api/fields/1')
        .expect(500);
    });
  });

  describe('POST /api/fields', () => {
    test('should create a new field', async () => {
      const fieldData = {
        name: 'New Field',
        area: 25,
        area_unit: 'acres',
        location: 'East side',
        coordinates: '40.7128,-74.0060',
        soil_type: 'Clay',
        notes: 'Newly acquired field',
        farm_id: 1
      };

      const mockContext = { lastID: 3 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { lastID: 3 });
      });

      const response = await request(app)
        .post('/api/fields')
        .send(fieldData)
        .expect(201); // Changed from 200 to 201 based on actual implementation

      expect(response.body).toHaveProperty('id', 3);
      expect(response.body.name).toBe('New Field');
      expect(response.body.area).toBe(25);
      expect(mockDb.run).toHaveBeenCalled();
    });

    test('should require field name', async () => {
      const fieldData = {
        area: 25,
        area_unit: 'acres'
        // Missing name
      };

      await request(app)
        .post('/api/fields')
        .send(fieldData)
        .expect(400);
    });

    test('should require area', async () => {
      const fieldData = {
        name: 'New Field',
        area_unit: 'acres'
        // Missing area
      };

      await request(app)
        .post('/api/fields')
        .send(fieldData)
        .expect(400);
    });

    test('should require area_unit', async () => {
      const fieldData = {
        name: 'New Field',
        area: 25
        // Missing area_unit
      };

      await request(app)
        .post('/api/fields')
        .send(fieldData)
        .expect(400);
    });
  });

  describe('PUT /api/fields/:id', () => {
    test('should update an existing field', async () => {
      const updateData = {
        name: 'Updated Field Name',
        area: 30,
        area_unit: 'acres',
        location: 'Updated location',
        soil_type: 'Sandy loam',
        notes: 'Updated notes',
        farm_id: 1
      };

      // Mock the check for existing field
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, { farm_id: 1 });
      });

      const mockContext = { changes: 1 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 1 });
      });

      const response = await request(app)
        .put('/api/fields/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id', '1');
      expect(response.body.name).toBe('Updated Field Name');
      expect(response.body.area).toBe(30);
      expect(mockDb.run).toHaveBeenCalled();
    });

    test('should return 404 for non-existent field', async () => {
      const updateData = {
        name: 'Updated Field Name',
        area: 30,
        area_unit: 'acres',
        farm_id: 1
      };

      // Mock the check for non-existent field
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, null);
      });

      const mockContext = { changes: 0 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 0 });
      });

      await request(app)
        .put('/api/fields/999')
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/fields/:id', () => {
    test('should delete an existing field', async () => {
      // Mock the check for applications and crops
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, { app_count: 0, crop_count: 0 });
      });

      const mockContext = { changes: 1 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 1 });
      });

      const response = await request(app)
        .delete('/api/fields/1')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Field deleted successfully');
      expect(mockDb.run).toHaveBeenCalled();
    });

    test('should return 404 for non-existent field', async () => {
      // Mock the check for applications and crops
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, { app_count: 0, crop_count: 0 });
      });

      const mockContext = { changes: 0 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 0 });
      });

      await request(app)
        .delete('/api/fields/999')
        .expect(404);
    });

    test('should prevent deletion of field with applications', async () => {
      // Mock the check for applications and crops
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, { app_count: 2, crop_count: 0 });
      });

      await request(app)
        .delete('/api/fields/1')
        .expect(400);
    });

    test('should prevent deletion of field with crops', async () => {
      // Mock the check for applications and crops
      mockDb.get.mockImplementation((sql, params, callback) => {
        callback(null, { app_count: 0, crop_count: 1 });
      });

      await request(app)
        .delete('/api/fields/1')
        .expect(400);
    });
  });
}); 