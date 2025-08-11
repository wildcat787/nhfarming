const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');

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
const cropsRouter = require('../crops');
app.use('/api/crops', cropsRouter);

describe('Crops API', () => {
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

  describe('GET /api/crops', () => {
    test('should return all crops', async () => {
      const mockCrops = [
        {
          id: 1,
          crop_type: 'Wheat',
          field_id: 1,
          field_name: 'Test Field',
          user_id: 1,
          created_by_username: 'testuser'
        }
      ];

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, mockCrops);
      });

      const response = await request(app)
        .get('/api/crops')
        .expect(200);

      expect(response.body).toEqual(mockCrops);
      expect(mockDb.all).toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'));
      });

      await request(app)
        .get('/api/crops')
        .expect(500);
    });
  });

  describe('POST /api/crops', () => {
    test('should create a new crop', async () => {
      const cropData = {
        crop_type: 'Corn',
        field_id: 1,
        field_name: 'Test Field',
        planting_date: '2024-03-15',
        harvest_date: '2024-08-15',
        notes: 'Test crop'
      };

      // Create a mock object that will be used as 'this' context
      const mockContext = { lastID: 1 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        // Bind the mock context to this function
        callback.call(mockContext, null, { lastID: 1 });
      });

      const response = await request(app)
        .post('/api/crops')
        .send(cropData)
        .expect(201);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body.crop_type).toBe('Corn');
      expect(mockDb.run).toHaveBeenCalled();
    });

    test('should require crop_type', async () => {
      const cropData = {
        field_id: 1,
        field_name: 'Test Field'
      };

      await request(app)
        .post('/api/crops')
        .send(cropData)
        .expect(400);
    });

    test('should require field_id', async () => {
      const cropData = {
        crop_type: 'Corn',
        field_name: 'Test Field'
      };

      await request(app)
        .post('/api/crops')
        .send(cropData)
        .expect(400);
    });
  });

  describe('PUT /api/crops/:id', () => {
    test('should update an existing crop', async () => {
      const updateData = {
        crop_type: 'Updated Wheat',
        field_id: 1,
        field_name: 'Test Field',
        planting_date: '2024-04-01',
        harvest_date: '2024-09-01',
        notes: 'Updated notes'
      };

      const mockContext = { changes: 1 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 1 });
      });

      const response = await request(app)
        .put('/api/crops/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(mockDb.run).toHaveBeenCalled();
    });

    test('should return 404 for non-existent crop', async () => {
      const updateData = {
        crop_type: 'Updated Wheat',
        field_id: 1,
        field_name: 'Test Field'
      };

      const mockContext = { changes: 0 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 0 });
      });

      await request(app)
        .put('/api/crops/999')
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/crops/:id', () => {
    test('should delete an existing crop', async () => {
      const mockContext = { changes: 1 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 1 });
      });

      const response = await request(app)
        .delete('/api/crops/1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(mockDb.run).toHaveBeenCalled();
    });

    test('should return 404 for non-existent crop', async () => {
      const mockContext = { changes: 0 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 0 });
      });

      await request(app)
        .delete('/api/crops/999')
        .expect(404);
    });
  });
}); 