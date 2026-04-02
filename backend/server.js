const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const getDB = require('./db');

dotenv.config();

const app = express();

// 1. OPEN THE EXPRESS GATE (Declared only once!)
app.use(cors({ 
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true 
}));

app.use(express.json());

const server = http.createServer(app); 

// 2. OPEN THE SOCKET.IO GATE (Declared only once!)
const io = new Server(server, {
    cors: { 
        origin: '*', 
        methods: ['GET', 'POST'] 
    }
});

// Database Connection
getDB().then(() => console.log('✅ Connected to SQLite locally!')).catch(console.error);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));

// Game Sockets
require('./sockets/gameSocket')(io);

// Start the Engine
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log('🚀 Server running on port ' + PORT);
});