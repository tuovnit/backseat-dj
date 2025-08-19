const express = require('express');
const queueController = require('../controllers/queueController');

const router = express.Router();

// Adding and removing from 
router.get('/add', queueController.addSong);
router.put('/remove', queueController.removeSong);

// Fetching queue
router.get('/get', queueController.getQueue);
router.get('/next', queueController.getNext);
router.get('/currently-playing', queueController.getCurrSong);

// Export router so it can be us
module.exports = router;