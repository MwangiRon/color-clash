const RoomModel = require('../../src/models/roomModel');
const { GAME_CONSTANTS } = require('../../../shared-utils/constants');

describe('RoomModel', () => {
  beforeEach(() => {
    RoomModel.clearAll();
  });

  describe('createRoom', () => {
    it('should create a new room with correct initial state', () => {
      const userId = 'user1';
      const username = 'User 1';
      const room = RoomModel.createRoom(userId, username);

      expect(room).toBeDefined();
      expect(room.roomId).toBeDefined();
      expect(room.status).toBe(GAME_CONSTANTS.ROOM_STATUS.WAITING);
      expect(room.players).toHaveLength(1);
      expect(room.players[0]).toEqual(expect.objectContaining({
        userId,
        username,
        color: GAME_CONSTANTS.COLORS.RED
      }));
      expect(room.createdAt).toBeDefined();
    });
  });

  describe('addPlayer', () => {
    it('should add a second player and start the game', () => {
      const room = RoomModel.createRoom('user1', 'User 1');
      const updatedRoom = RoomModel.addPlayer(room.roomId, 'user2', 'User 2');

      expect(updatedRoom.players).toHaveLength(2);
      expect(updatedRoom.players[1]).toEqual(expect.objectContaining({
        userId: 'user2',
        username: 'User 2',
        color: GAME_CONSTANTS.COLORS.BLUE
      }));
      expect(updatedRoom.status).toBe(GAME_CONSTANTS.ROOM_STATUS.PLAYING);
      expect(updatedRoom.startedAt).toBeDefined();
    });

    it('should throw error if room is full', () => {
      const room = RoomModel.createRoom('user1', 'User 1');
      RoomModel.addPlayer(room.roomId, 'user2', 'User 2');

      expect(() => {
        RoomModel.addPlayer(room.roomId, 'user3', 'User 3');
      }).toThrow('Room is full');
    });

    it('should return null if room does not exist', () => {
      const result = RoomModel.addPlayer('non-existent', 'user2', 'User 2');
      expect(result).toBeNull();
    });
  });

  describe('removePlayer', () => {
    it('should remove player and delete room if empty', () => {
      const room = RoomModel.createRoom('user1', 'User 1');
      const result = RoomModel.removePlayer(room.roomId, 'user1');

      expect(result).toBe(true);
      expect(RoomModel.findById(room.roomId)).toBeUndefined();
    });

    it('should remove player and finish game if playing', () => {
      const room = RoomModel.createRoom('user1', 'User 1');
      RoomModel.addPlayer(room.roomId, 'user2', 'User 2');
      
      const result = RoomModel.removePlayer(room.roomId, 'user1');

      expect(result).toBe(true);
      const updatedRoom = RoomModel.findById(room.roomId);
      expect(updatedRoom.players).toHaveLength(1);
      expect(updatedRoom.status).toBe(GAME_CONSTANTS.ROOM_STATUS.FINISHED);
      expect(updatedRoom.finishedAt).toBeDefined();
    });

    it('should return false if room does not exist', () => {
      const result = RoomModel.removePlayer('non-existent', 'user1');
      expect(result).toBe(false);
    });
  });

  describe('updateStatus', () => {
    it('should update room status', () => {
      const room = RoomModel.createRoom('user1', 'User 1');
      const result = RoomModel.updateStatus(room.roomId, GAME_CONSTANTS.ROOM_STATUS.FINISHED);

      expect(result).toBe(true);
      const updatedRoom = RoomModel.findById(room.roomId);
      expect(updatedRoom.status).toBe(GAME_CONSTANTS.ROOM_STATUS.FINISHED);
      expect(updatedRoom.finishedAt).toBeDefined();
    });
  });
});
