const authService = require('../../services/authService');
const Doctor = require('../../models/Doctor');
require('dotenv').config();

process.env.JWT_SECRET = 'test-secret';

describe('Auth Service Unit Tests', () => {
  describe('Signup', () => {
    it('should create a new doctor and return a token', async () => {
      const data = {
        doctorName: 'Dr. Test',
        clinicName: 'Test Clinic',
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await authService.signup(data);

      expect(result).toHaveProperty('token');
      expect(result.doctorName).toBe('Dr. Test');
      
      const doctor = await Doctor.findOne({ email: 'test@example.com' });
      expect(doctor).toBeTruthy();
      
      expect(doctor.password).not.toBe('password123');
    });

    it('should throw an error if email already exists', async () => {
      const data = {
        doctorName: 'Dr. Test 2',
        clinicName: 'Test Clinic 2',
        email: 'test@example.com',
        password: 'password123'
      };

      await authService.signup(data);

      await expect(authService.signup(data)).rejects.toThrow('Doctor with this email already exists');
    });
  });

  describe('Login', () => {
    beforeEach(async () => {
      await authService.signup({
        doctorName: 'Dr. Login',
        clinicName: 'Login Clinic',
        email: 'login@example.com',
        password: 'password123'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const result = await authService.login('login@example.com', 'password123');
      expect(result).toHaveProperty('token');
      expect(result.email).toBe('login@example.com');
    });

    it('should throw an error with incorrect password', async () => {
      await expect(authService.login('login@example.com', 'wrongpassword')).rejects.toThrow('Invalid email or password');
    });

    it('should throw an error with non-existent email', async () => {
      await expect(authService.login('nonexistent@example.com', 'password123')).rejects.toThrow('Invalid email or password');
    });
  });
});
