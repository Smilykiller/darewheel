const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

let dbInstance = null;

async function getDB() {
    if (dbInstance) return dbInstance;
    
    // This creates a file called 'darewheel.sqlite' right in your backend folder
    dbInstance = await open({
        filename: './darewheel.sqlite',
        driver: sqlite3.Database
    });

    // Automatically create our tables if they don't exist
    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        );
        CREATE TABLE IF NOT EXISTS rooms (
            roomCode TEXT PRIMARY KEY,
            name TEXT,
            mode TEXT,
            host TEXT,
            players TEXT
        );
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_text TEXT,
            question_type TEXT,
            category TEXT,
            difficulty_level INTEGER
        );
    `);

    return dbInstance;
}

module.exports = getDB;