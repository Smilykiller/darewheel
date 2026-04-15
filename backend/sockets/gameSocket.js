// This acts as the backend's memory so it knows exactly who is in which room!
const activeRooms = {}; 

const setupSockets = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 Player connected: ${socket.id}`);

        // 1. Join a specific game room channel
        socket.on('join_room', (roomCode, username) => {
            socket.join(roomCode);
            console.log(`${username} joined room: ${roomCode}`);
            
            // If this room doesn't exist in memory yet, create it
            if (!activeRooms[roomCode]) {
                activeRooms[roomCode] = [];
            }

            // Create the official player object
            const newPlayer = { id: socket.id, username: username };
            
            // Add the player to the room's memory
            activeRooms[roomCode].push(newPlayer);

            // A. Tell the person who JUST joined who is already sitting in the room
            socket.emit('room_data', activeRooms[roomCode]);

            // B. Tell everyone ELSE in the room that someone new joined
            socket.to(roomCode).emit('player_joined', newPlayer);
            // --- THE UNIVERSAL CHAT ENGINE ---
socket.on('send_message', (messageData) => {
    // messageData will contain: roomCode, username, text, mediaUrl, mediaType
    
    // Broadcast the message to EVERYONE in the room, including the sender
    io.to(messageData.roomCode).emit('receive_message', messageData);
});
        
        });

        // 2. THE BOTTLE SPIN SYNC
        // When a player swipes the bottle on their screen, they send the velocity/force here
        socket.on('spin_bottle', ({ roomCode, velocity, angle }) => {
            // Broadcast the exact swipe math to ALL OTHER PLAYERS in the room instantly
            // so their screens animate the bottle identically
            socket.to(roomCode).emit('bottle_is_spinning', { velocity, angle });
        });

        // 5. Start the Game
        socket.on('start_game', ({ roomCode, mode }) => {
            // Broadcast to the whole room to change screens
            socket.to(roomCode).emit('game_started', { mode });
        });

        // 3. When the bottle finishes spinning
        socket.on('bottle_stopped', ({ roomCode, selectedPlayerId }) => {
            // The backend confirms who it landed on and tells the whole room
            io.to(roomCode).emit('turn_assigned', { selectedPlayerId });
        });

        // 4. Handle Disconnects (Now completely functional!)
        socket.on('disconnect', () => {
            console.log(`👋 Player disconnected: ${socket.id}`);
            
            // Search all active rooms to find the player who left
            for (const roomCode in activeRooms) {
                const roomPlayers = activeRooms[roomCode];
                const playerIndex = roomPlayers.findIndex(p => p.id === socket.id);
                
                // If we found the player in this room...
                if (playerIndex !== -1) {
                    // 1. Remove them from the server memory
                    roomPlayers.splice(playerIndex, 1);
                    
                    // 2. Tell the remaining players to remove them from the UI
                    io.to(roomCode).emit('player_left', socket.id);
                    
                    // 3. Optional cleanup: If the room is now empty, delete it from memory entirely
                    if (roomPlayers.length === 0) {
                        delete activeRooms[roomCode];
                    }
                    break; // Stop searching once we found them
                }
            }
        });
    });
};

module.exports = setupSockets;