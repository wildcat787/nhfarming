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
const applicationsRouter = require('../applications');
app.use('/api/applications', applicationsRouter);

describe('Applications API', () => {
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

  describe('GET /api/applications', () => {
    test('should return all applications', async () => {
      const mockApplications = [
        {
          id: 1,
          date: '2024-03-15',
          start_time: '08:00',
          end_time: '12:00',
          rate: 100,
          unit: 'lbs/acre',
          notes: 'Spring fertilizer application',
          crop_type: 'Corn',
          field_name: 'North Field',
          created_by_username: 'testuser'
        },
        {
          id: 2,
          date: '2024-03-20',
          start_time: '09:00',
          end_time: '11:00',
          rate: 50,
          unit: 'lbs/acre',
          notes: 'Herbicide application',
          crop_type: 'Soybeans',
          field_name: 'South Field',
          created_by_username: 'testuser'
        }
      ];

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, mockApplications);
      });

      const response = await request(app)
        .get('/api/applications')
        .expect(200);

      expect(response.body).toEqual(mockApplications);
      expect(mockDb.all).toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'));
      });

      await request(app)
        .get('/api/applications')
        .expect(500);
    });
  });

  describe('GET /api/applications/vehicle/:vehicleId', () => {
    test('should return applications by numeric vehicle ID', async () => {
      const mockApplications = [
        {
          id: 1,
          date: '2024-03-15',
          crop_type: 'Corn',
          field_name: 'North Field',
          input_name: 'NPK Fertilizer',
          input_type: 'fertilizer',
          input_unit: 'lbs/acre'
        }
      ];

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, mockApplications);
      });

      const response = await request(app)
        .get('/api/applications/vehicle/1')
        .expect(200);

      expect(response.body).toEqual(mockApplications);
      expect(mockDb.all).toHaveBeenCalled();
    });

    test('should return applications by vehicle name', async () => {
      const mockApplications = [
        {
          id: 1,
          date: '2024-03-15',
          crop_type: 'Corn',
          field_name: 'North Field',
          input_name: 'NPK Fertilizer',
          input_type: 'fertilizer',
          input_unit: 'lbs/acre'
        }
      ];

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, mockApplications);
      });

      const response = await request(app)
        .get('/api/applications/vehicle/Tractor%201')
        .expect(200);

      expect(response.body).toEqual(mockApplications);
      expect(mockDb.all).toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(new Error('Database error'));
      });

      await request(app)
        .get('/api/applications/vehicle/1')
        .expect(500);
    });
  });

  describe('GET /api/applications/vehicle/name/:vehicleName', () => {
    test('should return applications by vehicle name', async () => {
      const mockApplications = [
        {
          id: 1,
          date: '2024-03-15',
          crop_type: 'Corn',
          field_name: 'North Field',
          input_name: 'NPK Fertilizer',
          input_type: 'fertilizer',
          input_unit: 'lbs/acre'
        }
      ];

      mockDb.all.mockImplementation((sql, params, callback) => {
        callback(null, mockApplications);
      });

      const response = await request(app)
        .get('/api/applications/vehicle/name/Tractor%201')
        .expect(200);

      expect(response.body).toEqual(mockApplications);
      expect(mockDb.all).toHaveBeenCalled();
    });
  });

  describe('POST /api/applications', () => {
    test('should create a new application', async () => {
      const applicationData = {
        date: '2024-03-15',
        start_time: '08:00',
        finish_time: '12:00',
        field_id: 1,
        crop_id: 1,
        tank_mixture_id: 1,
        vehicle_id: 1,
        spray_rate: 100,
        spray_rate_unit: 'lbs/acre',
        notes: 'Spring fertilizer application'
      };

      const mockContext = { lastID: 3 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { lastID: 3 });
      });

      const response = await request(app)
        .post('/api/applications')
        .send(applicationData)
        .expect(200);

      expect(response.body).toHaveProperty('id', 3);
      expect(response.body.date).toBe('2024-03-15');
      expect(response.body.spray_rate).toBe(100);
      expect(mockDb.run).toHaveBeenCalled();
    });

    test('should require date', async () => {
      const applicationData = {
        start_time: '08:00',
        end_time: '12:00',
        field_id: 1,
        rate: 100,
        unit: 'lbs/acre'
        // Missing date
      };

      await request(app)
        .post('/api/applications')
        .send(applicationData)
        .expect(400);
    });

    test('should require field_id', async () => {
      const applicationData = {
        date: '2024-03-15',
        start_time: '08:00',
        end_time: '12:00',
        rate: 100,
        unit: 'lbs/acre'
        // Missing field_id
      };

      await request(app)
        .post('/api/applications')
        .send(applicationData)
        .expect(400);
    });

    test('should require rate', async () => {
      const applicationData = {
        date: '2024-03-15',
        start_time: '08:00',
        end_time: '12:00',
        field_id: 1,
        unit: 'lbs/acre'
        // Missing rate
      };

      await request(app)
        .post('/api/applications')
        .send(applicationData)
        .expect(400);
    });
  });

  describe('PUT /api/applications/:id', () => {
    test('should update an existing application', async () => {
      const updateData = {
        date: '2024-03-16',
        start_time: '09:00',
        end_time: '13:00',
        field_id: 1,
        crop_id: 1,
        input_id: 1,
        vehicle_id: 1,
        rate: 120,
        unit: 'lbs/acre',
        notes: 'Updated application notes'
      };

      const mockContext = { changes: 1 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 1 });
      });

      const response = await request(app)
        .put('/api/applications/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(mockDb.run).toHaveBeenCalled();
    });

    test('should return 404 for non-existent application', async () => {
      const updateData = {
        date: '2024-03-16',
        field_id: 1,
        rate: 120,
        unit: 'lbs/acre'
      };

      const mockContext = { changes: 0 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 0 });
      });

      await request(app)
        .put('/api/applications/999')
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /api/applications/:id', () => {
    test('should delete an existing application', async () => {
      const mockContext = { changes: 1 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 1 });
      });

      const response = await request(app)
        .delete('/api/applications/1')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(mockDb.run).toHaveBeenCalled();
    });

    test('should return 404 for non-existent application', async () => {
      const mockContext = { changes: 0 };
      
      mockDb.run.mockImplementation(function(sql, params, callback) {
        callback.call(mockContext, null, { changes: 0 });
      });

      await request(app)
        .delete('/api/applications/999')
        .expect(404);
    });
  });
}); 