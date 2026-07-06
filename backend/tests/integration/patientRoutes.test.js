const request = require('supertest');
const app = require('../../app');
const authService = require('../../services/authService');
require('dotenv').config();

process.env.JWT_SECRET = 'test-secret';

describe('Patient API Integration Tests', () => {
  let token;

  beforeEach(async () => {
    const data = await authService.signup({
      doctorName: 'Dr. Test Integration',
      clinicName: 'Integration Clinic',
      email: 'integration@example.com',
      password: 'password123'
    });
    token = data.token;
  });

  describe('POST /api/patients', () => {
    it('should create a patient when provided valid data and token', async () => {
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          age: 30,
          gender: 'Male',
          address: '123 Main St',
          mobile: '9876543210'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('John Doe');
      expect(res.body.data.patientId).toMatch(/^PT-\d{5}$/);
    });

    it('should reject request without token (401)', async () => {
      const res = await request(app)
        .post('/api/patients')
        .send({
          name: 'John Doe',
          age: 30,
          gender: 'Male',
          address: '123 Main St',
          mobile: '9876543210'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Not authorized to access this route');
    });

    it('should reject request with invalid Zod validation (400)', async () => {
      const res = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'J', 
          age: -5,   
          gender: 'Alien',
          address: '12', 
          mobile: '123' 
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation Error');
      expect(res.body.errors.length).toBeGreaterThan(0);
    });
  });
});
