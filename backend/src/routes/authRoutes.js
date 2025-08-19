const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);
router.post('/createaccount', authController.createAccount);
router.post('/reset', authController.resetPassword)


// Export router so it can be us
module.exports = router;