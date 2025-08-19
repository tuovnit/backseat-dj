const express = require('express');
const userController = require('../controllers/userController')
const router = express.Router();

router.get('/:userid/services', userController.getUserServices)
router.get('/:userid/rooms', userController.getUserRooms)
router.post('/:userid/spotify', userController.updateSpotifyToken)
router.get('/:userid/spotify', userController.getSpotifyToken)

router.get('/profile', userController.getUserProfile)

module.exports = router;