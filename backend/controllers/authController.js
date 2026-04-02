const jwt = require('jsonwebtoken');
const getDB = require('../db');

const registerUser = async (req, res) => {
    const { username, password } = req.body;
    const db = await getDB();
    try {
        const existing = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (existing) return res.status(400).json({ message: 'User already exists' });
        
        await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
        const token = jwt.sign({ username }, process.env.JWT_SECRET || 'darewheel_secret', { expiresIn: '30d' });
        res.status(201).json({ username, token });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    const db = await getDB();
    try {
        const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        
        const token = jwt.sign({ username }, process.env.JWT_SECRET || 'darewheel_secret', { expiresIn: '30d' });
        res.json({ username, token });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// THE MISSING FUNCTION!
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// Make sure all three are exported
module.exports = { registerUser, loginUser, getMe };