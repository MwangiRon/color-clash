# Color Clash

Color Clash is a modern 4x4 strategy game where players compete to align 4 pieces of their color. It features a microservices-based backend and a real-time multiplayer experience.

## Architecture

The project is structured as a monorepo with a microservices backend and a web client.

### Backend (`/backend`)

The backend consists of four Node.js/Express services:

*   **`websocket-gateway`** (Port 3000): The main entry point for clients. Handles WebSocket connections and routes messages to appropriate services.
*   **`user-service`** (Port 3001): Manages user accounts and authentication.
*   **`room-service`** (Port 3002): Handles room creation, joining, and management.
*   **`game-engine-service`** (Port 3003): Contains the core game logic and rules.

### Frontend (`/clients/web-client`)

A vanilla JavaScript application using Tailwind CSS for styling. It connects to the `websocket-gateway` to provide real-time gameplay.

## Getting Started

### Prerequisites

*   Node.js (v16+ recommended)
*   npm

### Installation & Running

1.  **Install Dependencies**
    You need to install dependencies for each service.
    ```bash
    cd backend/websocket-gateway && npm install
    cd ../user-service && npm install
    cd ../room-service && npm install
    cd ../game-engine-service && npm install
    ```

2.  **Start Backend Services**
    Start each service in a separate terminal window:
    ```bash
    # Terminal 1
    cd backend/websocket-gateway && npm start

    # Terminal 2
    cd backend/user-service && npm start

    # Terminal 3
    cd backend/room-service && npm start

    # Terminal 4
    cd backend/game-engine-service && npm start
    ```

3.  **Run Frontend**
    Open `clients/web-client/index.html` in your web browser. For the best experience, use a local development server (e.g., Live Server in VS Code or `npx serve clients/web-client`).

## Features

*   **Real-time Multiplayer**: Play against friends or random opponents.
*   **Practice Mode**: Play against an AI locally.
*   **Power Moves**: Special abilities to flip opponent pieces.
*   **Responsive Design**: Works on desktop and mobile.
