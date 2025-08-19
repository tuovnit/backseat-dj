const express = require('express');
const roomController = require('../controllers/roomController');

const router = express.Router();

router.post('/checkroom', roomController.checkRoomExistsByCode);

router.get('/getSettings', roomController.getSettings);

router.get('/getRoomID', roomController.getRoomID);

router.get('/code/:userID', roomController.getRoomCode);

router.get('/getAnimals/:roomID', roomController.getAnimals);

router.get('/summary/:roomID', roomController.generateRoomSummary);	

// Export router so it can be us
module.exports = router;