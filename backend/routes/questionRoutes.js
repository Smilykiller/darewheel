const express = require('express');
const router = express.Router();

// We MUST import the exact name we exported in the controller
const { getRandomQuestion } = require('../controllers/questionController');

// When React asks for a random question, trigger that function
router.get('/random', getRandomQuestion);

module.exports = router;