const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const getDB = require('./db');

dotenv.config();

const app = express();
const server = http.createServer(app); 

const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true }));
app.use(express.json());

getDB().then(() => console.log('✅ Connected to SQLite locally!')).catch(console.error);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));

require('./sockets/gameSocket')(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log('🚀 Server running on port ' + PORT);
});
