# User Service

**Port:** 3001

## Responsibilities
- User registration with unique usernames
- User data storage (in-memory)
- User validation
- User status tracking

## API Endpoints

### POST /users/register
Register a new user

**Request:**
```json
{
  "username": "player1"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "player1",
    "createdAt": "2025-10-10T10:30:00.000Z"
  }
}
```

### GET /users/:userId
Get user information by ID

**Response (200):**
```json
{
  "success": true,
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "player1",
    "createdAt": "2025-10-10T10:30:00.000Z",
    "isOnline": false
  }
}
```

### GET /users/validate/:userId
Validate if user exists

**Response (200):**
```json
{
  "valid": true,
  "exists": true
}
```

### GET /users
Get all users (debugging)

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "users": [...]
}
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start service:
```bash
npm start
```

4. For development with auto-reload:
```bash
npm run dev
```

## Testing

Test with curl:
```bash
# Register user
curl -X POST http://localhost:3001/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"player1"}'

# Get user
curl http://localhost:3001/users/USER_ID_HERE

# Health check
curl http://localhost:3001/health
```
