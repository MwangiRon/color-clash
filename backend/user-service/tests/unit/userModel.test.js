const UserModel = require('../../src/models/userModel');

describe('UserModel', () => {
  beforeEach(() => {
    UserModel.clearAll();
  });

  describe('createUser', () => {
    it('should create a new user with correct initial state', () => {
      const username = 'TestUser';
      const user = UserModel.createUser(username);

      expect(user).toBeDefined();
      expect(user.userId).toBeDefined();
      expect(user.username).toBe(username);
      expect(user.isOnline).toBe(false);
      expect(user.createdAt).toBeDefined();
    });

    it('should trim username', () => {
      const username = '  TestUser  ';
      const user = UserModel.createUser(username);
      expect(user.username).toBe('TestUser');
    });
  });

  describe('findByUsername', () => {
    it('should find user by username case-insensitive', () => {
      UserModel.createUser('TestUser');
      
      const user1 = UserModel.findByUsername('TestUser');
      const user2 = UserModel.findByUsername('testuser');
      const user3 = UserModel.findByUsername('TESTUSER');

      expect(user1).toBeDefined();
      expect(user2).toBeDefined();
      expect(user3).toBeDefined();
      expect(user1.userId).toBe(user2.userId);
    });

    it('should return null if user not found', () => {
      const user = UserModel.findByUsername('NonExistent');
      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    it('should find user by ID', () => {
      const createdUser = UserModel.createUser('TestUser');
      const foundUser = UserModel.findById(createdUser.userId);
      expect(foundUser).toEqual(createdUser);
    });

    it('should return undefined if user not found', () => {
      const user = UserModel.findById('non-existent-id');
      expect(user).toBeUndefined();
    });
  });

  describe('setOnlineStatus', () => {
    it('should update online status', () => {
      const user = UserModel.createUser('TestUser');
      
      const result1 = UserModel.setOnlineStatus(user.userId, true);
      expect(result1).toBe(true);
      expect(UserModel.findById(user.userId).isOnline).toBe(true);

      const result2 = UserModel.setOnlineStatus(user.userId, false);
      expect(result2).toBe(true);
      expect(UserModel.findById(user.userId).isOnline).toBe(false);
    });

    it('should return false if user does not exist', () => {
      const result = UserModel.setOnlineStatus('non-existent', true);
      expect(result).toBe(false);
    });
  });
});
