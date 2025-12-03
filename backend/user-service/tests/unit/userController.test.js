const userController = require('../../src/controllers/userController');
const UserModel = require('../../src/models/userModel');

// Mock dependencies
jest.mock('../../src/models/userModel');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('UserController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a user successfully', () => {
      req.body.username = 'TestUser';
      UserModel.findByUsername.mockReturnValue(null);
      UserModel.createUser.mockReturnValue({
        userId: 'user1',
        username: 'TestUser',
        createdAt: 'now',
      });

      userController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        user: expect.any(Object)
      }));
    });

    it('should return 400 if username is missing', () => {
      req.body.username = '';
      userController.registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if username is too short', () => {
      req.body.username = 'ab';
      userController.registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 409 if username already exists', () => {
      req.body.username = 'ExistingUser';
      UserModel.findByUsername.mockReturnValue({});
      
      userController.registerUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('getUserById', () => {
    it('should get user by ID', () => {
      req.params.userId = 'user1';
      UserModel.findById.mockReturnValue({
        userId: 'user1',
        username: 'TestUser',
      });

      userController.getUserById(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        user: expect.any(Object)
      }));
    });

    it('should return 404 if user not found', () => {
      req.params.userId = 'user1';
      UserModel.findById.mockReturnValue(null);

      userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('validateUser', () => {
    it('should return valid true if user exists', () => {
      req.params.userId = 'user1';
      UserModel.findById.mockReturnValue({});

      userController.validateUser(req, res);

      expect(res.json).toHaveBeenCalledWith({
        valid: true,
        exists: true
      });
    });

    it('should return valid false if user does not exist', () => {
      req.params.userId = 'user1';
      UserModel.findById.mockReturnValue(null);

      userController.validateUser(req, res);

      expect(res.json).toHaveBeenCalledWith({
        valid: false,
        exists: false
      });
    });
  });
});
