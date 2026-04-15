const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const getDB = require('./db');
const path = require('path');

dotenv.config();

const app = express();
const cloudinary = require('cloudinary').v2;
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
// 1. OPEN THE EXPRESS GATE (Declared only once!)
app.use(cors({ 
    origin: 'https://darewheel-game.onrender.com', // MUST be your exact frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    credentials: true 
}));

app.use(express.json());

const server = http.createServer(app); 

// 2. OPEN THE SOCKET.IO GATE (Declared only once!)
const io = new Server(server, {
    cors: { 
        origin: 'https://darewheel-game.onrender.com', // MUST be your exact frontend URL
        methods: ['GET', 'POST'],
        credentials: true
    }
});
// Database Connection
getDB().then(() => console.log('✅ Connected to SQLite locally!')).catch(console.error);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
// ...
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));

// ---------------------------------------------------------
// NEW MONOLITHIC CODE: Serve the React Frontend
// ---------------------------------------------------------
const frontendBuildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendBuildPath));

// Catch-all route: If they ask for any link that isn't an API, give them the React app!
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
});
// ---------------------------------------------------------

require('./sockets/gameSocket')(io);


// Game Sockets
require('./sockets/gameSocket')(io);

// Start the Engine
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log('🚀 Server running on port ' + PORT);
});