const fs = require('fs');
const getDB = require('./db');

const seedDatabase = async () => {
    try {
        const db = await getDB();
        
        await db.run('DELETE FROM questions');
        
        const rawData = fs.readFileSync('raw_questions.txt', 'utf-8');
        const lines = rawData.split('\n');

        let currentCategory = 'Normal';
        let currentType = 'truth'; 
        let questionsAdded = 0;
        let currentQuestionText = "";

        console.log("⏳ Scrubbing text file and injecting questions...");

        await db.run('BEGIN TRANSACTION');
        const stmt = await db.prepare('INSERT INTO questions (question_text, question_type, category, difficulty_level) VALUES (?, ?, ?, ?)');

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            // Ultra-safe cleanup: If it finds a closing bracket, it chops off everything before it
            const bracketIndex = line.indexOf(']');
            if (bracketIndex !== -1) {
                line = line.substring(bracketIndex + 1);
            }
            
            line = line.trim();
            if (!line) continue;

            if (line.includes('MODE 1: COUPLES')) currentCategory = 'Couples';
            else if (line.includes('MODE 2: HARDCORE')) currentCategory = 'Hardcore';
            else if (line.includes('MODE 3: FLIRTY')) currentCategory = 'Flirty';
            else if (line.includes('MODE 4: NORMAL')) currentCategory = 'Normal';
            else if (line.includes('MODE 5: FAMILY-FRIENDLY')) currentCategory = 'Family';

            if (line.includes('Truths (100)')) { currentType = 'truth'; continue; }
            if (line.includes('Offline Dares (100)') || line.includes('Online Dares (100)')) { currentType = 'dare'; continue; }

            let isNewQuestion = false;
            let dotIndex = line.indexOf('.');
            if (dotIndex > 0 && dotIndex < 5) {
                let possibleNumber = line.substring(0, dotIndex);
                if (!isNaN(possibleNumber) && possibleNumber.trim() !== '') {
                    isNewQuestion = true;
                }
            }

            if (isNewQuestion) {
                if (currentQuestionText) {
                    await stmt.run([currentQuestionText, currentType, currentCategory, 1]);
                    questionsAdded++;
                }
                let dotPos = line.indexOf('.');
                currentQuestionText = line.substring(dotPos + 1).trim();
            } else if (currentQuestionText && !line.includes('MODE')) {
                currentQuestionText += " " + line;
            }
        }

        if (currentQuestionText) {
            await stmt.run([currentQuestionText, currentType, currentCategory, 1]);
            questionsAdded++;
        }

        await stmt.finalize();
        await db.run('COMMIT');

        console.log("🎉 SUCCESS! Cleaned and added " + questionsAdded + " questions to darewheel.sqlite!");
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();