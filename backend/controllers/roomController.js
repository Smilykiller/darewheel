const getDB = require('../db');

const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const createRoom = async (req, res) => {
    // FIX: Safely grab the explicitly passed username so it never crashes
    const { name, mode, username } = req.body;
    const host = username || 'Host'; 
    const roomCode = generateRoomCode();
    const db = await getDB();
    
    try {
        const playersJSON = JSON.stringify([host]);
        await db.run('INSERT INTO rooms (roomCode, name, mode, host, players) VALUES (?, ?, ?, ?, ?)', [roomCode, name, mode, host, playersJSON]);
        res.status(201).json({ roomCode, name, mode, host, players: [host] });
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
};

const joinRoom = async (req, res) => {
    const { roomCode, username } = req.body;
    const playerName = username || 'Player';
    const db = await getDB();
    
    try {
        const room = await db.get('SELECT * FROM rooms WHERE roomCode = ?', [roomCode]);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        
        let players = JSON.parse(room.players);
        if (!players.includes(playerName)) {
            players.push(playerName);
            await db.run('UPDATE rooms SET players = ? WHERE roomCode = ?', [JSON.stringify(players), roomCode]);
        }
        res.json({ roomCode: room.roomCode, name: room.name, mode: room.mode, host: room.host, players });
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
};

module.exports = { createRoom, joinRoom };