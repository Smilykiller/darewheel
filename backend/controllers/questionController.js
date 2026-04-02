const getDB = require('../db');

// EMERGENCY BACKUP QUESTIONS (If the database is ever empty, the game uses these instead of crashing!)
const fallbackQuestions = [
    { question_text: "Let the group look through your web search history for 30 seconds.", question_type: "dare", category: "Normal" },
    { question_text: "What is the most embarrassing thing you have ever said to a crush?", question_type: "truth", category: "Normal" },
    { question_text: "Do your best impression of someone in this room.", question_type: "dare", category: "Normal" },
    { question_text: "What is a secret you have never told anyone here?", question_type: "truth", category: "Normal" },
    { question_text: "Let the person to your right send one text from your phone to anyone.", question_type: "dare", category: "Normal" }
];

const getRandomQuestion = async (req, res) => {
    try {
        const db = await getDB();
        
        // Try to pull a random question from your SQLite database
        const question = await db.get('SELECT * FROM questions ORDER BY RANDOM() LIMIT 1');
        
        // If the database has 0 questions inside it, use a fallback!
        if (!question) {
            console.log("⚠️ WARNING: Database is empty! Sending backup question...");
            const randomFallback = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
            return res.json(randomFallback);
        }
        
        // If it found a real question, send it to the frontend!
        res.json(question);
        
    } catch (error) {
        console.error("❌ SQL Error:", error.message);
        // If the database totally crashes, STILL send a question so the game doesn't break!
        const randomFallback = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
        res.json(randomFallback);
    }
};

module.exports = { getRandomQuestion };