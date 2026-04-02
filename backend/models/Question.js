const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    mode: { 
        type: String, 
        enum: ['couples', 'hardcore', 'flirty', 'normal', 'family_friendly'], 
        required: true 
    },
    category: { type: String, required: true },
    question_type: { 
        type: String, 
        enum: ['truth', 'offline_dare', 'online_dare'], 
        required: true 
    },
    question_text: { type: String, required: true },
    difficulty_level: { type: Number, min: 1, max: 4, default: 2 },
    cross_mode_compatible: { type: Boolean, default: false },
    age_restriction: { type: Number, default: 13 },
    is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);