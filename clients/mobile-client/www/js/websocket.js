let ws = null;
const WEBSOCKET_URL = 'ws://localhost:3000';

function connectWebSocket() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        return; // Already connected
    }
    
    ws = new WebSocket(WEBSOCKET_URL);
    
    ws.onopen = () => {
        console.log('WebSocket connected');
        showToast('Connected to server', 'success');
    };
    
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        showToast('Connection error', 'error');
    };
    
    ws.onclose = () => {
        console.log('WebSocket disconnected');
        showToast('Disconnected from server', 'warning');
    };
}

function disconnectWebSocket() {
    if (ws) {
        ws.close();
        ws = null;
    }
}

function sendWebSocketMessage(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    } else {
        showToast('Not connected to server', 'error');
    }
}

function handleWebSocketMessage(message) {
    console.log('Received:', message.type, message.payload);
    
    switch (message.type) {
        case 'CONNECTED':
            console.log('Server acknowledged connection');
            break;
            
        case 'USER_REGISTERED':
            currentUser = message.payload.username;
            currentUserId = message.payload.userId;
            isLoggedIn = true;
            
            // Save to localStorage
            localStorage.setItem('username', currentUser);
            localStorage.setItem('userId', currentUserId);
            
            updateAuthUI();
            showToast(`Welcome, ${currentUser}!`, 'success');
            showPage('play');
            break;
            
        case 'ROOM_CREATED':
            currentRoomId = message.payload.roomId;
            document.getElementById('room-info').classList.remove('hidden');
            document.getElementById('room-id-display').textContent = currentRoomId;
            document.getElementById('waiting-opponent').classList.remove('hidden');
            showToast('Room created! Share the ID with your friend.', 'success');
            break;
            
        case 'ROOM_JOINED':
            currentRoomId = message.payload.roomId;
            myColor = message.payload.players.find(p => p.userId === currentUserId).color;
            showToast('Joined room successfully!', 'success');
            
            if (message.payload.readyToStart) {
                // Start game automatically
                setTimeout(() => {
                    sendWebSocketMessage({
                        type: 'START_GAME',
                        payload: { roomId: currentRoomId }
                    });
                }, 1000);
            }
            break;
            
        case 'OPPONENT_JOINED':
            showToast(`${message.payload.username} joined!`, 'success');
            document.getElementById('waiting-opponent').classList.add('hidden');
            
            // Start game
            setTimeout(() => {
                sendWebSocketMessage({
                    type: 'START_GAME',
                    payload: { roomId: currentRoomId }
                });
            }, 1000);
            break;
            
        case 'GAME_STARTED':
            startGameUI(message.payload);
            break;
            
        case 'MOVE_MADE':
            updateGameBoard(message.payload);
            break;
            
        case 'GAME_OVER':
            handleGameOver(message.payload);
            break;
            
        case 'PLAYER_LEFT':
        case 'PLAYER_DISCONNECTED':
            showToast(`${message.payload.username} left the game`, 'warning');
            setTimeout(() => {
                leaveGame();
            }, 2000);
            break;
            
        case 'ERROR':
            showToast(message.payload.error, 'error');
            break;
    }
}
