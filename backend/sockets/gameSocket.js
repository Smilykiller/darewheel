const setupSockets = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 Player connected: ${socket.id}`);

        // 1. Join a specific game room channel
        socket.on('join_room', (roomCode, username) => {
            socket.join(roomCode);
            console.log(`${username} joined room: ${roomCode}`);
            
            // Tell everyone else in the room that someone new joined
            socket.to(roomCode).emit('player_joined', { username, socketId: socket.id });
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

        // 4. Handle Disconnects
        socket.on('disconnect', () => {
            console.log(`👋 Player disconnected: ${socket.id}`);
            // Note: In production, you'd find which room they were in and emit a 'player_left' event
        });
    });
};

module.exports = setupSockets;