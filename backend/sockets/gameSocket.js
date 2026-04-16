const cloudinary = require('cloudinary').v2; // Import Cloudinary

// Memory Structure: { "ROOM123": { players: [], mediaIds: [] } }
const activeRooms = {}; 

const setupSockets = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 Player connected: ${socket.id}`);

        socket.on('join_room', (roomCode, username) => {
            socket.join(roomCode);
            
            // Create room structure if it doesn't exist
            if (!activeRooms[roomCode]) {
                activeRooms[roomCode] = { players: [], mediaIds: [] };
            }

            const newPlayer = { id: socket.id, username: username };
            activeRooms[roomCode].players.push(newPlayer);

            socket.emit('room_data', activeRooms[roomCode].players);
            socket.to(roomCode).emit('player_joined', newPlayer);
        });

        // --- NEW: THE UNIVERSAL CHAT ENGINE ---
        socket.on('send_message', (messageData) => {
            // If the message has media, save the Cloudinary Public ID to the room's memory
            if (messageData.publicId) {
                if (activeRooms[messageData.roomCode]) {
                    activeRooms[messageData.roomCode].mediaIds.push(messageData.publicId);
                    console.log(`📝 Tracked media ${messageData.publicId} for room ${messageData.roomCode}`);
                }
            }
            // Broadcast to the room
            io.to(messageData.roomCode).emit('receive_message', messageData);
        });
        // --- GAME STATE COMMANDS ---
        socket.on('start_game', ({ roomCode, mode }) => {
            console.log(`🚀 Game started in room ${roomCode} with mode: ${mode}`);
            // Broadcast the start command to everyone in the room
            io.to(roomCode).emit('game_started', { mode });
        });

        // --- ROOM CLEANUP LOGIC ---
        socket.on('disconnect', async () => {
            console.log(`👋 Player disconnected: ${socket.id}`);
            
            for (const roomCode in activeRooms) {
                const room = activeRooms[roomCode];
                const playerIndex = room.players.findIndex(p => p.id === socket.id);
                
                if (playerIndex !== -1) {
                    room.players.splice(playerIndex, 1);
                    io.to(roomCode).emit('player_left', socket.id);
                    
                    // IF THE ROOM IS NOW EMPTY -> INITIATE SELF-DESTRUCT
                    if (room.players.length === 0) {
                        console.log(`🧹 Room ${roomCode} is empty. Commencing cleanup...`);
                        
                        if (room.mediaIds.length > 0) {
                            try {
                                // Tell Cloudinary to delete the tracked files
                                await cloudinary.api.delete_resources(room.mediaIds);
                                console.log(`✅ Deleted ${room.mediaIds.length} media files for room ${roomCode}`);
                            } catch (error) {
                                console.error(`❌ Failed to delete media for room ${roomCode}:`, error);
                            }
                        }
                        // Delete the room from server memory
                        delete activeRooms[roomCode];
                    }
                    break; 
                }
            }
        });
    });
};

module.exports = setupSockets;