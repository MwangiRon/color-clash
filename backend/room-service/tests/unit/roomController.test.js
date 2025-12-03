const roomController = require('../../src/controllers/roomController');
const RoomModel = require('../../src/models/roomModel');
const httpClient = require('../../src/utils/httpClient');

// Mock dependencies
jest.mock('../../src/models/roomModel');
jest.mock('../../src/utils/httpClient');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('RoomController', () => {
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

  describe('createRoom', () => {
    it('should create a room successfully', async () => {
      req.body.userId = 'user1';
      httpClient.validateUser.mockResolvedValue(true);
      httpClient.getUser.mockResolvedValue({ username: 'User 1' });
      RoomModel.createRoom.mockReturnValue({
        roomId: 'room1',
        status: 'waiting',
        createdAt: 'now',
      });

      await roomController.createRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        room: expect.any(Object)
      }));
    });

    it('should return 400 if userId is missing', async () => {
      await roomController.createRoom(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if user is invalid', async () => {
      req.body.userId = 'user1';
      httpClient.validateUser.mockResolvedValue(false);
      await roomController.createRoom(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('joinRoom', () => {
    it('should join a room successfully', async () => {
      req.params.roomId = 'room1';
      req.body.userId = 'user2';
      
      httpClient.validateUser.mockResolvedValue(true);
      httpClient.getUser.mockResolvedValue({ username: 'User 2' });
      RoomModel.findById.mockReturnValue({
        players: [{ userId: 'user1' }],
      });
      RoomModel.addPlayer.mockReturnValue({
        roomId: 'room1',
        status: 'playing',
        players: [{}, {}],
      });

      await roomController.joinRoom(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true
      }));
    });

    it('should return 400 if room is full', async () => {
      req.params.roomId = 'room1';
      req.body.userId = 'user3';
      
      httpClient.validateUser.mockResolvedValue(true);
      httpClient.getUser.mockResolvedValue({ username: 'User 3' });
      RoomModel.findById.mockReturnValue({
        players: [{}, {}], // Full
      });

      await roomController.joinRoom(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Room is full'
      }));
    });
  });
});
