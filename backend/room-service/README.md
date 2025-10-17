**Port:** 3002

## Responsibilities
- Create game rooms
- Manage room lifecycle (waiting, playing, finished)
- Handle player joining/leaving
- Validate players via User Service

## API Endpoints

### POST /rooms
Create a new room

**Request:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (201):**
```json
{
  "success": true,
  "room": {
    "roomId": "abc123...",
    "status": "waiting",
    "createdBy": "player1",
    "createdAt": "2025-10-10T10:30:00.000Z"
  }
}
```

### GET /rooms/:roomId
Get room information

**Response (200):**
```json
{
  "success": true,
  "room": {
    "roomId": "abc123...",
    "status": "playing",
    "players": [
      {
        "userId": "...",
        "username": "player1",
        "color": "red",
        "joinedAt": "..."
      },
      {
        "userId": "...",
        "username": "player2",
        "color": "blue",
        "joinedAt": "..."
      }
    ],
    "createdAt": "...",
    "startedAt": "..."
  }
}
```

### POST /rooms/:roomId/join
Join a room

**Request:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200):**
```json
{
  "success": true,
  "room": {
    "roomId": "abc123...",
    "status": "playing",
    "players": [...],
    "readyToStart": true
  }
}
```

### GET /rooms/:roomId/status
Get room status

**Response (200):**
```json
{
  "success": true,
  "roomId": "abc123...",
  "status": "playing",
  "playerCount": 2,
  "isFull": true
}
```

### POST /rooms/:roomId/leave
Leave a room

**Request:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Service-to-Service Communication

This service calls User Service to:
- Validate users before creating/joining rooms
- Get user details (username)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Make sure User Service is running on port 3001

4. Start service:
```bash
npm start
```

## Testing

Test with curl:
```bash
# Create room (replace USER_ID with actual user ID from User Service)
curl -X POST http://localhost:3002/rooms \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_HERE"}'

# Join room (replace ROOM_ID and USER_ID)
curl -X POST http://localhost:3002/rooms/ROOM_ID/join \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID_HERE"}'

# Get room
curl http://localhost:3002/rooms/ROOM_ID

# Health check
curl http://localhost:3002/health
```